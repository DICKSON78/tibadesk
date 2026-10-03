<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\ConsultationDiagnosis;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class MoHReportsController extends Controller
{
    use ApiResponse;

    public function monthlyOpd(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $start = $request->start_date;
        $end = $request->end_date;

        $consultations = Consultation::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->where('status', 'Consulted')
            ->with(['payment_cache_item.payment_cache.check_in.patient', 'diagnoses.disease']);

        if (!$user->is_admin) {
            $consultations->where('created_by', $user->id);
        }

        $consultations = $consultations->get();

        $ageGroups = [
            '0-4' => ['min' => 0, 'max' => 4],
            '5-14' => ['min' => 5, 'max' => 14],
            '15-24' => ['min' => 15, 'max' => 24],
            '25-44' => ['min' => 25, 'max' => 44],
            '45-64' => ['min' => 45, 'max' => 64],
            '65+' => ['min' => 65, 'max' => 999],
        ];

        $morbidity = [];
        foreach ($ageGroups as $group => $range) {
            $morbidity[$group] = ['male' => 0, 'female' => 0, 'total' => 0];
        }

        $totalPatients = 0;
        $newPatients = 0;
        $referrals = 0;
        $revisits = 0;
        $diagnosisCounts = [];
        $totalDiagnoses = 0;

        foreach ($consultations as $c) {
            try {
                $patient = $c->payment_cache_item->payment_cache->check_in->patient;
                $age = $patient->age ?? 0;
                $gender = strtolower($patient->gender ?? 'male');

                foreach ($ageGroups as $group => $range) {
                    if ($age >= $range['min'] && $age <= $range['max']) {
                        if ($gender === 'female') {
                            $morbidity[$group]['female']++;
                        } else {
                            $morbidity[$group]['male']++;
                        }
                        $morbidity[$group]['total']++;
                        $totalPatients++;
                        break;
                    }
                }
            } catch (\Exception $e) {
                continue;
            }

            // Patient direction
            $direction = strtolower($c->patient_direction ?? '');
            if ($direction === 'referral') {
                $referrals++;
            } elseif ($direction === 'new') {
                $newPatients++;
            } else {
                $revisits++;
            }

            // Diagnoses
            foreach ($c->diagnoses as $diagnosis) {
                $diseaseName = $diagnosis->disease->name ?? 'Unknown';
                if (!isset($diagnosisCounts[$diseaseName])) {
                    $diagnosisCounts[$diseaseName] = 0;
                }
                $diagnosisCounts[$diseaseName]++;
                $totalDiagnoses++;
            }
        }

        arsort($diagnosisCounts);
        $topDiagnoses = array_slice($diagnosisCounts, 0, 20);

        $data = [
            'report_period' => [
                'start_date' => $start,
                'end_date' => $end,
            ],
            'summary' => [
                'total_consultations' => $consultations->count(),
                'total_patients' => $totalPatients,
                'new_patients' => $newPatients,
                'revisits' => $revisits,
                'referrals' => $referrals,
                'total_diagnoses' => $totalDiagnoses,
            ],
            'morbidity_by_age_gender' => $morbidity,
            'top_diagnoses' => $topDiagnoses,
            'report_date' => Carbon::now()->format('Y-m-d'),
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function pharmaceuticalConsumption(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $start = $request->start_date;
        $end = $request->end_date;

        $dispensedItems = PatientPaymentCacheItem::whereNotNull('medicine_id')
            ->where('status', 'Served')
            ->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->with(['medicine', 'payment_cache.check_in.patient']);

        if (!$user->is_admin) {
            $dispensedItems->whereHas('payment_cache', function ($q) use ($user) {
                $q->where('created_by', $user->id);
            });
        }

        $dispensedItems = $dispensedItems->get();

        $byMedicine = [];
        $totalQuantity = 0;
        $totalValue = 0;

        foreach ($dispensedItems as $item) {
            $medicineName = $item->medicine->name ?? 'Unknown';
            $quantity = $item->quantity ?? 1;
            $unitPrice = $item->unit_price ?? 0;
            $value = $quantity * $unitPrice;

            if (!isset($byMedicine[$medicineName])) {
                $byMedicine[$medicineName] = [
                    'medicine_name' => $medicineName,
                    'quantity_dispensed' => 0,
                    'total_value' => 0,
                ];
            }
            $byMedicine[$medicineName]['quantity_dispensed'] += $quantity;
            $byMedicine[$medicineName]['total_value'] += $value;
            $totalQuantity += $quantity;
            $totalValue += $value;
        }

        $byMedicine = array_values($byMedicine);
        usort($byMedicine, fn($a, $b) => $b['quantity_dispensed'] <=> $a['quantity_dispensed']);

        $data = [
            'report_period' => [
                'start_date' => $start,
                'end_date' => $end,
            ],
            'summary' => [
                'total_items_dispensed' => $dispensedItems->count(),
                'total_quantity' => $totalQuantity,
                'total_value' => $totalValue,
                'unique_medicines' => count($byMedicine),
            ],
            'by_medicine' => $byMedicine,
            'report_date' => Carbon::now()->format('Y-m-d'),
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function revenueSummary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $start = $request->start_date;
        $end = $request->end_date;

        // Cash payments
        $payments = PatientItemPayment::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->with(['channel']);

        if (!$user->is_admin) {
            $payments->where('created_by', $user->id);
        }

        $payments = $payments->get();

        $totalAmount = $payments->sum('amount');
        $totalDiscount = $payments->sum('discount');
        $totalNet = $totalAmount - $totalDiscount;

        $byChannel = [];
        $byDate = [];

        foreach ($payments as $payment) {
            $channelName = $payment->channel->name ?? 'Unknown';
            if (!isset($byChannel[$channelName])) {
                $byChannel[$channelName] = ['channel' => $channelName, 'amount' => 0, 'count' => 0];
            }
            $byChannel[$channelName]['amount'] += ($payment->amount - $payment->discount);
            $byChannel[$channelName]['count']++;

            $date = Carbon::parse($payment->created_at)->format('Y-m-d');
            if (!isset($byDate[$date])) {
                $byDate[$date] = ['date' => $date, 'amount' => 0, 'count' => 0];
            }
            $byDate[$date]['amount'] += ($payment->amount - $payment->discount);
            $byDate[$date]['count']++;
        }

        $byChannel = array_values($byChannel);
        $byDate = array_values($byDate);

        $data = [
            'report_period' => [
                'start_date' => $start,
                'end_date' => $end,
            ],
            'summary' => [
                'total_transactions' => $payments->count(),
                'total_amount' => $totalAmount,
                'total_discount' => $totalDiscount,
                'total_net' => $totalNet,
            ],
            'by_channel' => $byChannel,
            'by_date' => $byDate,
            'report_date' => Carbon::now()->format('Y-m-d'),
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function ipdReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $start = $request->start_date;
        $end = $request->end_date;

        $consultations = Consultation::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->where('status', 'Consulted')
            ->with(['payment_cache_item.payment_cache.check_in.patient']);

        if (!$user->is_admin) {
            $consultations->where('created_by', $user->id);
        }

        $consultations = $consultations->get();

        $ageGroups = [
            '0-4' => ['min' => 0, 'max' => 4],
            '5-14' => ['min' => 5, 'max' => 14],
            '15-24' => ['min' => 15, 'max' => 24],
            '25-44' => ['min' => 25, 'max' => 44],
            '45-64' => ['min' => 45, 'max' => 64],
            '65+' => ['min' => 65, 'max' => 999],
        ];

        $admissions = [];
        foreach ($ageGroups as $group => $range) {
            $admissions[$group] = ['male' => 0, 'female' => 0, 'total' => 0];
        }

        $totalAdmissions = 0;
        foreach ($consultations as $c) {
            try {
                $patient = $c->payment_cache_item->payment_cache->check_in->patient;
                $age = $patient->age ?? 0;
                $gender = strtolower($patient->gender ?? 'male');
                foreach ($ageGroups as $group => $range) {
                    if ($age >= $range['min'] && $age <= $range['max']) {
                        if ($gender === 'female') {
                            $admissions[$group]['female']++;
                        } else {
                            $admissions[$group]['male']++;
                        }
                        $admissions[$group]['total']++;
                        $totalAdmissions++;
                        break;
                    }
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        $data = [
            'report_period' => [
                'start_date' => $start,
                'end_date' => $end,
            ],
            'summary' => [
                'total_admissions' => $totalAdmissions,
                'total_discharges' => 0,
                'deaths' => 0,
                'referred_out' => $consultations->where('patient_direction', 'Referral')->count(),
                'bed_occupancy_rate' => 0,
                'average_length_of_stay' => 0,
            ],
            'admissions_by_age_gender' => $admissions,
            'report_date' => Carbon::now()->format('Y-m-d'),
            'note' => 'Inpatient admission tracking is not yet implemented. These figures are based on consultation data.',
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
