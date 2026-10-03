<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCacheItem;
use App\Models\Consultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OpticianCenterDashboardController extends Controller
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
                    'total_glass_patients' => 0,
                    'glass_patients_today' => 0,
                    'refractions_today' => 0,
                    'lens_fittings' => 0,
                    'scheduled_appointments' => 0,
                    'completed_appointments' => 0,
                    'pending_appointments' => 0,
                    'total_revenue' => 0,
                    'items_dispensed' => 0,
                ],
                'statistics' => [
                    'appointments_by_status' => [],
                    'revenue_trend' => [],
                    'top_items_dispensed' => [],
                    'appointments_trend' => [],
                ],
            ];

        // Total glass patients (sent from reception to optician)
        $data['summary']['total_glass_patients'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereBetween('sent_to_optician_at', [$start_date, $end_date]);
                });
                $query->orWhere(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereBetween('created_at', [$start_date, $end_date]);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->count();

        // Glass patients today (sent from reception to optician)
        $data['summary']['glass_patients_today'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where(function ($query) use ($today) {
                $query->where(function ($subQuery) use ($today) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereDate('sent_to_optician_at', $today);
                });
                $query->orWhere(function ($subQuery) use ($today) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereDate('created_at', $today);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->count();

        // Refractions today (based on glass consultations sent to optician)
        $data['summary']['refractions_today'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where(function ($query) use ($today) {
                $query->where(function ($subQuery) use ($today) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereDate('sent_to_optician_at', $today);
                });
                $query->orWhere(function ($subQuery) use ($today) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereDate('created_at', $today);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->count();

        // Lens fittings (based on glass consultations completed)
        $data['summary']['lens_fittings'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where('status', 'Consulted')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereBetween('sent_to_optician_at', [$start_date, $end_date]);
                });
                $query->orWhere(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereBetween('created_at', [$start_date, $end_date]);
                });
            })
            ->count();

        // Scheduled appointments (glass consultations sent to optician)
        $data['summary']['scheduled_appointments'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where('status', 'Pending')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereBetween('sent_to_optician_at', [$start_date, $end_date]);
                });
                $query->orWhere(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereBetween('created_at', [$start_date, $end_date]);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->count();

        // Completed appointments (glass consultations completed)
        $data['summary']['completed_appointments'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where('status', 'Consulted')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereBetween('sent_to_optician_at', [$start_date, $end_date]);
                });
                $query->orWhere(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereBetween('created_at', [$start_date, $end_date]);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->count();

        // Pending appointments (glass consultations sent to optician but not completed)
        $data['summary']['pending_appointments'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where('status', 'Pending')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereBetween('sent_to_optician_at', [$start_date, $end_date]);
                });
                $query->orWhere(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereBetween('created_at', [$start_date, $end_date]);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->count();

        // Total revenue from glass items (use served_at for Served status, exclude partner items)
        $data['summary']['total_revenue'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Glass');
            })
            ->where('status', 'Served')
            ->where(function ($q) {
                $q->where('is_partner_item', '!=', true)
                  ->orWhereNull('is_partner_item');
            })
            ->whereBetween('served_at', [$start_date, $end_date])
            ->sum(DB::raw('unit_price * quantity'));

        // Items dispensed (use served_at for Served status)
        $data['summary']['items_dispensed'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Glass');
            })
            ->where('status', 'Served')
            ->whereBetween('served_at', [$start_date, $end_date])
            ->count();

        // Appointments by status (glass consultations sent to optician)
        $data['statistics']['appointments_by_status'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('require_glass', 'Yes')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->whereNotNull('sent_to_optician_at');
                    $subQuery->whereBetween('sent_to_optician_at', [$start_date, $end_date]);
                });
                $query->orWhere(function ($subQuery) use ($start_date, $end_date) {
                    $subQuery->where('patient_direction', 'Direct to Optician');
                    $subQuery->whereBetween('created_at', [$start_date, $end_date]);
                });
            })
            ->whereHas('payment_cache_item', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                // Exclude patients whose glass items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Top items dispensed (use served_at, exclude partner items)
        $data['statistics']['top_items_dispensed'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Glass');
            })
            ->where('patient_payment_cache_items.status', 'Served')
            ->where(function ($q) {
                $q->where('patient_payment_cache_items.is_partner_item', '!=', true)
                  ->orWhereNull('patient_payment_cache_items.is_partner_item');
            })
            ->whereBetween('patient_payment_cache_items.served_at', [$start_date, $end_date])
            ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
            ->select('items.name as item_name', DB::raw('count(*) as count'), DB::raw('sum(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_revenue'))
            ->groupBy('items.id', 'items.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Revenue trend (last 7 days) - use served_at, exclude partner items
        $data['statistics']['revenue_trend'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $revenue = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('consultation_type', function ($query) {
                    $query->where('name', 'Glass');
                })
                ->where('status', 'Served')
                ->where(function ($q) {
                    $q->where('is_partner_item', '!=', true)
                      ->orWhereNull('is_partner_item');
                })
                ->whereDate('served_at', $date)
                ->sum(DB::raw('unit_price * quantity'));

            $data['statistics']['revenue_trend'][] = [
                'date' => $date,
                'revenue' => $revenue
            ];
        }

        // Appointments trend (last 7 days) - glass consultations sent to optician
        $data['statistics']['appointments_trend'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('require_glass', 'Yes')
                ->where(function ($query) use ($date) {
                    $query->where(function ($subQuery) use ($date) {
                        $subQuery->whereNotNull('sent_to_optician_at');
                        $subQuery->whereDate('sent_to_optician_at', $date);
                    });
                    $query->orWhere(function ($subQuery) use ($date) {
                        $subQuery->where('patient_direction', 'Direct to Optician');
                        $subQuery->whereDate('created_at', $date);
                    });
                })
                ->whereHas('payment_cache_item', function ($query) {
                    $query->whereHas('consultation_type', function ($query2) {
                        $query2->where('name', 'Glass');
                    });
                    // Exclude patients whose glass items have been served/dispensed
                    $query->where('status', '!=', 'Served');
                })
                ->count();

            $data['statistics']['appointments_trend'][] = [
                'date' => $date,
                'count' => $count
            ];
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Optician center dashboard data retrieved successfully.');
    }
}
