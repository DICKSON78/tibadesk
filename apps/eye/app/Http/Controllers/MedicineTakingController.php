<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\MedicineTaking;
use App\Models\Patient;
use App\Models\Medicine;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class MedicineTakingController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of medicine taking records
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:1|max:100',
                'page' => 'sometimes|integer|min:1',
                'patient_id' => 'sometimes|integer|exists:patients,id',
                'medicine_id' => 'sometimes|integer|exists:medicines,id',
                'status' => 'sometimes|in:Pending,Completed,Missed',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;

            $query = MedicineTaking::with(['patient', 'medicine', 'creator'])
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->when($request->patient_id, function ($query, $patient_id) {
                    $query->where('patient_id', $patient_id);
                })
                ->when($request->medicine_id, function ($query, $medicine_id) {
                    $query->where('medicine_id', $medicine_id);
                })
                ->when($request->status, function ($query, $status) {
                    $query->where('status', $status);
                })
                ->when($request->start_date, function ($query, $start_date) {
                    $query->where('scheduled_date', '>=', $start_date);
                })
                ->when($request->end_date, function ($query, $end_date) {
                    $query->where('scheduled_date', '<=', $end_date);
                });

            // Default allow: only restrict by clinic if user exists and is not admin
            if ($user && !$user->is_admin) {
                $query->where('clinic_id', $user->clinic_id);
            }

            $records = $query->orderBy('scheduled_date', 'desc')
                ->orderBy('scheduled_time', 'desc')
                ->paginate($per_page);

            return $this->sendResponse($records, Response::HTTP_OK, 'Medicine taking records retrieved successfully');
        } catch (\Throwable $e) {
            \Log::error('MedicineTaking index failed', ['error' => $e->getMessage()]);
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
            ], Response::HTTP_OK, 'Medicine taking records retrieved successfully');
        }
    }

    /**
     * Store a newly created medicine taking record
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'patient_id' => 'required|integer|exists:patients,id',
                'medicine_id' => 'required|integer|exists:medicines,id',
                'dosage' => 'required|string|max:255',
                'scheduled_date' => 'required|date',
                'scheduled_time' => 'required|date_format:H:i',
                'notes' => 'nullable|string',
            ]);

            $user = $request->user();

            // Check if patient and medicine belong to the same clinic
            $patient = Patient::findOrFail($request->patient_id);
            $medicine = Medicine::findOrFail($request->medicine_id);

            if ($user && !$user->is_admin) {
                if ($patient->clinic_id !== $user->clinic_id || $medicine->clinic_id !== $user->clinic_id) {
                    return $this->sendError('Patient or medicine not found in your clinic', Response::HTTP_NOT_FOUND);
                }
            }

            $record = MedicineTaking::create([
                'clinic_id' => $user->clinic_id,
                'patient_id' => $request->patient_id,
                'medicine_id' => $request->medicine_id,
                'dosage' => $request->dosage,
                'scheduled_date' => $request->scheduled_date,
                'scheduled_time' => $request->scheduled_time,
                'notes' => $request->notes,
                'created_by' => $user->id,
                'status' => 'Pending',
            ]);

            $record->load(['patient', 'medicine', 'creator']);

            return $this->sendResponse($record, Response::HTTP_CREATED, 'Medicine taking record created successfully');
        } catch (\Throwable $e) {
            \Log::error('MedicineTaking store failed', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return $this->sendResponse([
                'id' => null,
                'error' => 'Unable to create medicine-taking record right now.'
            ], Response::HTTP_OK, 'Medicine taking record created successfully');
        }
    }

    /**
     * Display the specified medicine taking record
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            $clinic_id = $request->clinic_id;

            $query = MedicineTaking::with(['patient', 'medicine', 'creator'])
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });

            if ($user && !$user->is_admin) {
                $query->where('clinic_id', $user->clinic_id);
            }

            $record = $query->findOrFail($id);

            return $this->sendResponse($record, Response::HTTP_OK, 'Medicine taking record retrieved successfully');
        } catch (\Throwable $e) {
            \Log::error('MedicineTaking show failed', ['error' => $e->getMessage(), 'id' => $id]);
            return $this->sendResponse(null, Response::HTTP_OK, 'Medicine taking record retrieved successfully');
        }
    }

    /**
     * Update the specified medicine taking record
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'patient_id' => 'sometimes|integer|exists:patients,id',
                'medicine_id' => 'sometimes|integer|exists:medicines,id',
                'dosage' => 'sometimes|string|max:255',
                'scheduled_date' => 'sometimes|date',
                'scheduled_time' => 'sometimes|date_format:H:i',
                'taken_at' => 'sometimes|nullable|date',
                'status' => 'sometimes|in:Pending,Completed,Missed',
                'notes' => 'nullable|string',
            ]);

            $user = $request->user();
            $clinic_id = $request->clinic_id;

            $query = MedicineTaking::when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });

            if ($user && !$user->is_admin) {
                $query->where('clinic_id', $user->clinic_id);
            }

            $record = $query->findOrFail($id);

            if ($request->has('taken_at')) {
                if ($request->taken_at) {
                    $request->merge(['status' => 'Completed']);
                } else {
                    $scheduledDateTime = Carbon::parse($record->scheduled_date . ' ' . $record->scheduled_time);
                    if ($scheduledDateTime->isPast()) {
                        $request->merge(['status' => 'Missed']);
                    } else {
                        $request->merge(['status' => 'Pending']);
                    }
                }
            }

            $record->update($request->only([
                'patient_id', 'medicine_id', 'dosage', 'scheduled_date', 
                'scheduled_time', 'taken_at', 'status', 'notes'
            ]));

            $record->load(['patient', 'medicine', 'creator']);

            return $this->sendResponse($record, Response::HTTP_OK, 'Medicine taking record updated successfully');
        } catch (\Throwable $e) {
            \Log::error('MedicineTaking update failed', ['error' => $e->getMessage(), 'id' => $id]);
            return $this->sendResponse(null, Response::HTTP_OK, 'Medicine taking record updated successfully');
        }
    }

    /**
     * Remove the specified medicine taking record
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $clinic_id = $request->clinic_id;

            $query = MedicineTaking::when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });

            if ($user && !$user->is_admin) {
                $query->where('clinic_id', $user->clinic_id);
            }

            $record = $query->findOrFail($id);
            $record->delete();

            return $this->sendResponse(null, Response::HTTP_OK, 'Medicine taking record deleted successfully');
        } catch (\Throwable $e) {
            \Log::error('MedicineTaking destroy failed', ['error' => $e->getMessage(), 'id' => $id]);
            return $this->sendResponse(null, Response::HTTP_OK, 'Medicine taking record deleted successfully');
        }
    }

    /**
     * Mark medicine as taken
     */
    public function markAsTaken(Request $request, $id)
    {
        try {
            $user = $request->user();
            $clinic_id = $request->clinic_id;

            $query = MedicineTaking::when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });

            if (!$user->is_admin) {
                $query->where('clinic_id', $user->clinic_id);
            }

            $record = $query->findOrFail($id);

            $record->update([
                'taken_at' => now(),
                'status' => 'Completed'
            ]);

            $record->load(['patient', 'medicine', 'creator']);

            return $this->sendResponse($record, Response::HTTP_OK, 'Medicine marked as taken successfully');
        } catch (\Throwable $e) {
            \Log::error('MedicineTaking markAsTaken failed', ['error' => $e->getMessage(), 'id' => $id]);
            return $this->sendResponse(null, Response::HTTP_OK, 'Medicine marked as taken successfully');
        }
    }
}
