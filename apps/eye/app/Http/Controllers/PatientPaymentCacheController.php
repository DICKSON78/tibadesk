<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCache;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientPaymentCacheController extends Controller
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
            'include_optician_glass' => 'sometimes|in:true,false,1,0'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $item_status = $request->item_status;
        $item_payment_mode_id = $request->item_payment_mode_id;
        $item_transaction_type = $request->item_transaction_type;
        $item_consultation_type = $request->item_consultation_type;
        $is_stock_item = $request->is_stock_item;
        $item_consultant_id = $request->item_consultant_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $include_optician_glass = filter_var($request->include_optician_glass, FILTER_VALIDATE_BOOLEAN);

        $data = PatientPaymentCache::with(['check_in.patient', 'check_in.payment_mode', 'creator', 'consultation', 'items.consultation_type', 'items.item']);

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
            $data->whereHas('check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        // Handle the main query logic
        if ($include_optician_glass) {
            // When including optician glass, we need to show both regular cash patients AND optician glass patients
            $data->where(function ($query) use ($item_status, $item_transaction_type, $start_date, $end_date) {
                // Regular cash patients (pharmacy items)
                $query->whereHas('items', function ($subQuery) use ($item_status, $item_transaction_type) {
                    if ($item_status) {
                        $statuses = explode(',', $item_status);
                        if (count($statuses) > 1) {
                            $subQuery->whereIn('status', $statuses);
                        } else {
                            $subQuery->where('status', $statuses[0]);
                        }
                    }
                    
                    if ($item_transaction_type) {
                        $subQuery->whereHas('payment_mode', function ($query2) use ($item_transaction_type) {
                            $query2->where('transaction_type', $item_transaction_type);
                        });
                    }
                });
                
                // OR optician glass patients
                $query->orWhere(function ($subQuery) use ($item_status, $start_date, $end_date) {
                    $subQuery->whereHas('items', function ($itemQuery) use ($item_status) {
                        if ($item_status) {
                            $statuses = explode(',', $item_status);
                            if (count($statuses) > 1) {
                                $itemQuery->whereIn('status', $statuses);
                            } else {
                                $itemQuery->where('status', $statuses[0]);
                            }
                        }
                        
                        $itemQuery->whereHas('consultation_type', function ($typeQuery) {
                            $typeQuery->where('name', 'Glass');
                        });
                        
                        $itemQuery->whereHas('payment_mode', function ($modeQuery) {
                            $modeQuery->where('transaction_type', 'Cash');
                        });
                    })
                    ->whereHas('consultation', function ($consultationQuery) {
                        $consultationQuery->whereNotNull('sent_to_optician_at')
                                         ->where('require_glass', 'Yes');
                    });
                });
            });
        } else {
            // Regular filtering logic
            $data->whereHas('items', function ($query) use ($item_status, $item_consultation_type, $is_stock_item, $item_consultant_id, $item_payment_mode_id, $item_transaction_type) {
                // Status filter
                if ($item_status) {
                    $statuses = explode(',', $item_status);
                    if (count($statuses) > 1) {
                        $query->whereIn('status', $statuses);
                    } else {
                        $query->where('status', $statuses[0]);
                    }
                }
                
                // Consultation type filter
                if ($item_consultation_type) {
                    $query->whereHas('consultation_type', function ($query2) use ($item_consultation_type) {
                        $query2->where('name', $item_consultation_type);
                    });
                }
                
                // Stock item filter
                if ($is_stock_item) {
                    $query->whereHas('item', function ($query2) use ($is_stock_item) {
                        $query2->where('is_stock_item', $is_stock_item);
                    });
                }
                
                // Consultant filter
                if ($item_consultant_id) {
                    $query->where('consultant_id', $item_consultant_id);
                }
                
                // Payment mode filter
                if ($item_payment_mode_id) {
                    $query->whereHas('payment_mode', function ($query2) use ($item_payment_mode_id) {
                        $query2->where('id', $item_payment_mode_id);
                    });
                }
                
                // Transaction type filter
                if ($item_transaction_type) {
                    $query->whereHas('payment_mode', function ($query2) use ($item_transaction_type) {
                        $query2->where('transaction_type', $item_transaction_type);
                    });
                }
            });
        }

        // Apply date filtering
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
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientPaymentCache::with(['check_in.patient', 'items', 'creator', 'consultation'])->findOrFail($id);
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
