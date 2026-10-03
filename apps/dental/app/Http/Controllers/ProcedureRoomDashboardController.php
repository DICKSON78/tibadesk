<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCache;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProcedureRoomDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $user = $request->user();
        // Default to current week if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');

        $data = [
            'summary' => [
                'total_procedures' => 0,
                'scheduled_today' => 0,
                'completed_today' => 0,
                'pending_procedures' => 0,
            ],
            'statistics' => [
                'top_procedures' => [],
                'procedure_trends' => [],
            ],
        ];

        // Get procedure statistics
        $data['summary']['total_procedures'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
        ->whereHas('items', function ($query) {
            $query->whereHas('consultation_type', function ($q) {
                $q->where('name', 'Procedure');
            });
            $query->where('status', 'Served');
        })
        ->whereDate('created_at', '>=', $start_date)
        ->whereDate('created_at', '<=', $end_date)
        ->count();

        $data['summary']['scheduled_today'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
        ->whereHas('items', function ($query) {
            $query->whereHas('consultation_type', function ($q) {
                $q->where('name', 'Procedure');
            });
            $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
        })
        ->whereDate('created_at', Carbon::today())
        ->count();

        $data['summary']['completed_today'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
        ->whereHas('items', function ($query) {
            $query->whereHas('consultation_type', function ($q) {
                $q->where('name', 'Procedure');
            });
            $query->where('status', 'Served');
        })
        ->whereDate('created_at', Carbon::today())
        ->count();

        $data['summary']['pending_procedures'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
        ->whereHas('items', function ($query) {
            $query->whereHas('consultation_type', function ($q) {
                $q->where('name', 'Procedure');
            });
            $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
        })
        ->whereDate('created_at', '>=', $start_date)
        ->whereDate('created_at', '<=', $end_date)
        ->count();

        // Get top procedures
        $data['statistics']['top_procedures'] = DB::table('patient_payment_cache_items')
        ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
        ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
        ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
        ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
        ->where('consultation_types.name', 'Procedure')
        ->where('users.clinic_id', $user->clinic_id)
        ->where('patient_payment_cache_items.status', 'Served')
        ->whereDate('patient_payment_cache.created_at', '>=', $start_date)
        ->whereDate('patient_payment_cache.created_at', '<=', $end_date)
        ->select('items.name', DB::raw('count(*) as count'))
        ->groupBy('items.id', 'items.name')
        ->orderBy('count', 'desc')
        ->limit(5)
        ->get();

        // Get procedure trends (last 7 days)
        $data['statistics']['procedure_trends'] = DB::table('patient_payment_cache_items')
        ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
        ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
        ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
        ->where('consultation_types.name', 'Procedure')
        ->where('users.clinic_id', $user->clinic_id)
        ->where('patient_payment_cache_items.status', 'Served')
        ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(7))
        ->select(DB::raw('DATE(patient_payment_cache.created_at) as date'), DB::raw('count(*) as count'))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Procedure Room Dashboard data retrieved successfully.');
    }
}
