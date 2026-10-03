<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Jobs\SendConsultationMessageJob;
use App\Models\CataractSurgeryRecord;
use App\Models\Consultation;
use App\Models\ConsultationExternalExamination;
use App\Models\ConsultationFunctionalTest;
use App\Models\ConsultationFundoscopy;
use App\Models\ConsultationRefraction;
use App\Models\ConsultationVisualAcuity;
use App\Models\Item;
use App\Models\Collaborator;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\SurgeryRecordReport;
use App\Models\DoctorTask;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use stdClass;

class ConsultationsController extends Controller
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
            'end_date' => 'sometimes|date_format:Y-m-d',
            'to_return_date' => 'sometimes|date_format:Y-m-d',
            'view_period' => 'sometimes|in:daily,weekly,monthly'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $with_diagnoses = $request->with_diagnoses;
        $status = $request->status;
        $require_glass = $request->require_glass;
        $payment_cache_item_id = $request->payment_cache_item_id;
        $item_id = $request->item_id;
        $patient_direction = $request->patient_direction;
        $consultant_id = $request->consultant_id;
        $patient_id = $request->patient_id;
        $patient_name = $request->patient_name;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $patient_to_return = $request->patient_to_return;
        $to_return_date = $request->to_return_date;
        $view_period = $request->view_period ?? 'daily';
        $item_payment_mode_id = $request->item_payment_mode_id;

        // Debug logging
        \Log::info('ConsultationsController Debug', [
            'patient_to_return' => $patient_to_return,
            'to_return_date' => $to_return_date,
            'view_period' => $view_period,
            'all_params' => $request->all()
        ]);
        $disease_id = $request->disease_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Consultation::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);

            $query->with(['item', 'payment_mode', 'consultant', 'consultation_type']);
        }, 'creator', 'to_optician_sender']);

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
            if ($status === 'Awaiting Glass') {
                $data->where('require_glass', 'Yes')
                    ->whereNull('sent_to_optician_at')
                    ->where('patient_direction', '!=', 'Direct to Optician');
            } else if ($status === 'Sent to Optician') {
                $data->where(function ($query) {
                    $query->where('require_glass', 'Yes')
                          ->orWhereNotNull('sent_to_optician_at')
                          ->orWhere('patient_direction', 'Direct to Optician');
                })
                ->whereHas('payment_cache_item', function ($query) {
                    // Exclude patients whose items have been served/dispensed
                    $query->where('status', '!=', 'Served');
                });
            } else if ($status === 'Pending') {
                // For pending consultations, only show those that came from cashier flow
                // (consultations created after payment with consultation items)
                $data->where('status', 'Pending')
                    ->whereHas('payment_cache_item', function ($query) {
                        // Only show consultations for items that require consultation
                        $query->whereHas('item', function ($itemQuery) {
                            $itemQuery->where('is_consultation_item', 'Yes');
                        });
                        // Ensure the payment cache item is paid (came from cashier)
                        $query->where('status', 'Paid');
                    });
            } else {
                $data->where('status', $status);
            }
        }

        if ($require_glass) {
            $data->where('require_glass', $require_glass);
        }

        if ($payment_cache_item_id) {
            $data->where('payment_cache_item_id', $payment_cache_item_id);
        }

        if ($item_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_id) {
                $query->where('item_id', $item_id);
            });
        }

        if ($patient_direction) {
            $data->where('patient_direction', $patient_direction);
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
                        // When specific date is selected, use that date regardless of view_period
                        $query->where('to_return_date', $to_return_date);
                    } else {
                        // Apply view period filtering only when no specific date is selected
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
            if ($status === 'Awaiting Glass') {
                // For Awaiting Glass, show recent new patients (last few days)
                $data->where(function ($query) use ($start_date) {
                    $query->where(function ($query2) use ($start_date) {
                        // For Direct to Optician patients, filter by when they were created recently
                        $query2->where('patient_direction', 'Direct to Optician');
                        $query2->whereDate('created_at', '>=', $start_date);
                    });
                    $query->orWhere(function ($query2) use ($start_date) {
                        // For Direct to Doctor patients, filter by when they were created recently OR served recently
                        $query2->where('patient_direction', 'Direct to Doctor');
                        $query2->where(function ($query3) use ($start_date) {
                            $query3->whereDate('created_at', '>=', $start_date);
                            $query3->orWhereHas('payment_cache_item', function ($query4) use ($start_date) {
                                $query4->whereNotNull('served_at');
                                $query4->whereDate('served_at', '>=', $start_date);
                            });
                        });
                    });
                });
            } elseif ($status === 'Sent to Optician') {
                // For Sent to Optician, filter by date for both directly sent and doctor-sent patients
                if ($start_date) {
                    $data->where(function ($query) use ($start_date) {
                        $query->where(function ($subQuery) use ($start_date) {
                            $subQuery->whereNotNull('sent_to_optician_at');
                            $subQuery->whereDate('sent_to_optician_at', '>=', $start_date);
                        });
                        $query->orWhere(function ($subQuery) use ($start_date) {
                            $subQuery->where('patient_direction', 'Direct to Optician');
                            $subQuery->whereDate('created_at', '>=', $start_date);
                        });
                    });
                }
            } elseif ($status === 'Consulted') {
                $data->whereHas('payment_cache_item', function ($query) use ($start_date) {
                    $query->whereNotNull('served_at');
                    $query->whereDate('served_at', '>=', $start_date);
                });
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status === 'Awaiting Glass') {
                // For Awaiting Glass, show recent new patients (last few days)
                $data->where(function ($query) use ($end_date) {
                    $query->where(function ($query2) use ($end_date) {
                        // For Direct to Optician patients, filter by when they were created recently
                        $query2->where('patient_direction', 'Direct to Optician');
                        $query2->whereDate('created_at', '<=', $end_date);
                    });
                    $query->orWhere(function ($query2) use ($end_date) {
                        // For Direct to Doctor patients, filter by when they were created recently OR served recently
                        $query2->where('patient_direction', 'Direct to Doctor');
                        $query2->where(function ($query3) use ($end_date) {
                            $query3->whereDate('created_at', '<=', $end_date);
                            $query3->orWhereHas('payment_cache_item', function ($query4) use ($end_date) {
                                $query4->whereNotNull('served_at');
                                $query4->whereDate('served_at', '<=', $end_date);
                            });
                        });
                    });
                });
            } elseif ($status === 'Sent to Optician') {
                // For Sent to Optician, filter by date for both directly sent and doctor-sent patients
                if ($end_date) {
                    $data->where(function ($query) use ($end_date) {
                        $query->where(function ($subQuery) use ($end_date) {
                            $subQuery->whereNotNull('sent_to_optician_at');
                            $subQuery->whereDate('sent_to_optician_at', '<=', $end_date);
                        });
                        $query->orWhere(function ($subQuery) use ($end_date) {
                            $subQuery->where('patient_direction', 'Direct to Optician');
                            $subQuery->whereDate('created_at', '<=', $end_date);
                        });
                    });
                }
            } elseif ($status === 'Consulted') {
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

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
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

        // if item has price for the provided payment mode, continue
        $item = Item::where('id', $request->item_id)
            ->whereHas('prices', function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            })
            ->with(['prices' => function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            }])
            ->first();

        if ($item) {
            // if this consultation has payment cache for this user use the existing one, otherwise create new
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

            // Start treatment for patient waiting time tracking
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

    /**
     * Display the specified resource.
     *
     * @param Request $request
     * @param  int $id
     * @return Response
     */
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
                }, 'creator', 'external_examination', 'functional_tests', 'visual_acuity', 'refraction', 'fundoscopy',
                'to_optician_sender',
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
                $data->templates->cataract_surgery_record = CataractSurgeryRecord::with(['creator'])
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
            // Return safe empty payload to keep UI responsive
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Consultation temporarily unavailable.');
        }
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
        try {
            $request->validate([
                'patient_to_return' => 'sometimes|required|in:Yes,No',
                'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
                'status' => 'sometimes|required|in:Pending,Consulted',
                'require_glass' => 'sometimes|required|in:Yes,No',
                'send_to_optician' => 'sometimes|required|in:Yes,No',
            ]);

            $data = Consultation::findOrFail($id);
            $data->update($request->all());

            // DO NOT automatically complete treatment when consultation is done
            // Treatment should only be completed when patient actually finishes their entire journey
            // (consultation + payment + dispensing + any other required departments)
            if ($request->status === 'Consulted') {
                try {
                    $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                    if ($patient) {
                        $waitingTime = $patient->current_waiting_time;
                        
                        if ($waitingTime && $waitingTime->status === 'in_treatment') {
                            // Keep patient in treatment - they may still need to go to other departments
                            // Treatment will be completed only when they actually finish their journey
                            \Log::info('Consultation completed - keeping patient in treatment', [
                                'patient_id' => $patient->id,
                                'patient_name' => $patient->full_name,
                                'consultation_id' => $data->id,
                                'require_glass' => $data->require_glass,
                                'sent_to_optician' => $data->sent_to_optician_at ? 'Yes' : 'No'
                            ]);
                        }
                    }

                    // Create doctor task from completed consultation
                    try {
                        $doctorTask = \App\Models\DoctorTask::createFromConsultation($data);
                        if ($doctorTask) {
                            \Log::info('Doctor task created from consultation completion', [
                                'consultation_id' => $data->id,
                                'task_id' => $doctorTask->id,
                                'doctor_id' => $doctorTask->doctor_id,
                                'patient_id' => $doctorTask->patient_id
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Log::error('Failed to create doctor task from consultation', [
                            'consultation_id' => $data->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to check patient waiting time status', [
                        'consultation_id' => $data->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if ($request->send_to_optician == 'Yes') {
                $data->update([
                    'sent_to_optician_at' => Carbon::now(),
                    'sent_to_optician_by' => $request->user()->id,
                    'require_glass' => 'Yes', // Automatically set require_glass when manually sent to optician
                    'patient_direction' => 'Sent to Optician', // Update patient direction to reflect optician status
                ]);
                
                // Get patient for both waiting time and notification
                $patient = null;
                try {
                    $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                } catch (\Exception $e) {
                    \Log::error('Failed to get patient for consultation', [
                        'consultation_id' => $data->id,
                        'error' => $e->getMessage()
                    ]);
                }
                
                // Move patient to consultation department (optician)
                if ($patient) {
                    try {
                        $waitingTime = $patient->current_waiting_time;
                        if ($waitingTime) {
                            $waitingTime->sendToConsultation();
                            \Log::info('Patient manually sent to optician - moved to consultation department', [
                                'patient_id' => $patient->id,
                                'patient_name' => $patient->full_name ?? 'Unknown',
                                'consultation_id' => $data->id,
                                'sent_by' => $request->user()->id
                            ]);
                        } else {
                            \Log::warning('No waiting time found for patient when sending to optician', [
                                'patient_id' => $patient->id,
                                'consultation_id' => $data->id
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Log::error('Failed to move patient to optician department', [
                            'consultation_id' => $data->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        // Don't fail the entire request, just log the error
                    }
                } else {
                    \Log::warning('No patient found for consultation when sending to optician', [
                        'consultation_id' => $data->id
                    ]);
                }
                
                // Create notification for optician
                try {
                    if ($patient && class_exists('App\Models\PatientNotification')) {
                        \App\Models\PatientNotification::create([
                            'patient_id' => $patient->id,
                            'type' => 'patient_sent_to_optician',
                            'title' => 'New Patient Sent to Optician',
                            'message' => "Patient {$patient->full_name} has been manually sent to optician for spectacle fitting.",
                            'data' => [
                                'patient_name' => $patient->full_name,
                                'consultation_id' => $data->id,
                                'sent_by' => $request->user()->id,
                                'sent_at' => now()->toISOString()
                            ],
                            'status' => 'unread'
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to create optician notification for manual send', [
                        'error' => $e->getMessage(),
                        'patient_id' => $patient->id ?? 'unknown'
                    ]);
                }
            }

            if ($request->refraction) {
                $data->refraction->update($request->refraction);
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
                'what' => 'required|in:Consultation,Visual Acuity,External Examination,Functional Test,Refraction,Fundoscopy'
            ]);

            $user = $request->user();
            $data = Consultation::findOrFail($id);

            switch ($request->what) {
                case 'Consultation': {
                    $request->validate([
                        'patient_to_return' => 'sometimes|required|in:Yes,No',
                        'to_return_date' => 'nullable|date_format:Y-m-d',
                        'require_glass' => 'sometimes|required|in:Yes,No',
                    ]);
                    $data->update($request->except('what'));
                }
                break;
                case 'External Examination': {
                    if ($data->external_examination) {
                        $data->external_examination->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationExternalExamination::create($input);
                    }
                }
                break;
                case 'Functional Test': {
                    if ($data->functional_tests) {
                        $data->functional_tests->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFunctionalTest::create($input);
                    }
                }
                break;
                case 'Visual Acuity': {
                    if ($data->visual_acuity) {
                        $data->visual_acuity->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationVisualAcuity::create($input);
                    }
                }
                break;
                case 'Refraction': {
                    if ($data->refraction) {
                        $data->refraction->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationRefraction::create($input);
                    }
                }
                break;
                case 'Fundoscopy': {
                    if ($data->fundoscopy) {
                        $data->fundoscopy->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFundoscopy::create($input);
                    }
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
            $request->validate([
                'patient_to_return' => 'nullable|in:Yes,No',
                'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
                'require_glass' => 'nullable|in:Yes,No',
                'info_source_id' => 'nullable|exists:information_sources,id',
            ]);

            $user = $request->user();
            $data = Consultation::findOrFail($id);
            $input = $request->only('chief_complaint', 'history_present_illness', 'family_history', 'general_health', 'family_ocular_history', 'family_general_history', 'pupils', 'extra_ocular_muscles', 'patient_to_return', 'to_return_date', 'remarks', 'require_glass');
            $input['status'] = 'Consulted';

            $data->update($input);

            if ($request->visual_acuity) {
                $data->visual_acuity->update($request->visual_acuity);
            }

            if ($request->external_examination) {
                $data->external_examination->update($request->external_examination);
            }

            if ($request->functional_tests) {
                $data->functional_tests->update($request->functional_tests);
            }

            if ($request->refraction) {
                $data->refraction->update($request->refraction);
            }

            if ($request->fundoscopy) {
                $data->fundoscopy->update($request->fundoscopy);
            }

            // Update payment cache item status and consultant
            $data->payment_cache_item->update([
                'consultant_id' => $user->id,
            ]);

            // Balance decrement removed — balance tracks import quantity only

            // Check if patient waiting time should be completed after consultation (optimized)
            try {
                $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                if ($patient) {
                    // Use a more efficient query with eager loading
                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $data->created_at->format('Y-m-d'))
                        ->where('status', 'in_treatment')
                        ->first();
                        
                    if ($waitingTime && $waitingTime->hasCompletedFullJourney()) {
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

            // send message to patient (dispatch to queue to avoid timeout)
            if ($data->patient_direction == 'Direct to Doctor') {
                // Dispatch the job asynchronously to prevent timeout
                try {
                    // Use dispatch instead of dispatch()->onQueue() to avoid queue configuration issues
                    SendConsultationMessageJob::dispatch($data);
                } catch (\Exception $e) {
                    // Log the error but don't fail the request
                    \Log::warning('Failed to dispatch SMS job', [
                        'consultation_id' => $data->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // update source of information
            if ($request->info_source_id) {
                $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                $patient->info_source_id = $request->info_source_id;
                $patient->save();
            }

            // Trigger notification refresh for real-time updates
            try {
                event(new \App\Events\NotificationUpdate());
                \Log::info('Consultation completed - notification refresh triggered', [
                    'consultation_id' => $data->id,
                    'patient_id' => $data->patient->id ?? 'Unknown',
                    'status' => $data->status
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification refresh after consultation completion', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage()
                ]);
            }

            \Log::info('Clinical notes completed successfully', [
                'consultation_id' => $data->id,
                'patient_id' => $data->patient->id ?? 'Unknown',
                'user_id' => $user->id,
                'status' => $data->status
            ]);

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

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
