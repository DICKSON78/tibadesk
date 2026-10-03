<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientWaitingTime;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientWaitingTimesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of patient waiting times with real-time data
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            // Debug: Log the request and user information
            \Log::info('Patient waiting times index request', [
                'user' => $request->user() ? $request->user()->id : 'no user',
                'headers' => $request->headers->all(),
                'request_data' => $request->all()
            ]);

            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'status' => 'sometimes|in:waiting,in_treatment,completed',
                'date' => 'sometimes|date_format:Y-m-d',
                'department' => 'sometimes|string',
            ]);

            // Automatically check and complete stuck patients before fetching data
            try {
                $this->autoCompleteStuckPatients($request);
            } catch (\Exception $e) {
                \Log::error('Error in autoCompleteStuckPatients: ' . $e->getMessage());
                // Continue with the request even if auto-completion fails
            }

            $user = $request->user();
            $per_page = $request->per_page ?? 50;
            $status = $request->status;
            $date = $request->date ?? now()->format('Y-m-d');
            $department = $request->department;

            // Validate date is not too far in the future
            $requestedDate = \Carbon\Carbon::parse($date);
            $today = \Carbon\Carbon::today();
            
            if ($requestedDate->gt($today->addDays(7))) {
                // If date is more than 7 days in the future, use today's date
                $date = $today->format('Y-m-d');
                \Log::warning('Patient waiting times: Date too far in future, using today', [
                    'requested_date' => $request->date,
                    'using_date' => $date
                ]);
            }

            $query = PatientWaitingTime::with(['patient', 'doctor'])
                        ->whereDate('registration_time', $date);

            // Default allow: only restrict by clinic if user exists and is not admin
            if ($user && !$user->is_admin) {
                $query->whereHas('patient.creator', function ($q) use ($user) {
                    $q->where('clinic_id', $user->clinic_id);
                });
            }

            if ($status) {
                $query->where('patient_waiting_times.status', $status);
            }

            if ($department) {
                $query->where('current_department', $department);
            }

            $query->orderBy('registration_time', 'asc');
            $data = $query->paginate($per_page);

            // Ensure current_department is consistent with department history for all records
            $data->getCollection()->each(function ($item) {
                if ($item->department_history) {
                    $lastEntry = collect($item->department_history)->last();
                    if ($lastEntry && (!$item->current_department || $item->current_department !== $lastEntry['department'])) {
                        $item->current_department = $lastEntry['department'];
                        $item->save();
                    }
                }
                
                // Assign consulting doctor if patient is in consultation without a doctor
                if ($item->current_department === 'consultation' && !$item->doctor_id) {
                    $item->assignConsultingDoctor();
                }
                
                        // Check if patient should be in cashier based on payment status
        $patient = $item->patient;
        if ($patient) {
            // Get payment cache through check-ins for the same date
            $checkIn = $patient->check_ins()->whereDate('created_at', $item->registration_time->format('Y-m-d'))->first();
            if ($checkIn) {
                $paymentCache = $checkIn->payment_cache;
                if ($paymentCache) {
                    $pendingItems = $paymentCache->items()->where('status', 'Pending')->count();
                    $billedItems = $paymentCache->items()->where('status', 'Billed')->count();
                    
                    if (($pendingItems > 0 || $billedItems > 0) && $item->current_department !== 'cashier') {
                        $item->sendToCashier();
                        \Log::info('Auto-moved patient to cashier due to pending/billed items', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->name ?? 'Unknown',
                            'pending_items' => $pendingItems,
                            'billed_items' => $billedItems,
                            'previous_department' => $item->current_department
                        ]);
                    }
                    
                    // Check if patient should be in consultation based on pending consultations
                    $pendingConsultations = $patient->consultations()
                        ->whereDate('consultations.created_at', $item->registration_time->format('Y-m-d'))
                        ->where('consultations.status', 'Pending')
                        ->count();
                    
                    if ($pendingConsultations > 0 && $item->current_department !== 'consultation') {
                        $item->sendToConsultation();
                        \Log::info('Auto-moved patient to consultation due to pending consultations', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->name ?? 'Unknown',
                            'pending_consultations' => $pendingConsultations,
                            'previous_department' => $item->current_department
                        ]);
                    }
                    
                    // Check if patient should be in procedure room based on paid procedure items
                    $paidProcedureItems = $paymentCache->items()
                        ->whereHas('consultation_type', function($query) {
                            $query->where('name', 'Procedure');
                        })
                        ->where('status', 'Paid')
                        ->count();
                    
                    if ($paidProcedureItems > 0 && $item->current_department !== 'procedure_room') {
                        $item->sendToProcedureRoom();
                        \Log::info('Auto-moved patient to procedure room due to paid procedure items', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->name ?? 'Unknown',
                            'paid_procedure_items' => $paidProcedureItems,
                            'previous_department' => $item->current_department
                        ]);
                    }
                }
            }
        }
        
        // Check if patient should be marked as completed
        if ($item->status === 'in_treatment') {
            // First check if patient has completed their journey
            if ($item->hasCompletedFullJourney()) {
                $item->endTreatment();
                
                \Log::info('Auto-completed patient treatment - journey complete', [
                    'patient_id' => $item->patient_id,
                    'patient_name' => $item->patient->name ?? 'Unknown',
                    'current_department' => $item->current_department
                ]);
            }
            // Then check if patient is stuck (in treatment for too long)
            elseif ($item->autoCompleteIfStuck()) {
                \Log::info('Auto-completed stuck patient treatment', [
                    'patient_id' => $item->patient_id,
                    'patient_name' => $item->patient->name ?? 'Unknown',
                    'current_department' => $item->current_department
                ]);
            }
        }
        // Check if patient has been waiting too long and should be auto-completed
        elseif ($item->status === 'waiting') {
            if ($item->autoCompleteIfWaitingTooLong()) {
                \Log::info('Auto-completed stuck waiting patient', [
                    'patient_id' => $item->patient_id,
                    'patient_name' => $item->patient->name ?? 'Unknown',
                    'current_department' => $item->current_department
                ]);
            }
        }
        
        // Auto-assign doctor if not already assigned
        if (!$item->doctor_id) {
            $item->assignConsultingDoctor();
            // Reload the doctor relationship after assignment
            $item->load('doctor');
        }
            });

            // Add real-time calculations
            $data->getCollection()->transform(function ($item) {
                $item->current_waiting_minutes = $item->current_waiting_time;
                $item->current_treatment_minutes = $item->current_treatment_time;
                $item->current_department_minutes = $item->current_department_time;
                return $item;
            });

            // Add debug information to the response if requested
            if ($request->has('debug') && $request->debug === 'true') {
                $debugInfo = $this->getDebugInfo($request);
                $data->debug_info = $debugInfo;
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Patient waiting times retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Patient waiting times index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            // Return safe empty pagination instead of 500
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
                'per_page' => (int) ($request->per_page ?? 50),
            ], Response::HTTP_OK, 'Patient waiting times retrieved successfully.');
        }
    }

    /**
     * Get debug information for stuck patients
     */
    protected function getDebugInfo(Request $request)
    {
        $user = $request->user();
        $date = $request->date ?? now()->format('Y-m-d');

        $query = PatientWaitingTime::with(['patient', 'doctor'])
                    ->whereDate('registration_time', $date)
                    ->where('patient_waiting_times.status', 'in_treatment');

        if ($user && !$user->is_admin) {
            $query->whereHas('patient.creator', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $stuckPatients = $query->get();
        $analysis = [];

        foreach ($stuckPatients as $waitingTime) {
            $patientAnalysis = [
                'id' => $waitingTime->id,
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                'status' => $waitingTime->status,
                'current_department' => $waitingTime->current_department,
                'department_history' => $waitingTime->department_history,
                'registration_time' => $waitingTime->registration_time,
                'treatment_start_time' => $waitingTime->treatment_start_time,
                'treatment_end_time' => $waitingTime->treatment_end_time,
                'waiting_duration_minutes' => $waitingTime->waiting_duration_minutes,
                'treatment_duration_minutes' => $waitingTime->treatment_duration_minutes,
            ];

            // Get consultation details
            $consultation = $waitingTime->patient->consultations()
                ->whereDate('consultations.created_at', $waitingTime->registration_time->format('Y-m-d'))
                ->first();

            if ($consultation) {
                $patientAnalysis['consultation'] = [
                    'id' => $consultation->id,
                    'status' => $consultation->status,
                    'require_glass' => $consultation->require_glass,
                    'patient_to_return' => $consultation->patient_to_return,
                    'sent_to_optician_at' => $consultation->sent_to_optician_at,
                ];

                // Check payment cache items
                if ($consultation->payment_cache_item && $consultation->payment_cache_item->payment_cache) {
                    $paymentCache = $consultation->payment_cache_item->payment_cache;
                    $items = $paymentCache->items()->with(['item', 'consultation_type'])->get();
                    
                    $patientAnalysis['items'] = $items->map(function($item) {
                        return [
                            'id' => $item->id,
                            'item_name' => $item->item->name ?? 'Unknown',
                            'consultation_type' => $item->consultation_type->name ?? 'Unknown',
                            'status' => $item->status,
                            'quantity' => $item->quantity,
                        ];
                    });

                    $pendingItems = $items->where('status', '!=', 'Served')->count();
                    $patientAnalysis['pending_items_count'] = $pendingItems;
                }
            } else {
                // Check for direct dispensing (no consultation)
                $checkIn = $waitingTime->patient->check_ins()
                    ->whereDate('created_at', $waitingTime->registration_time->format('Y-m-d'))
                    ->first();

                if ($checkIn && $checkIn->payment_cache) {
                    $paymentCache = $checkIn->payment_cache;
                    $items = $paymentCache->items()->with(['item', 'consultation_type'])->get();
                    
                    $patientAnalysis['direct_items'] = $items->map(function($item) {
                        return [
                            'id' => $item->id,
                            'item_name' => $item->item->name ?? 'Unknown',
                            'consultation_type' => $item->consultation_type->name ?? 'Unknown',
                            'status' => $item->status,
                            'quantity' => $item->quantity,
                        ];
                    });

                    $pendingItems = $items->where('status', '!=', 'Served')->count();
                    $patientAnalysis['pending_items_count'] = $pendingItems;
                }
            }

            // Test the completion logic
            $patientAnalysis['should_complete'] = $waitingTime->shouldCompleteTreatment();
            $patientAnalysis['has_completed_journey'] = $waitingTime->hasCompletedFullJourney();

            $analysis[] = $patientAnalysis;
        }

        return [
            'date' => $date,
            'total_stuck_patients' => $stuckPatients->count(),
            'analysis' => $analysis,
        ];
    }

    /**
     * Get real-time waiting statistics
     */
    public function statistics(Request $request)
    {
        try {
            // Debug: Log the request and user information
            \Log::info('Patient waiting times statistics request', [
                'user' => $request->user() ? $request->user()->id : 'no user',
                'headers' => $request->headers->all(),
                'request_data' => $request->all()
            ]);

            $user = $request->user();
            $date = $request->date ?? now()->format('Y-m-d');

            // Validate date is not too far in the future
            $requestedDate = \Carbon\Carbon::parse($date);
            $today = \Carbon\Carbon::today();
            
            if ($requestedDate->gt($today->addDays(7))) {
                // If date is more than 7 days in the future, use today's date
                $date = $today->format('Y-m-d');
                \Log::warning('Patient waiting times statistics: Date too far in future, using today', [
                    'requested_date' => $request->date,
                    'using_date' => $date
                ]);
            }

            // Automatically check and complete stuck patients before calculating statistics
            try {
                $this->autoCompleteStuckPatients($request);
            } catch (\Exception $e) {
                \Log::error('Error in autoCompleteStuckPatients (statistics): ' . $e->getMessage());
                // Continue with the request even if auto-completion fails
            }

            $query = PatientWaitingTime::whereDate('registration_time', $date);

            if ($user && !$user->is_admin) {
                $query->whereHas('patient.creator', function ($q) use ($user) {
                    $q->where('clinic_id', $user->clinic_id);
                });
            }

            // Debug: Get all records for today to see what we have
            $allRecords = (clone $query)->get();
            \Log::info('Patient Waiting Time Statistics Debug', [
                'date' => $date,
                'total_records' => $allRecords->count(),
                'records' => $allRecords->map(function($record) {
                    return [
                        'id' => $record->id,
                        'patient_name' => $record->patient?->full_name ?? 'Unknown',
                        'status' => $record->status,
                        'current_department' => $record->current_department,
                        'department_history' => $record->department_history,
                        'registration_time' => $record->registration_time,
                        'treatment_start_time' => $record->treatment_start_time,
                        'treatment_end_time' => $record->treatment_end_time,
                        'waiting_duration_minutes' => $record->waiting_duration_minutes,
                        'treatment_duration_minutes' => $record->treatment_duration_minutes,
                    ];
                })
            ]);

            // Debug: Check department counts specifically
            $departmentCounts = [
                'reception' => (clone $query)->byDepartment('reception')->count(),
                'cashier' => (clone $query)->byDepartment('cashier')->count(),
                'consultation' => (clone $query)->byDepartment('consultation')->count(),
                'dispensing' => (clone $query)->byDepartment('dispensing')->count(),
                'procedure_room' => (clone $query)->byDepartment('procedure_room')->count(),
            ];
            \Log::info('Department Counts Debug', $departmentCounts);

            // Ensure current_department is set correctly for all patients
            foreach ($allRecords as $record) {
                if ($record->department_history) {
                    $lastEntry = collect($record->department_history)->last();
                    if ($lastEntry) {
                        // Check if current_department is null or doesn't match the last history entry
                        if (!$record->current_department || $record->current_department !== $lastEntry['department']) {
                            $oldDepartment = $record->current_department;
                            $record->current_department = $lastEntry['department'];
                            $record->save();
                            \Log::info('Fixed current_department for patient', [
                                'patient_id' => $record->patient_id,
                                'patient_name' => $record->patient->full_name ?? 'Unknown',
                                'old_department' => $oldDepartment,
                                'new_department' => $record->current_department
                            ]);
                        }
                    }
                }
                
                // Check if patient should be in cashier based on payment status
                $patient = $record->patient;
                if ($patient) {
                    // Get payment cache through check-ins for the same date
                    $checkIn = $patient->check_ins()->whereDate('created_at', $record->registration_time->format('Y-m-d'))->first();
                    if ($checkIn) {
                        $paymentCache = $checkIn->payment_cache;
                        if ($paymentCache) {
                            $pendingItems = $paymentCache->items()->where('status', 'Pending')->count();
                            $billedItems = $paymentCache->items()->where('status', 'Billed')->count();
                            
                            if (($pendingItems > 0 || $billedItems > 0) && $record->current_department !== 'cashier') {
                                $record->sendToCashier();
                                \Log::info('Auto-moved patient to cashier due to pending/billed items (statistics)', [
                                    'patient_id' => $patient->id,
                                    'patient_name' => $patient->name ?? 'Unknown',
                                    'pending_items' => $pendingItems,
                                    'billed_items' => $billedItems,
                                    'previous_department' => $record->current_department
                                ]);
                            }
                            
                            // Check if patient should be in consultation based on pending consultations
                            $pendingConsultations = $patient->consultations()
                                ->whereDate('consultations.created_at', $record->registration_time->format('Y-m-d'))
                                ->where('consultations.status', 'Pending')
                                ->count();
                            
                            if ($pendingConsultations > 0 && $record->current_department !== 'consultation') {
                                $record->sendToConsultation();
                                \Log::info('Auto-moved patient to consultation due to pending consultations (statistics)', [
                                    'patient_id' => $patient->id,
                                    'patient_name' => $patient->name ?? 'Unknown',
                                    'pending_consultations' => $pendingConsultations,
                                    'previous_department' => $record->current_department
                                ]);
                            }
                            
                            // Check if patient should be in procedure room based on paid procedure items
                            $paidProcedureItems = $paymentCache->items()
                                ->whereHas('consultation_type', function($query) {
                                    $query->where('name', 'Procedure');
                                })
                                ->where('status', 'Paid')
                                ->count();
                            
                            if ($paidProcedureItems > 0 && $record->current_department !== 'procedure_room') {
                                $record->sendToProcedureRoom();
                                \Log::info('Auto-moved patient to procedure room due to paid procedure items (statistics)', [
                                    'patient_id' => $patient->id,
                                    'patient_name' => $patient->name ?? 'Unknown',
                                    'paid_procedure_items' => $paidProcedureItems,
                                    'previous_department' => $record->current_department
                                ]);
                            }
                        }
                    }
                }
                
                // Check if patient should be marked as completed
                if ($record->status === 'in_treatment') {
                    // First check if patient has completed their journey
                    if ($record->hasCompletedFullJourney()) {
                        $record->endTreatment();
                        
                        \Log::info('Auto-completed patient treatment - journey complete (statistics)', [
                            'patient_id' => $record->patient_id,
                            'patient_name' => $record->patient->name ?? 'Unknown',
                            'current_department' => $record->current_department
                        ]);
                    }
                    // Then check if patient is stuck (in treatment for too long)
                    elseif ($record->autoCompleteIfStuck()) {
                        \Log::info('Auto-completed stuck patient treatment (statistics)', [
                            'patient_id' => $record->patient_id,
                            'patient_name' => $record->patient->name ?? 'Unknown',
                            'current_department' => $record->current_department
                        ]);
                    }
                }
                // Check if patient has been waiting too long and should be auto-completed
                elseif ($record->status === 'waiting') {
                    if ($record->autoCompleteIfWaitingTooLong()) {
                        \Log::info('Auto-completed stuck waiting patient (statistics)', [
                            'patient_id' => $record->patient_id,
                            'patient_name' => $record->patient->name ?? 'Unknown',
                            'current_department' => $record->current_department
                        ]);
                    }
                }
                
                // Auto-assign doctor if not already assigned
                if (!$record->doctor_id) {
                    $record->assignConsultingDoctor();
                    // Reload the doctor relationship after assignment
                    $record->load('doctor');
                }
            }

            // Calculate averages for all patients (not just completed ones)
            $allPatients = (clone $query)->get();
            
            // Calculate average waiting time for all patients (including real-time for active patients)
            $waitingTimes = $allPatients->map(function($patient) {
                if ($patient->status === 'waiting') {
                    // For waiting patients, calculate real-time waiting duration
                    if ($patient->registration_time) {
                        return now()->diffInMinutes($patient->registration_time);
                    }
                } else if ($patient->waiting_duration_minutes !== null && $patient->waiting_duration_minutes >= 0) {
                    // For patients with stored waiting duration, use that
                    return $patient->waiting_duration_minutes;
                } else if ($patient->registration_time && $patient->treatment_start_time) {
                    // For patients without stored duration, calculate from times
                    return $patient->registration_time->diffInMinutes($patient->treatment_start_time);
                }
                return null;
            })->filter(function($time) {
                return $time !== null && $time >= 0;
            });
            
            $averageWaitingTime = $waitingTimes->count() > 0 ? $waitingTimes->avg() : 0;
            
            // Calculate average treatment time for all patients (including real-time for active patients)
            $treatmentTimes = $allPatients->map(function($patient) {
                if ($patient->status === 'in_treatment') {
                    // For patients currently in treatment, calculate real-time treatment duration
                    if ($patient->treatment_start_time) {
                        return now()->diffInMinutes($patient->treatment_start_time);
                    }
                } else if ($patient->treatment_duration_minutes !== null && $patient->treatment_duration_minutes > 0) {
                    // For patients with stored treatment duration, use that
                    return $patient->treatment_duration_minutes;
                } else if ($patient->treatment_start_time && $patient->treatment_end_time) {
                    // For patients without stored duration, calculate from times
                    return $patient->treatment_start_time->diffInMinutes($patient->treatment_end_time);
                }
                return null;
            })->filter(function($time) {
                return $time !== null && $time > 0;
            });
            
            $averageTreatmentTime = $treatmentTimes->count() > 0 ? $treatmentTimes->avg() : 0;

            $stats = [
                'total_patients_today' => (clone $query)->count(),
                'currently_waiting' => (clone $query)->where('patient_waiting_times.status', 'waiting')->count(),
                'in_treatment' => (clone $query)->where('patient_waiting_times.status', 'in_treatment')->count(),
                'completed_today' => (clone $query)->where('patient_waiting_times.status', 'completed')->count(),
                'average_waiting_time' => $averageWaitingTime,
                'average_treatment_time' => $averageTreatmentTime,
                'by_department' => [
                    'reception' => (clone $query)->byDepartment('reception')->count(),
                    'cashier' => (clone $query)->byDepartment('cashier')->count(),
                    'consultation' => (clone $query)->byDepartment('consultation')->count(),
                    'dispensing' => (clone $query)->byDepartment('dispensing')->count(),
                    'procedure_room' => (clone $query)->byDepartment('procedure_room')->count(),
                ]
            ];

            // Debug: Log the calculated statistics
            \Log::info('Patient Waiting Time Statistics Calculated', [
                'stats' => $stats,
                'waiting_times_count' => $waitingTimes->count(),
                'treatment_times_count' => $treatmentTimes->count(),
                'waiting_times_values' => $waitingTimes->toArray(),
                'treatment_times_values' => $treatmentTimes->toArray()
            ]);

            return $this->sendResponse($stats, Response::HTTP_OK, 'Statistics retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Patient waiting times statistics error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            // Return safe zeroed stats instead of 500
            return $this->sendResponse([
                'total_patients_today' => 0,
                'currently_waiting' => 0,
                'in_treatment' => 0,
                'completed_today' => 0,
                'average_waiting_time' => 0,
                'average_treatment_time' => 0,
                'by_department' => [
                    'reception' => 0,
                    'cashier' => 0,
                    'consultation' => 0,
                    'dispensing' => 0,
                    'procedure_room' => 0,
                ],
            ], Response::HTTP_OK, 'Statistics retrieved successfully.');
        }
    }

    /**
     * Start treatment for a patient
     */
    public function startTreatment(Request $request, $id)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
        ]);

        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->startTreatment($request->doctor_id);

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Treatment started successfully.');
    }

    /**
     * End treatment for a patient
     */
    public function endTreatment($id)
    {
        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->endTreatment();

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Treatment completed successfully.');
    }

    /**
     * Force complete treatment for a patient (manual override)
     */
    public function forceCompleteTreatment(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string'
        ]);

        $waitingTime = PatientWaitingTime::findOrFail($id);
        $reason = $request->reason ?? 'Manually completed via API';
        
        if ($waitingTime->forceCompleteTreatment($reason)) {
            return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Treatment force completed successfully.');
        }

        return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Treatment could not be completed.');
    }

    /**
     * Auto-complete treatment for patients who should be completed
     * This method is called automatically to clean up stuck patients
     */
    protected function autoCompleteStuckPatients(Request $request)
    {
        $user = $request->user();
        $date = $request->date ?? now()->format('Y-m-d');

        $query = PatientWaitingTime::whereDate('registration_time', $date)
                    ->whereIn('patient_waiting_times.status', ['in_treatment', 'waiting']);

        if ($user && !$user->is_admin) {
            $query->whereHas('patient.creator', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $stuckPatients = $query->get();
        $completedCount = 0;

        foreach ($stuckPatients as $waitingTime) {
            try {
                // Ensure waiting duration is calculated before checking completion
                $waitingTime->ensureWaitingDurationCalculated();
                
                // Check multiple completion conditions
                $shouldComplete = false;
                $reason = '';
                
                // For waiting patients, check if they've been waiting too long
                if ($waitingTime->status === 'waiting') {
                    if ($waitingTime->autoCompleteIfWaitingTooLong()) {
                        $shouldComplete = true;
                        $reason = 'Waiting timeout (4+ hours)';
                    }
                }
                // For in_treatment patients, check various completion conditions
                elseif ($waitingTime->status === 'in_treatment') {
                    // Condition 1: Full journey completion check
                    if ($waitingTime->hasCompletedFullJourney()) {
                        $shouldComplete = true;
                        $reason = 'Full journey completed';
                    }
                    // Condition 2: Basic treatment completion check
                    elseif ($waitingTime->shouldCompleteTreatment()) {
                        $shouldComplete = true;
                        $reason = 'Treatment should be completed';
                    }
                    // Condition 3: Force complete if patient has been in treatment for too long (more than 8 hours)
                    elseif ($waitingTime->treatment_start_time && $waitingTime->treatment_start_time->diffInHours(now()) > 8) {
                        $shouldComplete = true;
                        $reason = 'Treatment timeout (8+ hours)';
                    }
                }
                
                if ($shouldComplete) {
                    $completedCount++;
                    
                    \Log::info('Auto-completed patient', [
                        'patient_id' => $waitingTime->patient_id,
                        'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                        'current_department' => $waitingTime->current_department,
                        'reason' => $reason,
                        'status' => $waitingTime->status,
                        'should_complete' => $waitingTime->shouldCompleteTreatment(),
                        'has_completed_journey' => $waitingTime->hasCompletedFullJourney(),
                        'treatment_duration_hours' => $waitingTime->treatment_start_time ? $waitingTime->treatment_start_time->diffInHours(now()) : 0
                    ]);
                } else {
                    // Log why patient is not being completed for debugging
                    \Log::info('Patient not auto-completed - checking why', [
                        'patient_id' => $waitingTime->patient_id,
                        'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                        'current_department' => $waitingTime->current_department,
                        'status' => $waitingTime->status,
                        'should_complete' => $waitingTime->shouldCompleteTreatment(),
                        'has_completed_journey' => $waitingTime->hasCompletedFullJourney(),
                        'treatment_duration_hours' => $waitingTime->treatment_start_time ? $waitingTime->treatment_start_time->diffInHours(now()) : 0
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error auto-completing patient', [
                    'patient_id' => $waitingTime->patient_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        \Log::info("Auto-completed {$completedCount} stuck patients out of {$stuckPatients->count()} checked.");
        
        // Don't return here - let the main method continue
        return;
    }

    /**
     * Move patient to cashier
     */
    public function sendToCashier($id)
    {
        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->sendToCashier();

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Patient moved to cashier successfully.');
    }

    /**
     * Move patient to consultation
     */
    public function sendToConsultation($id)
    {
        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->sendToConsultation();

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Patient moved to consultation successfully.');
    }

    /**
     * Move patient to dispensing
     */
    public function sendToDispensing($id)
    {
        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->sendToDispensing();

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Patient moved to dispensing successfully.');
    }

    /**
     * Move patient to procedure room
     */
    public function sendToProcedureRoom($id)
    {
        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->sendToProcedureRoom();

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Patient moved to procedure room successfully.');
    }

    /**
     * Move patient to any department
     */
    public function moveToDepartment(Request $request, $id)
    {
        $request->validate([
            'department' => 'required|string|in:reception,cashier,consultation,dispensing,procedure_room',
            'notes' => 'nullable|string',
        ]);

        $waitingTime = PatientWaitingTime::findOrFail($id);
        $waitingTime->moveToDepartment($request->department, $request->notes);

        return $this->sendResponse($waitingTime, Response::HTTP_OK, 'Patient moved successfully.');
    }



}