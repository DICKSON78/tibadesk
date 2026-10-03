<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Stocktake;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InventoryManagementDashboardController extends Controller
{
    use ApiResponse;

    /**
     * Safely execute a callback and return a default on failure.
     */
    protected function safe($callback, $default)
    {
        try {
            return $callback();
        } catch (\Throwable $e) {
            \Log::error('InventoryManagementDashboard query failed', ['error' => $e->getMessage()]);
            return $default;
        }
    }

    public function __invoke(Request $request)
    {
        $user = $request->user();
        // Default to current week if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $data = [
            'summary' => [],
            'statistics' => [],
        ];

        // Get inventory statistics using the items table for backward compatibility
        $data['summary']['total_items'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->count();
        }, 0);

        $data['summary']['low_stock_items'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where(function($query) {
                    $query->whereRaw('items.balance <= items.minimum_stock AND items.minimum_stock > 0')
                          ->orWhere('items.balance', 0);
                })
                ->count();
        }, 0);

        // Calculate stock in today from stocktakes
        $data['summary']['stock_in_today'] = $this->safe(function () use ($clinic_id) {
            return Stocktake::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', Carbon::today())
                ->count();
        }, 0);

        // Calculate stock out today from dispensing
        $data['summary']['stock_out_today'] = $this->safe(function () use ($clinic_id) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', Carbon::today())
                ->whereNotNull('patient_payment_cache_items.item_id')
                ->count();
        }, 0);

        // Get inventory items by type
        $data['statistics']['items_by_type'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->select('item_types.name', DB::raw('count(*) as count'))
                ->groupBy('item_types.id', 'item_types.name')
                ->get();
        }, []);

        // Get top dispensed inventory items
        $data['statistics']['top_items'] = $this->safe(function () use ($clinic_id, $start_date, $end_date) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', '>=', $start_date)
                ->whereDate('patient_payment_cache.created_at', '<=', $end_date)
                ->whereNotNull('patient_payment_cache_items.item_id')
                ->select('items.name', DB::raw('sum(patient_payment_cache_items.quantity) as total_quantity'), DB::raw('sum(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_revenue'))
                ->groupBy('items.id', 'items.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(5)
                ->get();
        }, []);

        // Get inventory dispensing trend (last 7 days)
        $data['statistics']['dispensing_trend'] = $this->safe(function () use ($clinic_id) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(7))
                ->whereNotNull('patient_payment_cache_items.item_id')
                ->select(DB::raw('DATE(patient_payment_cache.created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        }, []);

        return $this->sendResponse($data, Response::HTTP_OK, 'Inventory Management Dashboard data retrieved successfully.');
    }
}
