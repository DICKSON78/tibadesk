<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DispensingDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $user = $request->user();
        
        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $data = [
            'summary' => [
                'total_dispensed' => 0,
                'pending_requests' => 0,
                'completed_today' => 0,
                'items_dispensed' => 0,
            ],
            'statistics' => [
                'dispensing_trend' => [],
            ],
        ];

        // Calculate total dispensed (items with status "Served")
        $data['summary']['total_dispensed'] = PatientPaymentCacheItem::query()
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('users.clinic_id', $clinic_id);
            })
            ->where('consultation_types.name', 'Pharmacy')
            ->where('patient_payment_cache_items.status', 'Served')
            ->count();

        // Calculate pending requests (items with status "Paid" or "Billed")
        $data['summary']['pending_requests'] = PatientPaymentCacheItem::query()
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('users.clinic_id', $clinic_id);
            })
            ->where('consultation_types.name', 'Pharmacy')
            ->whereIn('patient_payment_cache_items.status', ['Paid', 'Billed'])
            ->count();

        // Calculate completed today (items served today)
        $data['summary']['completed_today'] = PatientPaymentCacheItem::query()
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('users.clinic_id', $clinic_id);
            })
            ->where('consultation_types.name', 'Pharmacy')
            ->where('patient_payment_cache_items.status', 'Served')
            ->whereDate('patient_payment_cache.created_at', Carbon::today())
            ->count();

        // Calculate total items dispensed (sum of quantities)
        $data['summary']['items_dispensed'] = PatientPaymentCacheItem::query()
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('users.clinic_id', $clinic_id);
            })
            ->where('consultation_types.name', 'Pharmacy')
            ->where('patient_payment_cache_items.status', 'Served')
            ->sum('patient_payment_cache_items.quantity');

        // Get dispensing trend for the last 7 days
        $data['statistics']['dispensing_trend'] = PatientPaymentCacheItem::query()
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
            ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('users.clinic_id', $clinic_id);
            })
            ->where('consultation_types.name', 'Pharmacy')
            ->where('patient_payment_cache_items.status', 'Served')
            ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(7))
            ->selectRaw('DATE(patient_payment_cache.created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Dispensing Dashboard data retrieved successfully.');
    }
}
