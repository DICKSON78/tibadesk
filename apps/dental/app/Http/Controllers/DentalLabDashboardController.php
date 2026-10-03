<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCacheItem;
use App\Models\DentalLabOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DentalLabDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $clinic_id = (!$user || $user->is_admin) ? $request->clinic_id : $user->clinic_id;

        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');
        $today = Carbon::today()->format('Y-m-d');

        $baseQuery = function ($query) use ($clinic_id) {
            if ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            }
        };

        $baseQueryPayment = function ($query) use ($clinic_id) {
            if ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            }
        };

        // Status counts (all time, not date-filtered for dashboard overview)
        $statusCounts = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total_orders = array_sum($statusCounts);

        // Today's impressions (orders created today)
        $today_impressions = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->whereDate('created_at', $today)
            ->count();

        // Today's deliveries (orders marked ready/delivered today)
        $today_deliveries = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->whereDate('delivery_date', $today)
            ->count();

        // Overdue orders (delivery_date passed and not yet delivered)
        $overdue_orders = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->where('delivery_date', '<', $today)
            ->whereNotIn('status', ['Ready', 'Delivered'])
            ->count();

        // Total cost from lab orders in date range
        $total_cost = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->whereBetween('created_at', [$start_date, $end_date])
            ->sum('cost');

        // Revenue from dental lab items
        $total_revenue = PatientPaymentCacheItem::query()
            ->when($clinic_id, $baseQueryPayment)
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Dental Lab');
            })
            ->where('status', 'Served')
            ->whereBetween('served_at', [$start_date, $end_date])
            ->sum(DB::raw('unit_price * quantity'));

        // Items dispensed
        $items_dispensed = PatientPaymentCacheItem::query()
            ->when($clinic_id, $baseQueryPayment)
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Dental Lab');
            })
            ->where('status', 'Served')
            ->whereBetween('served_at', [$start_date, $end_date])
            ->count();

        // Recent orders (last 10)
        $recent_orders = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->with(['payment_cache_item' => function ($q) {
                $q->with(['payment_cache.check_in.patient']);
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Patients currently at the lab (have active lab orders not yet delivered)
        $patients_at_lab = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->whereNotIn('status', ['Delivered'])
            ->with([
                'payment_cache_item' => function ($q) {
                    $q->with(['payment_cache.check_in.patient', 'item', 'consultation_type']);
                },
                'consultation',
            ])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Orders by status
        $orders_by_status = DentalLabOrder::query()
            ->when($clinic_id, $baseQuery)
            ->whereBetween('created_at', [$start_date, $end_date])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Top items dispensed
        $top_items_dispensed = PatientPaymentCacheItem::query()
            ->when($clinic_id, $baseQueryPayment)
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Dental Lab');
            })
            ->where('patient_payment_cache_items.status', 'Served')
            ->whereBetween('patient_payment_cache_items.served_at', [$start_date, $end_date])
            ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
            ->select('items.name as item_name', DB::raw('count(*) as count'), DB::raw('sum(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_revenue'))
            ->groupBy('items.id', 'items.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Revenue trend (last 7 days)
        $revenue_trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $revenue = PatientPaymentCacheItem::query()
                ->when($clinic_id, $baseQueryPayment)
                ->whereHas('consultation_type', function ($query) {
                    $query->where('name', 'Dental Lab');
                })
                ->where('status', 'Served')
                ->whereDate('served_at', $date)
                ->sum(DB::raw('unit_price * quantity'));

            $revenue_trend[] = ['date' => $date, 'revenue' => $revenue];
        }

        // Orders trend (last 7 days)
        $orders_trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = DentalLabOrder::query()
                ->when($clinic_id, $baseQuery)
                ->whereDate('created_at', $date)
                ->count();

            $orders_trend[] = ['date' => $date, 'count' => $count];
        }

        $data = [
            'total_orders' => $total_orders,
            'pending_orders' => $statusCounts['Ordered'] ?? 0,
            'in_progress_orders' => $statusCounts['In Progress'] ?? 0,
            'ready_for_delivery' => $statusCounts['Ready'] ?? 0,
            'delivered_orders' => $statusCounts['Delivered'] ?? 0,
            'today_impressions' => $today_impressions,
            'today_deliveries' => $today_deliveries,
            'overdue_orders' => $overdue_orders,
            'total_cost' => (float) $total_cost,
            'total_revenue' => (float) $total_revenue,
            'items_dispensed' => $items_dispensed,
            'recent_orders' => $recent_orders,
            'patients_at_lab' => $patients_at_lab,
            'statistics' => [
                'orders_by_status' => $orders_by_status,
                'top_items_dispensed' => $top_items_dispensed,
                'revenue_trend' => $revenue_trend,
                'orders_trend' => $orders_trend,
            ],
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Dental lab dashboard data retrieved successfully.');
    }
}
