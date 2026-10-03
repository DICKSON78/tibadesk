<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ConsultationRoomDashboardController extends Controller
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
            'summary' => [
                'total_consultations' => 0,
                'consultations_today' => 0,
                'scheduled_consultations' => 0,
                'pending_consultations' => 0,
                'completed_consultations' => 0,
                'total_patients_consulted' => 0,
                'clinical_notes_created' => 0,
                'prescriptions_written' => 0,
                'dental_examinations' => 0,
            ],
            'statistics' => [
                'consultations_by_status' => [],
                'consultations_by_doctor' => [],
                'top_diagnosis' => [],
                'consultations_trend' => [],
            ],
        ];

        // Total consultations
        $data['summary']['total_consultations'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Consultations today
        $data['summary']['consultations_today'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', $today)
            ->count();

        // Scheduled consultations
        $data['summary']['scheduled_consultations'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Scheduled')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Pending consultations
        $data['summary']['pending_consultations'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Completed consultations
        $data['summary']['completed_consultations'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Completed')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Total patients consulted
        $data['summary']['total_patients_consulted'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereBetween('created_at', [$start_date, $end_date])
            ->distinct('payment_cache_item_id')
            ->count('payment_cache_item_id');

        // Clinical notes created (approximation based on consultations with notes)
        $data['summary']['clinical_notes_created'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereNotNull('remarks')
            ->where('remarks', '!=', '')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Prescriptions written (approximation based on pharmacy items)
        $data['summary']['prescriptions_written'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Pharmacy');
            })
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Dental examinations (count of all consulted patients)
        $data['summary']['dental_examinations'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Consulted')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Consultations by status
        $data['statistics']['consultations_by_status'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereBetween('created_at', [$start_date, $end_date])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Consultations by doctor
        $data['statistics']['consultations_by_doctor'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereBetween('consultations.created_at', [$start_date, $end_date])
            ->join('users', 'consultations.created_by', '=', 'users.id')
            ->select(
                DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.middle_name, ''), ' ', users.last_name) as doctor_name"),
                DB::raw('count(*) as count')
            )
            ->groupBy('users.id', 'users.first_name', 'users.middle_name', 'users.last_name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Consultations trend (last 7 days)
        $data['statistics']['consultations_trend'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', $date)
                ->count();

            $data['statistics']['consultations_trend'][] = [
                'date' => $date,
                'count' => $count
            ];
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Consultation room dashboard data retrieved successfully.');
    }
}
