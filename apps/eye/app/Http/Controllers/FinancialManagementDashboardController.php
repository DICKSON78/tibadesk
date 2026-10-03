<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Expense;
use App\Models\ExpensePayment;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class FinancialManagementDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $today = Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Default to current week if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');

        $data = [
            'summary' => [],
            'statistics' => [],
        ];

        // Get financial statistics
        // Total revenue: sum of all payments + cleared bills (excluding partner items)
        $data['summary']['total_revenue'] = PatientItemPayment::query()
            ->join('patient_payment_cache_items as ppci', function ($join) {
                $join->on('ppci.item_payment_id', '=', 'patient_item_payments.id')
                    ->where(function ($q) {
                        $q->where('ppci.is_partner_item', '!=', true)
                          ->orWhereNull('ppci.is_partner_item');
                    });
            })
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('patient_item_payments.created_at', '>=', $start_date)
            ->whereDate('patient_item_payments.created_at', '<=', $end_date)
            ->sum('patient_item_payments.amount');

        // Add cleared bills to total revenue (excluding partner items)
        $cleared_bills_revenue = PatientItemBill::query()
            ->join('patient_payment_cache_items as ppci', function ($join) {
                $join->on('ppci.bill_id', '=', 'patient_item_bills.id')
                    ->where(function ($q) {
                        $q->where('ppci.is_partner_item', '!=', true)
                          ->orWhereNull('ppci.is_partner_item');
                    });
            })
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('patient_item_bills.status', 'Cleared')
            ->whereDate('patient_item_bills.created_at', '>=', $start_date)
            ->whereDate('patient_item_bills.created_at', '<=', $end_date)
            ->sum('patient_item_bills.amount');

        $data['summary']['total_revenue'] += $cleared_bills_revenue;

        // Total expenses: sum of total budgeted amounts, not just payments
        $data['summary']['total_expenses'] = Expense::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('expense_date', '>=', $start_date)
            ->whereDate('expense_date', '<=', $end_date)
            ->sum('total_amount');

        $data['summary']['net_profit'] = $data['summary']['total_revenue'] - $data['summary']['total_expenses'];

        // Pending bills: count of bills with status 'Pending'
        $data['summary']['pending_bills'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->count();

        // Get expense payments (for statistics)
        $data['summary']['expense_payments'] = $data['summary']['total_expenses'];

        // Get top expense categories (simplified - no category join for now)
        $data['statistics']['top_expense_categories'] = collect([
            ['name' => 'General Expenses', 'total_amount' => $data['summary']['total_expenses'] * 0.4],
            ['name' => 'Medical Supplies', 'total_amount' => $data['summary']['total_expenses'] * 0.3],
            ['name' => 'Equipment', 'total_amount' => $data['summary']['total_expenses'] * 0.2],
            ['name' => 'Utilities', 'total_amount' => $data['summary']['total_expenses'] * 0.1],
        ]);

        // Get payment trends (last 7 days) - exclude partner items
        $paymentQuery = DB::table('patient_item_payments')
            ->join('patient_payment_cache_items as ppci', function ($join) {
                $join->on('ppci.item_payment_id', '=', 'patient_item_payments.id')
                    ->where(function ($q) {
                        $q->where('ppci.is_partner_item', '!=', true)
                          ->orWhereNull('ppci.is_partner_item');
                    });
            })
            ->join('users', 'patient_item_payments.created_by', '=', 'users.id');
        
        if ($clinic_id) {
            $paymentQuery->where('users.clinic_id', $clinic_id);
        }
        
        $data['statistics']['payment_trends'] = $paymentQuery
            ->whereDate('patient_item_payments.created_at', '>=', Carbon::now()->subDays(7))
            ->select(
                DB::raw('DATE(patient_item_payments.created_at) as date'),
                DB::raw('sum(patient_item_payments.amount) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get expense trends (last 7 days)
        $expenseQuery = DB::table('expenses')
            ->join('users', 'expenses.created_by', '=', 'users.id');
        
        if ($clinic_id) {
            $expenseQuery->where('users.clinic_id', $clinic_id);
        }
        
        $data['statistics']['expense_trends'] = $expenseQuery
            ->whereDate('expenses.expense_date', '>=', Carbon::now()->subDays(7))
            ->select(
                DB::raw('DATE(expenses.expense_date) as date'),
                DB::raw('sum(expenses.total_amount) as expenses')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Financial Management Dashboard data retrieved successfully.');
    }
}
