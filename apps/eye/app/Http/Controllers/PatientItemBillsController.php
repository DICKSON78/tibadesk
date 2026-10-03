<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientItemBillsController extends Controller
{
    use ApiResponse;

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
        $status = $request->status;
        $id = $request->id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $with_items = $request->with_items;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $payment_status = $request->payment_status;

        $data = PatientItemBill::with(['first_item.payment_cache.consultation', 'creator'])->whereHas('first_item');

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
            $data->where('status', $status);
        }

        if ($id) {
            $data->where('id', $id);
        }

        if ($patient_name) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($with_items == 'Yes') {
            $data->with(['items' => function ($query) {
                $query->with(['item.unit_of_measure', 'payment_mode', 'creator']);
            }]);
        }

        if ($payment_status === 'partial') {
            $data->whereRaw('(SELECT SUM(amount) FROM patient_item_bill_payments WHERE bill_id = patient_item_bills.id) > 0')
                  ->whereRaw('(SELECT SUM(amount) FROM patient_item_bill_payments WHERE bill_id = patient_item_bills.id) < (patient_item_bills.amount - patient_item_bills.discount)');
        } elseif ($payment_status === 'none') {
            $data->doesntHave('payments');
        } elseif ($payment_status === 'completed') {
            $data->whereRaw('(SELECT SUM(amount) FROM patient_item_bill_payments WHERE bill_id = patient_item_bills.id) >= (patient_item_bills.amount - patient_item_bills.discount)')
                  ->where('status', 'Cleared');
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        // Mpya juu — tumia updated_at ili mgonjwa alipelipa hivi karibuni atokee juu
        $data->orderBy('updated_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $payment_status = $request->payment_status;

        $baseQuery = PatientItemBill::whereHas('first_item');

        if ($user->is_admin) {
            if ($clinic_id) {
                $baseQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $baseQuery->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($status) {
            $baseQuery->where('status', $status);
        }

        if ($patient_name) {
            $baseQuery->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $baseQuery->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $baseQuery->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $baseQuery->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($payment_status === 'partial') {
            $baseQuery->has('payments');
        } elseif ($payment_status === 'none') {
            $baseQuery->doesntHave('payments');
        }

        if ($start_date) {
            $baseQuery->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $baseQuery->whereDate('created_at', '<=', $end_date);
        }

        // Total counts and sums across all matching bills
        $totalAmount = $baseQuery->sum('amount');
        $totalDiscount = $baseQuery->sum('discount');
        $billIds = $baseQuery->pluck('id');
        $totalPaid = \App\Models\PatientItemBillPayment::whereIn('bill_id', $billIds)->sum('amount');
        $totalDebt = $totalAmount - $totalDiscount - $totalPaid;

        // Status-specific counts using fresh queries (clone base filters)
        $totalPending = (clone $baseQuery)->where('status', 'Pending')->doesntHave('payments')->count();
        $totalPartial = (clone $baseQuery)->where('status', 'Pending')->has('payments')->count();
        $totalCompleted = (clone $baseQuery)->where('status', 'Cleared')->count();

        // Total payments made today (across ALL bills, not filtered by payment_status)
        $totalPaidToday = \App\Models\PatientItemBillPayment::whereDate('created_at', Carbon::today())->sum('amount');

        return $this->sendResponse([
            'total_pending' => $totalPending,
            'total_partial' => $totalPartial,
            'total_completed' => $totalCompleted,
            'total_bills' => $totalPending + $totalPartial + $totalCompleted,
            'total_amount' => $totalAmount,
            'total_discount' => $totalDiscount,
            'total_amount_paid' => $totalPaid,
            'total_debt' => $totalDebt,
            'total_paid_today' => $totalPaidToday,
        ], Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        $data = PatientItemBill::with(['creator', 'clearer', 'first_item.payment_cache.consultation'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $data = PatientItemBill::findOrFail($id);
        $data->update($request->only('discount'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function clear(Request $request, $id)
    {
        $data = PatientItemBill::findOrFail($id);

        $totalPaid = $data->payments()->sum('amount');
        $amountDue = $data->amount - $data->discount;

        if ($totalPaid < $amountDue) {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Cannot clear bill: Payment is incomplete. Amount paid: ' . number_format($totalPaid) . ', Required: ' . number_format($amountDue));
        }

        $data->update([
            'status' => 'Cleared',
            'cleared_at' => Carbon::now(),
            'cleared_by' => $request->user()->id,
        ]);

        if ($data->first_item) {
            $patient = $data->first_item->payment_cache->check_in->patient;
            $waitingTime = $patient->current_waiting_time;
            if ($waitingTime) {
                $this->determineNextDepartment($waitingTime, $data->first_item->payment_cache);
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Cleared successfully.');
    }

    public function destroy($id)
    {
        //
    }

    private function determineNextDepartment($waitingTime, $paymentCache)
    {
        $consultation = $paymentCache->consultation;

        $hasGlassItems = $paymentCache->items()
            ->whereHas('consultation_type', function($query) {
                $query->where('name', 'Glass');
            })
            ->count() > 0;

        if (($consultation && $consultation->require_glass === 'Yes') || $hasGlassItems) {
            $waitingTime->sendToConsultation();

            if ($consultation && !$consultation->sent_to_optician_at) {
                $consultation->update([
                    'sent_to_optician_at' => now(),
                    'sent_to_optician_by' => $consultation->creator_id ?? null,
                ]);
            }

            if (!$consultation && $hasGlassItems) {
                $glassItem = $paymentCache->items()
                    ->whereHas('consultation_type', function($query) {
                        $query->where('name', 'Glass');
                    })
                    ->first();

                if ($glassItem) {
                    \App\Models\Consultation::create([
                        'patient_id' => $waitingTime->patient_id,
                        'payment_cache_id' => $paymentCache->id,
                        'require_glass' => 'Yes',
                        'sent_to_optician_at' => now(),
                        'created_by' => auth()->id(),
                    ]);
                }
            }
            return;
        }

        $pendingItems = $paymentCache->items()
            ->where('status', '!=', 'Served')
            ->count();

        if ($pendingItems > 0) {
            $waitingTime->sendToDispensing();
            return;
        }

        $hasProcedures = $paymentCache->items()
            ->whereHas('item.consultation_type', function($query) {
                $query->where('name', 'like', '%Surgery%')
                      ->orWhere('name', 'like', '%Procedure%');
            })
            ->count() > 0;

        if ($hasProcedures) {
            $waitingTime->sendToProcedureRoom();
            return;
        }

        $waitingTime->returnToReception('Bill cleared - treatment complete');
    }
}