<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PaymentCenterReportsController extends Controller
{
    use ApiResponse;

    public function getPartnerFramePaymentsReport(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'patient_name' => 'sometimes|string',
            'patient_phone' => 'sometimes|string',
            'collaborator_name' => 'sometimes|string',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $patient_name = $request->patient_name;
        $patient_phone = $request->patient_phone;
        $collaborator_name = $request->collaborator_name;

        $data = \App\Models\PatientPaymentCacheItem::with([
            'payment_cache.check_in.patient',
            'item',
        ])
            ->where('is_partner_item', true)
            ->where('status', 'Paid');

        if (!$user->is_admin) {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        } elseif ($clinic_id) {
            $data->whereHas('creator', function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        if ($patient_name) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($collaborator_name) {
            $data->where('collaborator_name', 'like', '%' . $collaborator_name . '%');
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function getCashCollectionReport(Request $request)
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
        $payment_channel_id = $request->payment_channel_id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Regular cash payments (non-installment) - exclude partner items
        $item_payments = PatientItemPayment::with(['channel', 'creator'])
            ->join('patient_payment_cache_items as ppci', function ($join) {
                $join->on('ppci.item_payment_id', '=', 'patient_item_payments.id')
                    ->where(function ($q) {
                        $q->where('ppci.is_partner_item', '!=', true)
                          ->orWhereNull('ppci.is_partner_item');
                    });
            })
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id');

        // Installment bills zilizokamilika siku husika - GROUP BY bill ili ionyeshe jumla moja
        $bill_payments = DB::table('patient_item_bills as pib')
            ->join('patient_item_bill_payments as pibp', 'pibp.bill_id', '=', 'pib.id')
            ->join('patient_payment_cache_items as ppci', function ($join) {
                $join->on('ppci.bill_id', '=', 'pib.id')
                    ->where(function ($q) {
                        $q->where('ppci.is_partner_item', '!=', true)
                          ->orWhereNull('ppci.is_partner_item');
                    });
            })
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
            ->join('users as u', 'pib.cleared_by', '=', 'u.id')
            // Onyesha tu bills zilizokamilika (Cleared)
            ->where('pib.status', 'Cleared')
            // Cleared siku iliyo ndani ya date range
            ->whereRaw('DATE(pib.cleared_at) >= ?', [$start_date])
            ->whereRaw('DATE(pib.cleared_at) <= ?', [$end_date]);

        if (!$user->is_admin) {
            $item_payments->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
            $bill_payments->where('u.clinic_id', $user->clinic_id);
        } elseif ($clinic_id) {
            $item_payments->whereHas('creator', function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });
            $bill_payments->where('u.clinic_id', $clinic_id);
        }

        if ($payment_channel_id) {
            $item_payments->where('patient_item_payments.channel_id', $payment_channel_id);
            $bill_payments->where('pibp.channel_id', $payment_channel_id);
        }

        if ($patient_name) {
            $item_payments->whereRaw('concat(pt.first_name, coalesce(pt.middle_name, ""), pt.last_name) like ?', [str_replace(' ', '', '%' . $patient_name . '%')]);
            $bill_payments->whereRaw('concat(pt.first_name, coalesce(pt.middle_name, ""), pt.last_name) like ?', [str_replace(' ', '', '%' . $patient_name . '%')]);
        }

        if ($patient_id) {
            $item_payments->where('pch.patient_id', $patient_id);
            $bill_payments->where('pch.patient_id', $patient_id);
        }

        if ($patient_gender) {
            $item_payments->where('pt.gender', $patient_gender);
            $bill_payments->where('pt.gender', $patient_gender);
        }

        if ($patient_phone) {
            $item_payments->where('pt.phone', 'like', '%' . $patient_phone . '%');
            $bill_payments->where('pt.phone', 'like', '%' . $patient_phone . '%');
        }

        if ($start_date) {
            $item_payments->whereDate('patient_item_payments.created_at', '>=', $start_date);
        }

        if ($end_date) {
            $item_payments->whereDate('patient_item_payments.created_at', '<=', $end_date);
        }

        $item_payments->select(
            DB::raw("'Cash' as transaction_type"),
            'patient_item_payments.id as source_id',
            'pt.first_name', 'pt.middle_name', 'pt.last_name',
            'pch.patient_id', 'channel_id',
            'patient_item_payments.amount',
            'patient_item_payments.discount',
            'patient_item_payments.created_at',
            'patient_item_payments.created_by',
            DB::raw('group_concat(it.name separator ", ") as items')
        )->groupBy('patient_item_payments.id');

        // Bill payments - GROUP BY pib.id ili ionyeshe mstari MMOJA na jumla ya deni lote
        $bill_payments->select(
            DB::raw("'Installment Completed' as transaction_type"),
            'pib.id as source_id',
            'pt.first_name', 'pt.middle_name', 'pt.last_name',
            'pch.patient_id',
            DB::raw('NULL as channel_id'),
            // Jumla ya deni lote (amount - discount) sio installments moja moja
            DB::raw('(pib.amount - pib.discount) as amount'),
            DB::raw('pib.discount as discount'),
            'pib.cleared_at as created_at',
            'pib.cleared_by as created_by',
            DB::raw('group_concat(DISTINCT it.name separator ", ") as items')
        )->groupBy('pib.id');

        $data = $item_payments->union($bill_payments);
        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function getCashCollectionRecord($type, $id)
    {
        if ($type === 'cash') {
            $payment = PatientItemPayment::with([
                'channel',
                'creator',
                'items' => function ($query) {
                    $query->with(['item:id,name,code', 'payment_cache.check_in.patient']);
                },
            ])->findOrFail($id);

            return $this->sendResponse($payment, Response::HTTP_OK, 'Success.');
        }

        if ($type === 'installment') {
            $bill = PatientItemBill::with([
                'creator',
                'items' => function ($query) {
                    $query->with(['item:id,name,code', 'payment_cache.check_in.patient']);
                },
            ])->findOrFail($id);

            $bill->amount_paid = $bill->payments()->sum('amount');

            return $this->sendResponse($bill, Response::HTTP_OK, 'Success.');
        }

        return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Record not found.');
    }

    public function updateCashCollectionRecord(Request $request, $type, $id)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:patient_payment_cache_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'remove_items' => 'sometimes|array',
            'remove_items.*' => 'integer|exists:patient_payment_cache_items,id',
        ]);

        if ($type === 'cash') {
            $payment = PatientItemPayment::findOrFail($id);

            foreach ($request->items as $req) {
                $item = PatientPaymentCacheItem::where('item_payment_id', $id)->find($req['id']);
                if ($item) {
                    $item->quantity = $req['quantity'];
                    $item->save();
                }
            }

            foreach ($request->remove_items ?? [] as $removeId) {
                $item = PatientPaymentCacheItem::where('item_payment_id', $id)->find($removeId);
                if ($item) {
                    $item->item_payment_id = null;
                    $item->status = 'Pending';
                    $item->save();
                }
            }

            $amount = PatientPaymentCacheItem::where('item_payment_id', $id)
                ->get()
                ->sum(function ($item) {
                    return $item->unit_price * $item->quantity;
                });

            $payment->amount = $amount;
            $payment->save();

            return $this->sendResponse($payment, Response::HTTP_OK, 'Payment updated successfully.');
        }

        if ($type === 'installment') {
            $bill = PatientItemBill::findOrFail($id);

            foreach ($request->items as $req) {
                $item = PatientPaymentCacheItem::where('bill_id', $id)->find($req['id']);
                if ($item) {
                    $item->quantity = $req['quantity'];
                    $item->save();
                }
            }

            foreach ($request->remove_items ?? [] as $removeId) {
                $item = PatientPaymentCacheItem::where('bill_id', $id)->find($removeId);
                if ($item) {
                    $item->bill_id = null;
                    $item->status = 'Pending';
                    $item->save();
                }
            }

            $amount = PatientPaymentCacheItem::where('bill_id', $id)
                ->get()
                ->sum(function ($item) {
                    return $item->unit_price * $item->quantity;
                });

            $bill->amount = $amount;
            $bill->save();

            return $this->sendResponse($bill, Response::HTTP_OK, 'Bill updated successfully.');
        }

        return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Record not found.');
    }

    public function deleteCashCollectionRecord(Request $request, $type, $id)
    {
        $request->validate([
            'mode' => 'sometimes|in:pending,delete',
        ]);

        $mode = $request->mode ?? 'pending';

        if ($type === 'cash') {
            $payment = PatientItemPayment::findOrFail($id);

            if ($mode === 'delete') {
                PatientPaymentCacheItem::where('item_payment_id', $id)->delete();
            } else {
                PatientPaymentCacheItem::where('item_payment_id', $id)
                    ->update(['item_payment_id' => null, 'status' => 'Pending']);
            }

            $payment->delete();

            return $this->sendResponse($payment, Response::HTTP_OK, 'Payment deleted successfully.');
        }

        if ($type === 'installment') {
            $bill = PatientItemBill::findOrFail($id);

            PatientItemBillPayment::where('bill_id', $id)->delete();

            if ($mode === 'delete') {
                PatientPaymentCacheItem::where('bill_id', $id)->delete();
            } else {
                PatientPaymentCacheItem::where('bill_id', $id)
                    ->update(['bill_id' => null, 'status' => 'Pending']);
            }

            $bill->delete();

            return $this->sendResponse($bill, Response::HTTP_OK, 'Bill deleted successfully.');
        }

        return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Record not found.');
    }
}
