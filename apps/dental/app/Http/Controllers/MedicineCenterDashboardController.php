<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCache;
use App\Models\Medicine;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\StockAlertsController;

class MedicineCenterDashboardController extends Controller
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
            \Log::error('MedicineCenterDashboard query failed', ['error' => $e->getMessage()]);
            return $default;
        }
    }

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

        // Get medicine dispensing statistics
        $data['summary']['total_medicines_dispensed'] = $this->safe(function () use ($clinic_id, $start_date, $end_date) {
            return PatientPaymentCache::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('items', function ($query) {
                    $query->whereHas('consultation_type', function ($q) {
                        $q->where('name', 'Pharmacy');
                    });
                    $query->where('status', 'Served');
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        }, 0);

        $data['summary']['pending_medicines'] = $this->safe(function () use ($clinic_id, $start_date, $end_date) {
            return PatientPaymentCache::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('items', function ($query) {
                    $query->whereHas('consultation_type', function ($q) {
                        $q->where('name', 'Pharmacy');
                    });
                    $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        }, 0);

        // Get medicine-specific statistics using the new Medicine model
        $data['summary']['total_medicine_items'] = $this->safe(function () use ($clinic_id) {
            return Medicine::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->where('status', 'Active')
                ->count();
        }, 0);

        // Get medicine alerts summary
        try {
            $medicineAlertsSummary = app(StockAlertsController::class)->getMedicineAlertsSummary();
            $medicineAlertsData = json_decode($medicineAlertsSummary->getContent(), true);
            
            if ($medicineAlertsData['success']) {
                $data['summary']['low_stock_medicines'] = $medicineAlertsData['data']['out_of_stock_count'];
                $data['summary']['expired_medicines'] = $medicineAlertsData['data']['expired_count'];
                $data['summary']['expiring_soon_medicines'] = $medicineAlertsData['data']['expiring_soon_count'];
                $data['summary']['total_medicine_alerts'] = $medicineAlertsData['data']['total_alerts'];
            } else {
                $data['summary']['low_stock_medicines'] = 0;
                $data['summary']['expired_medicines'] = 0;
                $data['summary']['expiring_soon_medicines'] = 0;
                $data['summary']['total_medicine_alerts'] = 0;
            }
        } catch (\Throwable $e) {
            \Log::error('Medicine alerts summary section failed', ['error' => $e->getMessage()]);
            $data['summary']['low_stock_medicines'] = 0;
            $data['summary']['expired_medicines'] = 0;
            $data['summary']['expiring_soon_medicines'] = 0;
            $data['summary']['total_medicine_alerts'] = 0;
        }

        // Get medicine dispensing by status
        $query = DB::table('patient_payment_cache_items')
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->where('consultation_types.name', 'Pharmacy');
        
        if ($clinic_id) {
            $query->where('users.clinic_id', $clinic_id);
        }
        
        $data['statistics']['medicines_by_status'] = $this->safe(function () use ($query, $start_date, $end_date) {
            return $query
                ->whereDate('patient_payment_cache.created_at', '>=', $start_date)
                ->whereDate('patient_payment_cache.created_at', '<=', $end_date)
                ->select('patient_payment_cache_items.status', DB::raw('count(*) as count'))
                ->groupBy('patient_payment_cache_items.status')
                ->get();
        }, []);

        // Get top dispensed medicines - handle both old and new data structures
        $topMedicinesQuery = DB::table('patient_payment_cache_items')
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->leftJoin('medicines', 'patient_payment_cache_items.medicine_id', '=', 'medicines.id')
            ->leftJoin('items', function($join) {
                $join->on('patient_payment_cache_items.item_id', '=', 'items.id')
                     ->where('items.is_stock_item', 'Yes');
            })
            ->where('consultation_types.name', 'Pharmacy');
        
        if ($clinic_id) {
            $topMedicinesQuery->where('users.clinic_id', $clinic_id);
        }
        
        $data['statistics']['top_medicines'] = $this->safe(function () use ($topMedicinesQuery, $start_date, $end_date) {
            return $topMedicinesQuery
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', '>=', $start_date)
                ->whereDate('patient_payment_cache.created_at', '<=', $end_date)
                ->select(
                    DB::raw('COALESCE(medicines.name, items.name) as name'),
                    DB::raw('sum(patient_payment_cache_items.quantity) as total_quantity'),
                    DB::raw('sum(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_revenue')
                )
                ->groupBy('medicines.id', 'medicines.name', 'items.id', 'items.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(5)
                ->get();
        }, []);

        // Get medicine dispensing trend (last 7 days)
        $trendQuery = DB::table('patient_payment_cache_items')
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->where('consultation_types.name', 'Pharmacy');
        
        if ($clinic_id) {
            $trendQuery->where('users.clinic_id', $clinic_id);
        }
        
        $data['statistics']['dispensing_trend'] = $this->safe(function () use ($trendQuery) {
            return $trendQuery
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(7))
                ->select(DB::raw('DATE(patient_payment_cache.created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        }, []);

        return $this->sendResponse($data, Response::HTTP_OK, 'Medicine Center Dashboard data retrieved successfully.');
    }
}
