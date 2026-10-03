<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PaymentCenterDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        try {
            $user = $request->user();
            // Default to today if no dates provided
            $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id;
            }

        $data = [
            'summary' => [
                'total_revenue' => 0,
                'cash_payments' => 0,
                'credit_payments' => 0,
                'pending_bills' => 0,
                'pending_payment_cache' => 0,
                'cleared_bills' => 0,
                'total_expenses' => 0,
                'net_profit' => 0,
                'today_collections' => 0,
            ],
            'statistics' => [
                'payment_trends' => [],
                'revenue_by_payment_mode' => [],
                'top_paying_patients' => [],
                'pending_bills_summary' => [],
            ],
        ];

        // Partner item amounts to exclude from revenue
        $partnerItemAmount = $this->getPartnerItemAmount($clinic_id, $start_date, $end_date);

        // Total revenue: a sale (cash or credit) is recognized once when its bill is
        // cleared. A cash sale previously created BOTH a PatientItemPayment and a
        // Cleared PatientItemBill for the same amount, so summing cleared bills once
        // avoids double-counting.
        $data['summary']['total_revenue'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Cleared')
            ->whereDate('cleared_at', '>=', $start_date)
            ->whereDate('cleared_at', '<=', $end_date)
            ->get()
            ->sum(fn($bill) => $bill->amount - $bill->discount) - $partnerItemAmount;

        // Cash payments - actual cash payments
        $data['summary']['cash_payments'] = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->whereHas('channel', function ($query) {
                $query->where('name', 'Cash');
            })
            ->sum('amount');

        // Credit payments - actual credit payments
        $data['summary']['credit_payments'] = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->whereHas('channel', function ($query) {
                $query->where('name', 'Credit');
            })
            ->sum('amount');

        // Pending bills count (only PatientItemBill records to match the pending bills page)
        $data['summary']['pending_bills'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->count();
            
        // Pending payment cache count (for separate tracking) - should match pending cash patients page
        $data['summary']['pending_payment_cache'] = PatientPaymentCache::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('payment_mode', function ($q) {
                    $q->where('transaction_type', 'Cash');
                });
            })
            ->count();

        // Cleared bills - show all cleared bills (no date filter to match the bills page)
        $data['summary']['cleared_bills'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Cleared')
            ->count();

        // Total expenses
        $data['summary']['total_expenses'] = Expense::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('total_amount');

        // Net profit
        $data['summary']['net_profit'] = $data['summary']['total_revenue'] - $data['summary']['total_expenses'];

        // Today's collections — regular cash payments + fully cleared bills (cleared today)
        // Partial installment payments are excluded until the bill is fully cleared
        // Partner frame payments are excluded from daily collections
        $today = Carbon::today()->format('Y-m-d');
        $todayPartnerItemAmount = $this->getPartnerItemAmount($clinic_id, $today, $today);

        $todayClearedBills = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Cleared')
            ->whereDate('cleared_at', Carbon::today())
            ->get()
            ->sum(fn($bill) => $bill->amount - $bill->discount);

        $data['summary']['today_collections'] = $todayClearedBills - $todayPartnerItemAmount;

        // Payment trends (last 7 days) — cleared bills recognized on the day paid
        $data['statistics']['payment_trends'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $partnerAmount = $this->getPartnerItemAmount($clinic_id, $date, $date);

            $clearedRevenue = PatientItemBill::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Cleared')
                ->whereDate('cleared_at', $date)
                ->get()
                ->sum(fn($bill) => $bill->amount - $bill->discount);

            $data['statistics']['payment_trends'][] = [
                'date' => $date,
                'revenue' => $clearedRevenue - $partnerAmount
            ];
        }

        // Revenue by payment mode (actual data)
        $clearedBillsAmount = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Cleared')
            ->whereDate('cleared_at', '>=', $start_date)
            ->whereDate('cleared_at', '<=', $end_date)
            ->get()
            ->sum(fn($bill) => $bill->amount - $bill->discount);

        $data['statistics']['revenue_by_payment_mode'] = collect([
            ['payment_mode' => 'Cash', 'total_amount' => $data['summary']['cash_payments']],
            ['payment_mode' => 'Credit', 'total_amount' => $data['summary']['credit_payments']],
            ['payment_mode' => 'Cleared Bills', 'total_amount' => $clearedBillsAmount],
        ]);

        // Top paying patients (real data)
        $data['statistics']['top_paying_patients'] = DB::table('patients')
            ->joinSub(
                DB::table('patient_item_payments as pip')
                    ->selectRaw('DISTINCT pip.id, pip.created_by, patients.id as patient_id, pip.amount')
                    ->join('patient_payment_cache_items as ipci', 'ipci.item_payment_id', '=', 'pip.id')
                    ->join('patient_payment_cache as ppc', 'ppc.id', '=', 'ipci.payment_cache_id')
                    ->join('patient_check_ins as pci', 'pci.id', '=', 'ppc.check_in_id')
                    ->join('patients', 'patients.id', '=', 'pci.patient_id')
                    ->whereDate('pip.created_at', '>=', $start_date)
                    ->whereDate('pip.created_at', '<=', $end_date),
                'sub',
                'patients.id',
                '=',
                'sub.patient_id'
            )
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->join('users', 'users.id', '=', 'sub.created_by')
                    ->where('users.clinic_id', $clinic_id);
            })
            ->groupBy('patients.id', 'patients.first_name', 'patients.last_name')
            ->select(
                'patients.id',
                'patients.first_name',
                'patients.last_name',
                DB::raw('CONCAT(patients.first_name, " ", patients.last_name) as patient_name'),
                DB::raw('COALESCE(SUM(sub.amount), 0) as total_paid')
            )
            ->orderBy('total_paid', 'desc')
            ->limit(3)
            ->get();

        // Pending bills summary
        $data['statistics']['pending_bills_summary'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->select('status', DB::raw('count(*) as count'), DB::raw('sum(amount) as total_amount'))
            ->groupBy('status')
            ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Payment Center Dashboard data retrieved successfully.');
        
        } catch (\Throwable $e) {
            \Log::error('PaymentCenterDashboard failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return safe default data instead of 500 error
            return $this->sendResponse([
                'summary' => [
                    'total_revenue' => 0,
                    'cash_payments' => 0,
                    'credit_payments' => 0,
                    'pending_bills' => 0,
                    'pending_payment_cache' => 0,
                    'cleared_bills' => 0,
                    'total_expenses' => 0,
                    'net_profit' => 0,
                    'today_collections' => 0,
                ],
                'statistics' => [
                    'payment_trends' => [],
                    'revenue_by_payment_mode' => [],
                    'top_paying_patients' => [],
                    'pending_bills_summary' => [],
                ],
            ], Response::HTTP_OK, 'Dashboard data temporarily unavailable.');
        }
    }

    private function getPartnerItemAmount($clinic_id, $start_date, $end_date)
    {
        return PatientPaymentCacheItem::query()
            ->where('is_partner_item', true)
            ->where('status', 'Paid')
            ->whereHas('item_payment', function ($query) use ($clinic_id, $start_date, $end_date) {
                $query->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($q2) use ($clinic_id) {
                        $q2->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date);
            })
            ->get()
            ->sum(fn($item) => ($item->unit_price * $item->quantity));
    }
}
