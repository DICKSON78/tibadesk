<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemBill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InstallmentManagementController extends Controller
{
    use ApiResponse;

    /**
     * Get partial payments for installment management
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function partialPayments(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Get today's payment summary
        $todayPaid = PatientItemBillPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', Carbon::today())
            ->sum('amount');

        // Get total outstanding debt (pending bills with payments)
        $totalOutstandingDebt = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->has('payments')
            ->get()
            ->sum(function ($bill) {
                return ($bill->amount - $bill->discount) - $bill->payments->sum('amount');
            });

        // Get partial payments with patient details
        $query = PatientItemBillPayment::with([
            'bill' => function ($q) {
                $q->with(['first_item' => function ($q2) {
                    $q2->with(['payment_cache.check_in.patient', 'payment_mode', 'consultant']);
                }]);
            },
            'channel',
            'creator'
        ]);

        if ($clinic_id) {
            $query->whereHas('creator', function ($q) use ($clinic_id) {
                $q->where('clinic_id', $clinic_id);
            });
        }

        if ($start_date) {
            $query->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $query->whereDate('created_at', '<=', $end_date);
        }

        $query->orderBy('created_at', 'desc');
        $payments = $query->paginate($per_page);

        // Transform the data to match expected table format
        $transformedData = $payments->getCollection()->map(function ($payment) {
            $bill = $payment->bill;
            $firstItem = $bill?->first_item;
            $patient = $firstItem?->payment_cache?->check_in?->patient;
            $totalBill = $bill?->amount ?? 0;
            $totalPaid = $bill?->payments->sum('amount') ?? 0;
            $debtAmount = max(0, ($totalBill - ($bill?->discount ?? 0)) - $totalPaid);
            $paymentProgress = $totalBill > 0 ? round(($totalPaid / $totalBill) * 100, 2) : 0;

            return [
                'id' => $payment->id,
                'patient_name' => $patient?->full_name ?? 'Unknown',
                'patient_number' => $patient?->id ?? null,
                'phone_number' => $patient?->phone ?? null,
                'payment_mode' => $firstItem?->payment_mode?->name ?? null,
                'item' => $firstItem?->item?->name ?? null,
                'consultant' => $firstItem?->consultant?->full_name ?? null,
                'total_bill' => $totalBill,
                'amount_paid' => $payment->amount,
                'debt_amount' => $debtAmount,
                'payment_progress' => $paymentProgress,
                'created_by' => $payment->creator?->full_name ?? null,
                'date_created' => $payment->created_at,
                'payment_channel' => $payment->channel?->name ?? null,
                'bill_id' => $bill?->id,
            ];
        });

        $payments->setCollection($transformedData);

        return $this->sendResponse([
            'summary' => [
                'total_paid_today' => $todayPaid,
                'total_outstanding_debt' => $totalOutstandingDebt,
            ],
            'payments' => $payments,
        ], Response::HTTP_OK, 'Success.');
    }
}
