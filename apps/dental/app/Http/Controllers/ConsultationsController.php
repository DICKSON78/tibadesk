<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Jobs\SendConsultationMessageJob;
use App\Models\DentalSurgeryRecord;
use App\Models\Consultation;
use App\Models\ConsultationFacialAssessment;
use App\Models\ConsultationDentalFunctionalTest;
use App\Models\ConsultationPainAssessment;
use App\Models\DentalOralExamination;
use App\Models\DentalCharting;
use App\Models\DentalTreatmentRecord;
use App\Models\DentalRadiograph;
use App\Models\Item;
use App\Models\Collaborator;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\SurgeryRecordReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use stdClass;

class ConsultationsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'to_return_date' => 'sometimes|date_format:Y-m-d',
            'view_period' => 'sometimes|in:daily,weekly,monthly'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $with_diagnoses = $request->with_diagnoses;
        $status = $request->status;
        $payment_cache_item_id = $request->payment_cache_item_id;
        $item_id = $request->item_id;
        $consultant_id = $request->consultant_id;
        $patient_id = $request->patient_id;
        $patient_name = $request->patient_name;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $patient_to_return = $request->patient_to_return;
        $to_return_date = $request->to_return_date;
        $view_period = $request->view_period ?? 'daily';
        $item_payment_mode_id = $request->item_payment_mode_id;
        $disease_id = $request->disease_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = Consultation::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);
            $query->with(['item', 'payment_mode', 'consultant', 'consultation_type']);
        }, 'creator']);

        if ($with_diagnoses == 'Yes') {
            $data->with(['diagnoses.disease']);
        }

        if ($user->is_admin) {
            $data->with(['creator.clinic']);
            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($status) {
            if ($status === 'Pending') {
                $data->where('status', 'Pending')
                    ->whereNull('returned_from')
                    ->whereHas('payment_cache_item', function ($query) {
                        $query->where('status', 'Paid');
                    });
            } elseif ($status === 'Returned') {
                // Patients who were sent to a department (procedure / dental lab) and
                // returned to the doctor for review before being discharged to cashier.
                $data->where('status', 'Pending')
                    ->whereNotNull('returned_from')
                    ->whereHas('payment_cache_item', function ($query) {
                        $query->where('status', 'Paid');
                    });
            } else {
                $data->where('status', $status);
            }
        }

        if ($payment_cache_item_id) {
            $data->where('payment_cache_item_id', $payment_cache_item_id);
        }

        if ($item_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_id) {
                $query->where('item_id', $item_id);
            });
        }

        if ($consultant_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($consultant_id) {
                $query->where('consultant_id', $consultant_id);
            });
        }

        if ($patient_id) {
            $data->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_name) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($patient_to_return) {
            $now = Carbon::now()->format('Y-m-d');
            $data->where('patient_to_return', $patient_to_return)
                ->where(function ($query) use ($to_return_date, $now, $view_period) {
                    $query->whereNotNull('to_return_date');
                    if ($to_return_date) {
                        $query->where('to_return_date', $to_return_date);
                    } else {
                        switch ($view_period) {
                            case 'daily':
                                $query->where('to_return_date', $now);
                                break;
                            case 'weekly':
                                $startOfWeek = Carbon::now()->startOfWeek()->format('Y-m-d');
                                $endOfWeek = Carbon::now()->endOfWeek()->format('Y-m-d');
                                $query->whereBetween('to_return_date', [$startOfWeek, $endOfWeek]);
                                break;
                            case 'monthly':
                                $startOfMonth = Carbon::now()->startOfMonth()->format('Y-m-d');
                                $endOfMonth = Carbon::now()->endOfMonth()->format('Y-m-d');
                                $query->whereBetween('to_return_date', [$startOfMonth, $endOfMonth]);
                                break;
                            default:
                                $query->where('to_return_date', $now);
                        }
                    }
                });
        }

        if ($item_payment_mode_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_payment_mode_id) {
                $query->where('payment_mode_id', $item_payment_mode_id);
            });
        }

        if ($disease_id) {
            $data->whereHas('diagnoses', function ($query) use ($disease_id) {
                $query->where('disease_id', $disease_id);
            });
        }

        if ($start_date) {
            if ($status === 'Consulted') {
                $data->whereHas('payment_cache_item', function ($query) use ($start_date) {
                    $query->whereNotNull('served_at');
                    $query->whereDate('served_at', '>=', $start_date);
                });
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status === 'Consulted') {
                $data->whereHas('payment_cache_item', function ($query) use ($end_date) {
                    $query->whereNotNull('served_at');
                    $query->whereDate('served_at', '<=', $end_date);
                });
            } else {
                $data->whereDate('created_at', '<=', $end_date);
            }
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        //
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'item_id' => 'required|exists:items,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'consultant_id' => 'nullable|exists:users,id',
            'quantity' => 'required|numeric|min:1',
            'is_partner_item' => 'sometimes|boolean',
            'collaborator_name' => 'sometimes|string|nullable',
            'collaborator_id' => 'sometimes|integer|nullable|exists:collaborators,id',
        ]);

        $data = null;
        $user = $request->user();

        $item = Item::where('id', $request->item_id)
            ->whereHas('prices', function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            })
            ->with(['prices' => function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            }])
            ->first();

        if ($item) {
            $payment_cache = PatientPaymentCache::where('consultation_id', $request->consultation_id)
                ->where('created_by', $user->id)
                ->first();

            if (!$payment_cache) {
                $consultation = Consultation::find($request->consultation_id);
                $payment_cache = PatientPaymentCache::create([
                    'check_in_id' => $consultation->payment_cache_item->payment_cache->check_in_id,
                    'consultation_id' => $request->consultation_id,
                    'created_by' => $user->id,
                ]);
            } else {
                $payment_cache->update(['created_at' => Carbon::now()]);
            }

            $data = PatientPaymentCacheItem::create([
                'payment_cache_id' => $payment_cache->id,
                'item_id' => $item->id,
                'consultation_type_id' => $item->consultation_type_id,
                'consultant_id' => $request->consultant_id,
                'payment_mode_id' => $request->payment_mode_id,
                'unit_price' => $item->prices[0]->unit_price,
                'quantity' => $request->quantity,
                'dosage' => $request->dosage,
                'comments' => $request->comments,
                'is_partner_item' => $request->is_partner_item ?? false,
                'collaborator_name' => $request->is_partner_item
                    ? ($request->collaborator_name ?? Collaborator::find($request->collaborator_id)?->name)
                    : null,
                'created_by' => $user->id,
            ]);
            $data->item = $item;
            $data->status = 'Pending';

            try {
                $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                if ($patient) {
                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $data->created_at->format('Y-m-d'))
                        ->where('status', 'waiting')
                        ->first();
                    
                    if ($waitingTime) {
                        $waitingTime->startTreatment();
                        $waitingTime->sendToConsultation();
                        
                        \Log::info('Started treatment for patient waiting time', [
                            'patient_id' => $patient->id,
                            'consultation_id' => $data->id,
                            'waiting_time_id' => $waitingTime->id
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to start treatment for patient waiting time', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Added successfully.');
    }

    public function show(Request $request, $id)
    {
        try {
            $with_diagnoses = $request->with_diagnoses;
            $with_items = $request->with_items;
            $with_item_templates = $request->with_item_templates;
            $data = Consultation::with([
                'payment_cache_item' => function ($query) {
                    $query->with(['payment_cache.check_in.patient' => function ($query2) {
                        $query2->with(['region', 'district', 'ward']);
                    }]);
                    $query->with(['item', 'payment_mode', 'consultant', 'server']);
                }, 'creator',
                'dental_facial_assessment', 'dental_functional_assessment', 'dental_pain_assessment',
                'dental_oral_examination', 'dental_charting', 'dental_treatment_records', 'dental_radiographs',
            ]);

            if ($with_diagnoses == 'Yes') {
                $data->with(['diagnoses.disease']);
            }

            $data = $data->findOrFail($id);

            if ($with_items == 'Yes') {
                $data->items = PatientPaymentCacheItem::with(['item.unit_of_measure', 'consultation_type', 'payment_mode', 'creator', 'server'])
                    ->whereHas('payment_cache', function ($query) use ($id) {
                        $query->where('consultation_id', $id);
                    })
                    ->get();
            }

            if ($with_item_templates == 'Yes') {
                $data->templates = new stdClass();
                $data->templates->surgery_record_report = SurgeryRecordReport::with(['creator'])
                    ->whereHas('payment_cache_item.payment_cache', function ($query) use ($id) {
                        $query->where('consultation_id', $id);
                    })
                    ->first();
                $data->templates->dental_surgery_record = DentalSurgeryRecord::with(['creator'])
                    ->whereHas('payment_cache_item.payment_cache', function ($query) use ($id) {
                        $query->where('consultation_id', $id);
                    })
                    ->first();
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@show failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Consultation temporarily unavailable.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'patient_to_return' => 'sometimes|required|in:Yes,No',
                'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
                'to_return_time' => 'nullable|date_format:H:i',
                'status' => 'sometimes|required|in:Pending,Consulted',
            ]);

            $data = Consultation::findOrFail($id);
            $data->update($request->all());

            if ($request->status === 'Consulted') {
                try {
                    $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                    if ($patient) {
                        $waitingTime = $patient->current_waiting_time;
                        if ($waitingTime && $waitingTime->status === 'in_treatment') {
                            \Log::info('Consultation completed - keeping patient in treatment', [
                                'patient_id' => $patient->id,
                                'patient_name' => $patient->full_name,
                                'consultation_id' => $data->id,
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to check patient waiting time status', [
                        'consultation_id' => $data->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found for update', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@update failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to update consultation.');
        }
    }

    public function autoSaveClinicalNotes(Request $request, $id)
    {
        try {
            $request->validate([
                'what' => 'required|in:Consultation,Facial Assessment,Dental Functional Test,Pain Assessment,Dental Oral Examination,Dental Charting,Dental Treatment Record,Dental Radiograph'
            ]);

            $user = $request->user();
            $data = Consultation::findOrFail($id);

            switch ($request->what) {
                case 'Consultation': {
                    $input = $request->except('what');
                    if (empty($input['to_return_date'])) {
                        $input['to_return_date'] = null;
                    }
                    if (empty($input['to_return_time'])) {
                        $input['to_return_time'] = null;
                    }
                    $request->merge($input);
                    $request->validate([
                        'patient_to_return' => 'sometimes|required|in:Yes,No',
                        'to_return_date' => 'nullable|date_format:Y-m-d',
                        'to_return_time' => 'nullable|date_format:H:i',
                    ]);
                    $data->update($input);
                }
                break;
                case 'Facial Assessment': {
                    if ($data->dental_facial_assessment) {
                        $data->dental_facial_assessment->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFacialAssessment::create($input);
                    }
                }
                break;
                case 'Dental Functional Test': {
                    if ($data->dental_functional_assessment) {
                        $data->dental_functional_assessment->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationDentalFunctionalTest::create($input);
                    }
                }
                break;
                case 'Pain Assessment': {
                    if ($data->dental_pain_assessment) {
                        $data->dental_pain_assessment->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationPainAssessment::create($input);
                    }
                }
                break;
                case 'Dental Oral Examination': {
                    if ($data->dental_oral_examination) {
                        $data->dental_oral_examination->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        DentalOralExamination::create($input);
                    }
                }
                break;
                case 'Dental Charting': {
                    $chartingData = $request->except('what');
                    $chartingData['consultation_id'] = $id;
                    $chartingData['created_by'] = $user->id;
                    if (isset($chartingData['tooth_number'])) {
                        $existing = DentalCharting::where('consultation_id', $id)
                            ->where('tooth_number', $chartingData['tooth_number'])
                            ->first();
                        if ($existing) {
                            $existing->update($chartingData);
                        } else {
                            DentalCharting::create($chartingData);
                        }
                    }
                }
                break;
                case 'Dental Treatment Record': {
                    $input = $request->except('what');
                    $input['consultation_id'] = $id;
                    $input['created_by'] = $user->id;
                    DentalTreatmentRecord::create($input);
                }
                break;
                case 'Dental Radiograph': {
                    $input = $request->except('what');
                    $input['consultation_id'] = $id;
                    $input['created_by'] = $user->id;
                    if (!isset($input['patient_id'])) {
                        try {
                            $input['patient_id'] = $data->payment_cache_item->payment_cache->check_in->patient_id;
                        } catch (\Exception $e) {
                            // patient_id required
                        }
                    }
                    DentalRadiograph::create($input);
                }
                break;
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found for auto-save', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@autoSaveClinicalNotes failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to auto-save clinical notes.');
        }
    }

    public function completeClinicalNotes(Request $request, $id)
    {
        try {
            $input = $request->all();
            if (empty($input['to_return_date'])) {
                $input['to_return_date'] = null;
            }
            if (empty($input['to_return_time'])) {
                $input['to_return_time'] = null;
            }
            $request->merge($input);

            $request->validate([
                'patient_to_return' => 'nullable|in:Yes,No',
                'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
                'to_return_time' => 'nullable|date_format:H:i',
                'info_source_id' => 'nullable|exists:information_sources,id',
            ]);

            $user = $request->user();
            $data = Consultation::findOrFail($id);
            $input = $request->only('chief_complaint', 'history_present_illness', 'family_history', 'general_health', 'family_dental_history', 'family_general_history', 'patient_to_return', 'to_return_date', 'to_return_time', 'remarks', 'oral_hygiene_status', 'tobacco_use', 'alcohol_use');
            $input['status'] = 'Consulted';

            $data->update($input);

            if ($request->facial_assessment) {
                if ($data->dental_facial_assessment) {
                    $data->dental_facial_assessment->update($request->facial_assessment);
                } else {
                    $facialData = $request->facial_assessment;
                    $facialData['consultation_id'] = $id;
                    $facialData['created_by'] = $user->id;
                    ConsultationFacialAssessment::create($facialData);
                }
            }

            if ($request->dental_functional_test) {
                if ($data->dental_functional_assessment) {
                    $data->dental_functional_assessment->update($request->dental_functional_test);
                } else {
                    $funcData = $request->dental_functional_test;
                    $funcData['consultation_id'] = $id;
                    $funcData['created_by'] = $user->id;
                    ConsultationDentalFunctionalTest::create($funcData);
                }
            }

            if ($request->pain_assessment) {
                if ($data->dental_pain_assessment) {
                    $data->dental_pain_assessment->update($request->pain_assessment);
                } else {
                    $painData = $request->pain_assessment;
                    $painData['consultation_id'] = $id;
                    $painData['created_by'] = $user->id;
                    ConsultationPainAssessment::create($painData);
                }
            }

            $data->payment_cache_item->update([
                'consultant_id' => $user->id,
            ]);

            try {
                $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                if ($patient) {
                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $data->created_at->format('Y-m-d'))
                        ->first();

                    // Ensure treatment has started so downstream routing/completion applies
                    // even for consultations where no extra items were added (addItem normally
                    // starts treatment, but a simple consult never calls it).
                    if ($waitingTime && $waitingTime->status === 'waiting') {
                        $waitingTime->startTreatment($user->id);
                    }

                    // Route the patient to the right department after completion:
                    // 1. If unpaid (e.g. medicine) items were added -> pharmacy/cashier so they
                    //    can be paid before dispensing.
                    // 2. Else if a dental lab order is still outstanding -> sent to dental lab,
                    //    which on delivery returns the patient to the doctor.
                    // 3. Otherwise end the treatment when the full journey is complete.
                    $pendingCount = \App\Models\PatientPaymentCacheItem::whereHas('payment_cache', function ($q) use ($data) {
                        // Count items across ALL payment caches linked to this consultation
                        // (the cashier consultation-fee cache AND any add-item caches).
                        $q->where('consultation_id', $data->id);
                    })
                        ->where('status', 'Pending')
                        ->count();

                    $outstandingLab = \App\Models\DentalLabOrder::where('consultation_id', $data->id)
                        ->whereNotIn('status', ['Delivered'])
                        ->exists();

                    if ($waitingTime && $pendingCount > 0) {
                        $waitingTime->moveToDepartment('cashier', 'Sent to pharmacy/cashier for medicine payment');

                        \Log::info('Consultation completed - patient routed to pharmacy for pending items', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->full_name ?? 'Unknown',
                            'consultation_id' => $data->id,
                            'pending_items' => $pendingCount,
                            'current_department' => $waitingTime->current_department,
                        ]);
                    } elseif ($waitingTime && $outstandingLab) {
                        $waitingTime->moveToDepartment('dental_lab', 'Sent to dental lab');

                        \Log::info('Consultation completed - patient routed to dental lab', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->full_name ?? 'Unknown',
                            'consultation_id' => $data->id,
                            'current_department' => $waitingTime->current_department,
                        ]);
                    } elseif ($waitingTime && $pendingCount === 0 && $waitingTime->hasCompletedFullJourney()) {
                        $waitingTime->endTreatment();
                        
                        \Log::info('Auto-completed patient treatment after consultation completion', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->name ?? 'Unknown',
                            'current_department' => $waitingTime->current_department,
                            'consultation_id' => $data->id
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to check patient waiting time for completion', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage()
                ]);
            }

            if ($request->info_source_id) {
                $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                $patient->info_source_id = $request->info_source_id;
                $patient->save();
            }

            try {
                event(new \App\Events\NotificationUpdate());
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification refresh after consultation completion', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Clinical notes saved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found for complete clinical notes', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@completeClinicalNotes failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to complete clinical notes.');
        }
    }

    public function discharge(Request $request, $id)
    {
        try {
            $data = Consultation::findOrFail($id);

            $user = $request->user();

            // Finalise the consultation (it was returned to the doctor for review).
            $data->update([
                'status' => 'Consulted',
                'returned_from' => null,
            ]);

            // Send the patient to the cashier for final payment (or end the journey if no
            // outstanding items remain).
            try {
                $patient = $data->payment_cache_item?->payment_cache?->check_in?->patient;
                if ($patient) {
                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $data->created_at->format('Y-m-d'))
                        ->whereIn('status', ['waiting', 'in_treatment'])
                        ->latest()
                        ->first();

                    $pendingCount = \App\Models\PatientPaymentCacheItem::whereHas('payment_cache', function ($q) use ($data) {
                        $q->where('consultation_id', $data->id);
                    })
                        ->whereIn('status', ['Pending', 'Billed'])
                        ->count();

                    if ($waitingTime) {
                        if ($pendingCount > 0) {
                            $waitingTime->sendToCashier();
                            \Log::info('Doctor discharged patient - sent to cashier for final payment', [
                                'consultation_id' => $data->id,
                                'patient_id' => $patient->id,
                                'pending_count' => $pendingCount,
                            ]);
                        } else {
                            $waitingTime->endTreatment();
                            \Log::info('Doctor discharged patient - no pending bill, treatment ended', [
                                'consultation_id' => $data->id,
                                'patient_id' => $patient->id,
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Discharge: failed to route patient to cashier', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage(),
                ]);
            }

            try {
                event(new \App\Events\NotificationUpdate());
            } catch (\Exception $e) {
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Patient discharged. Sent to cashier for final payment.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@discharge failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to discharge patient.');
        }
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        //
    }
}
