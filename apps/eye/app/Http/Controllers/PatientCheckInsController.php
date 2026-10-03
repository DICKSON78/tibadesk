<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Collaborator;
use App\Models\Item;
use App\Models\Patient;
use App\Models\PatientCheckIn;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\PatientWaitingTime;
use App\Models\DoctorTask;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;

class PatientCheckInsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $gender = $request->gender;
        $phone = $request->phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = PatientCheckIn::with(['patient' => function ($query) {
            $query->with(['region', 'district']);
        }, 'payment_mode', 'creator']);

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

        if ($patient_name) {
            $data->whereHas('patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($gender) {
            $data->whereHas('patient', function ($query) use ($gender) {
                $query->where('gender', $gender);
            });
        }

        if ($phone) {
            $data->whereHas('patient', function ($query) use ($phone) {
                $query->where('phone', 'like', '%' . $phone . '%');
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'payment_mode_id' => 'required|exists:payment_modes,id',
                'items' => 'required|array',
                'items.*.item_id' => 'required|exists:items,id',
                'items.*.consultant_id' => 'nullable|exists:users,id',
                'items.*.payment_mode_id' => 'required|exists:payment_modes,id',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.is_partner_item' => 'sometimes|boolean',
                'items.*.collaborator_id' => 'sometimes|integer|nullable|exists:collaborators,id',
            ]);

            $user = $request->user();
            $input = $request->only('patient_id', 'payment_mode_id');
            $input['created_by'] = $user->id;
            
            \Log::info('Creating patient check-in', [
                'patient_id' => $input['patient_id'],
                'payment_mode_id' => $input['payment_mode_id'],
                'user_id' => $user->id
            ]);
            
            $data = PatientCheckIn::create($input);

        if ($data) {
            // Create patient waiting time record for tracking
            try {
                $waitingTime = \App\Models\PatientWaitingTime::create([
                    'patient_id' => $data->patient_id,
                    'registration_time' => $data->created_at,
                    'status' => 'waiting',
                    'current_department' => 'reception',
                    'department_history' => [
                        [
                            'department' => 'reception',
                            'moved_at' => $data->created_at->toISOString(),
                            'moved_by' => $user->id,
                            'notes' => 'Patient checked in'
                        ]
                    ]
                ]);
                
                \Log::info('Created patient waiting time record', [
                    'patient_id' => $data->patient_id,
                    'waiting_time_id' => $waitingTime->id,
                    'registration_time' => $data->created_at
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to create patient waiting time record', [
                    'patient_id' => $data->patient_id,
                    'error' => $e->getMessage()
                ]);
            }

            $payment_cache = PatientPaymentCache::create([
                'check_in_id' => $data->id,
                'created_by' => $user->id,
            ]);

            if ($payment_cache) {
                $input_items = $request->input('items', []);
                
                if (!empty($input_items)) {
                    foreach ($input_items as $input_item) {
                        try {
                            // if this item has price for the provided payment mode, continue
                            $item = Item::where('id', $input_item['item_id'])
                                ->whereHas('prices', function ($query) use ($input_item) {
                                    $query->where('payment_mode_id', $input_item['payment_mode_id']);
                                })
                                ->with(['prices' => function ($query) use ($input_item) {
                                    $query->where('payment_mode_id', $input_item['payment_mode_id']);
                                }])
                                ->first();

                            if ($item && isset($item->prices[0])) {
                                $isPartner = filter_var(Arr::get($input_item, 'is_partner_item', false), FILTER_VALIDATE_BOOLEAN);
                                $collaboratorId = Arr::get($input_item, 'collaborator_id');
                                $paymentCacheItem = PatientPaymentCacheItem::create([
                                    'payment_cache_id' => $payment_cache->id,
                                    'item_id' => $item->id,
                                    'consultation_type_id' => $item->consultation_type_id,
                                    'consultant_id' => Arr::get($input_item, 'consultant_id'),
                                    'payment_mode_id' => $input_item['payment_mode_id'],
                                    'unit_price' => $item->prices[0]->unit_price,
                                    'quantity' => $input_item['quantity'],
                                    'comments' => Arr::get($input_item, 'comments'),
                                    'is_partner_item' => $isPartner,
                                    'collaborator_name' => $isPartner && $collaboratorId
                                        ? Collaborator::find($collaboratorId)?->name
                                        : null,
                                    'created_by' => $user->id,
                                ]);

                                // Note: doctor_tasks table doesn't exist, so skipping doctor task creation
                            } else {
                                \Log::warning('Item not found or no price available', [
                                    'item_id' => $input_item['item_id'] ?? 'unknown',
                                    'payment_mode_id' => $input_item['payment_mode_id'] ?? 'unknown'
                                ]);
                            }
                        } catch (\Exception $e) {
                            \Log::error('Failed to process item in check-in', [
                                'item_data' => $input_item,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                }
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Checked in successfully.');
        
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('PatientCheckInsController@store validation failed', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return $this->sendError('Validation failed.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Throwable $e) {
            \Log::error('PatientCheckInsController@store failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('Check-in failed. Please try again.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientCheckIn::with(['patient', 'payment_mode', 'creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource in storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
