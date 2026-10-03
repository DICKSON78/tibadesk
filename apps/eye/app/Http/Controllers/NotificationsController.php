<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCache;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationsController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $user = $request->user();
        // Show only recent data - last 3 days for new notifications
        $start_date = Carbon::now()->subDays(3)->startOfDay()->format('Y-m-d');
        $end_date = Carbon::today()->endOfDay()->format('Y-m-d');

        $data = [
            'patients_sent_to_cashier' => 0,
            'credit_patients_approval' => 0,
            'patients_sent_to_doctor' => 0,
            'patients_sent_to_optician' => 0,
            'glass_patients' => 0,
            'dispensing_requests' => 0,
            'procedure_requests' => 0,
            'other_dispensing_requests' => 0,
            'patients_to_return' => 0,
            'glass_dispensing_requests' => 0,
            'vip_patients' => 0,
            'spectacle_patients' => 0,
            'waiting_patients' => 0,
        ];

        $data['patients_sent_to_cashier'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('payment_mode', function ($query2) {
                    $query2->where('transaction_type', 'Cash');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Add patients sent to optician with unpaid glass items to cashier notifications
        $opticianUnpaidGlass = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                $query->whereHas('payment_mode', function ($query2) {
                    $query2->where('transaction_type', 'Cash');
                });
            })
            ->whereHas('consultation', function ($query) {
                $query->whereNotNull('sent_to_optician_at');
                $query->where('require_glass', 'Yes');
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['patients_sent_to_cashier'] += $opticianUnpaidGlass;

        $data['credit_patients_approval'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('payment_mode', function ($query2) {
                    $query2->where('transaction_type', 'Credit');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Add patients sent to optician with unpaid glass items to credit notifications
        $opticianUnpaidGlassCredit = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
                $query->whereHas('payment_mode', function ($query2) {
                    $query2->where('transaction_type', 'Credit');
                });
            })
            ->whereHas('consultation', function ($query) {
                $query->whereNotNull('sent_to_optician_at');
                $query->where('require_glass', 'Yes');
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['credit_patients_approval'] += $opticianUnpaidGlassCredit;

        $data['patients_sent_to_doctor'] = Consultation::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where('status', 'Pending')
            ->whereHas('payment_cache_item', function ($query) {
                // Only show consultations for items that require consultation
                $query->whereHas('item', function ($itemQuery) {
                    $itemQuery->where('is_consultation_item', 'Yes');
                });
                // Ensure the payment cache item is paid (came from cashier)
                $query->where('status', 'Paid');
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['patients_sent_to_optician'] = Consultation::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where(function ($query) {
                $query->where('require_glass', 'Yes')
                      ->orWhereNotNull('sent_to_optician_at')
                      ->orWhere('patient_direction', 'Direct to Optician')
                      ->orWhere('patient_direction', 'Sent to Optician');
            })
            ->whereHas('payment_cache_item', function ($query) {
                // Exclude patients whose items have been served/dispensed
                $query->where('status', '!=', 'Served');
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['glass_patients'] = Consultation::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where('require_glass', 'Yes')
            ->whereNull('sent_to_optician_at')
            ->where('patient_direction', '!=', 'Direct to Optician')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['dispensing_requests'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Pharmacy');
                });
                $query->whereHas('item', function ($query2) {
                    $query2->where('is_stock_item', 'Yes');
                });
            })
            // Match page window: last 3 days
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Add glass dispensing requests
        $data['glass_dispensing_requests'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });
            })
            ->whereHas('consultation', function ($query) {
                $query->whereNotNull('sent_to_optician_at');
                $query->where('require_glass', 'Yes');
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['procedure_requests'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Procedure');
                });
            })
            // Match page window: last 3 days
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['other_dispensing_requests'] = PatientPaymentCache::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Others');
                });
                $query->whereHas('item', function ($query2) {
                    $query2->where('is_stock_item', 'Yes');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Default to daily view for notifications
        $data['patients_to_return'] = Consultation::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where('status', 'Consulted')
            ->where('patient_to_return', 'Yes')
            ->whereNotNull('to_return_date')
            ->where('to_return_date', '=', Carbon::today()->format('Y-m-d'))
            ->count();

        // VIP Patients count - show only VIP patients registered TODAY who haven't checked in
        $data['vip_patients'] = \App\Models\Patient::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where(function ($q) {
                $q->where('is_vip', 'Yes')
                  ->orWhere('is_vip', true)
                  ->orWhere('is_vip', 1);
            })
            ->whereDoesntHave('check_ins', function ($query) {
                $query->whereDate('created_at', today());
            })
            // Only count VIP patients registered TODAY
            ->whereDate('created_at', today())
            ->count();

        // Spectacle Patients (same as glass_patients)
        $data['spectacle_patients'] = $data['glass_patients'];

        // Waiting Patients - patients in waiting status
        $data['waiting_patients'] = \App\Models\PatientWaitingTime::whereHas('patient.creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where('status', 'waiting')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Get dynamic notifications based on view period
     */
    public function getDynamicNotifications(Request $request)
    {
        $request->validate([
            'view_period' => 'required|in:daily,weekly,monthly',
            'date' => 'nullable|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $view_period = $request->view_period;
        $selected_date = $request->date ? Carbon::parse($request->date) : Carbon::today();

        $data = [
            'waiting_patients' => 0,
            'vip_patients' => 0,
            'patients_to_return' => 0,
            'spectacle_patients' => 0,
            'completed_patients' => 0,
            'procedure_requests' => 0,
            'other_dispensing_requests' => 0,
        ];

        // Calculate date range based on view period - use same logic as ConsultationsController
        $now = Carbon::now()->format('Y-m-d');
        
        if ($request->date) {
            // When specific date is selected, use that date regardless of view_period
            $start_date = $selected_date->copy();
            $end_date = $selected_date->copy();
        } else {
            // Apply view period filtering only when no specific date is selected
            switch ($view_period) {
                case 'daily':
                    $start_date = Carbon::now();
                    $end_date = Carbon::now();
                    break;
                case 'weekly':
                    $start_date = Carbon::now()->startOfWeek();
                    $end_date = Carbon::now()->endOfWeek();
                    break;
                case 'monthly':
                    $start_date = Carbon::now()->startOfMonth();
                    $end_date = Carbon::now()->endOfMonth();
                    break;
                default:
                    $start_date = Carbon::now();
                    $end_date = Carbon::now();
            }
        }

        // Patients to return based on view period
        $data['patients_to_return'] = Consultation::whereHas('creator', function ($query) use ($user) {
            $query->where('clinic_id', $user->clinic_id);
        })
            ->where('status', 'Consulted')
            ->where('patient_to_return', 'Yes')
            ->whereNotNull('to_return_date')
            ->whereBetween('to_return_date', [$start_date->format('Y-m-d'), $end_date->format('Y-m-d')])
            ->count();

        // Debug logging
        \Log::info('Dynamic Notifications Debug', [
            'view_period' => $view_period,
            'selected_date' => $selected_date->format('Y-m-d'),
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'patients_to_return' => $data['patients_to_return'],
            'has_specific_date' => $request->has('date'),
            'current_week_start' => Carbon::now()->startOfWeek()->format('Y-m-d'),
            'current_week_end' => Carbon::now()->endOfWeek()->format('Y-m-d')
        ]);

        return $this->sendResponse($data, Response::HTTP_OK, 'Dynamic notifications retrieved successfully.');
    }
}