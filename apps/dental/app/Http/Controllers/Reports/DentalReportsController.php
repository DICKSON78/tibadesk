<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\DentalCharting;
use App\Models\DentalTreatmentRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalReportsController extends Controller
{
    use ApiResponse;

    public function morbidityReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $start = $request->start_date;
        $end = $request->end_date;

        $consultations = Consultation::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->where('status', 'Consulted')
            ->with(['payment_cache_item.payment_cache.check_in.patient'])
            ->get();

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
            $morbidity[$group] = [
                'male' => 0,
                'female' => 0,
                'total' => 0,
            ];
        }

        $totalPatients = 0;
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
        }

        // Treatments performed in period
        $treatments = DentalTreatmentRecord::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->get();

        $treatmentSummary = $treatments->groupBy('treatment_type')->map(function ($items, $type) {
            return [
                'treatment_type' => $type,
                'count' => $items->count(),
            ];
        })->values();

        // Extractions (tooth charting where status indicates extraction or missing)
        $extractions = DentalCharting::whereHas('consultation', function ($q) use ($start, $end) {
                $q->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
            })
            ->where(function ($q) {
                $q->where('status', 'Missing')
                  ->orWhere('caries_status', 'MissingCaries')
                  ->orWhere('status', 'RootStump');
            })
            ->count();

        $data = [
            'report_period' => [
                'start_date' => $start,
                'end_date' => $end,
            ],
            'total_patients_consulted' => $totalPatients,
            'total_consultations' => $consultations->count(),
            'morbidity_by_age_gender' => $morbidity,
            'treatments_performed' => $treatmentSummary,
            'total_treatments' => $treatments->count(),
            'extractions_performed' => $extractions,
            'report_date' => Carbon::now()->format('Y-m-d'),
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function procedureSummary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $start = $request->start_date;
        $end = $request->end_date;

        $treatments = DentalTreatmentRecord::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->with(['treatedBy', 'payment_cache_item.payment_cache.check_in.patient'])
            ->get();

        $byType = $treatments->groupBy('treatment_type')->map(function ($items, $type) {
            return [
                'type' => $type,
                'count' => $items->count(),
            ];
        })->values();

        $byDoctor = $treatments->groupBy('treated_by')->map(function ($items, $doctorId) {
            $doctor = $items->first()->treatedBy;
            return [
                'doctor_id' => $doctorId,
                'doctor_name' => $doctor ? $doctor->full_name : 'Unknown',
                'count' => $items->count(),
            ];
        })->values();

        $data = [
            'total_procedures' => $treatments->count(),
            'by_type' => $byType,
            'by_doctor' => $byDoctor,
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function dhis2Summary(Request $request)
    {
        // DHIS2-compatible format for HMIS Form 3 (Dental)
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $start = $request->start_date;
        $end = $request->end_date;

        $morbidity = $this->morbidityReport($request);
        $morbidityData = $morbidity->getData()->data;

        $procedures = DentalTreatmentRecord::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->get()
            ->groupBy('treatment_type')
            ->map(function ($items) {
                return $items->count();
            });

        $dataElementValues = [];

        // DHIS2 data elements for dental morbidity
        $dataElements = [
            'DENTAL_NEW_PATIENTS' => $morbidityData->total_patients_consulted ?? 0,
            'DENTAL_EXTRACTIONS' => $morbidityData->extractions_performed ?? 0,
            'DENTAL_RESTORATIONS' => $procedures->get('Restoration', 0),
            'DENTAL_RCT' => $procedures->get('RCT', 0),
            'DENTAL_SCALING' => $procedures->get('Scaling', 0),
            'DENTAL_CROWN' => $procedures->get('Crown', 0) + $procedures->get('Bridge', 0),
            'DENTAL_DENTURE' => $procedures->get('Denture', 0),
            'DENTAL_SURGERY' => $procedures->get('GumSurgery', 0) + $procedures->get('Biopsy', 0),
            'DENTAL_ORTHODONTIC' => $procedures->get('Orthodontic', 0),
            'DENTAL_REFERRALS' => Consultation::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
                ->where('patient_direction', 'Referral')
                ->count(),
        ];

        foreach ($dataElements as $de => $value) {
            $dataElementValues[] = [
                'data_element' => $de,
                'value' => $value,
                'period' => $start . ' - ' . $end,
            ];
        }

        $data = [
            'dhis2_version' => '2.4',
            'org_unit' => 'Tanzania - Dental Clinic',
            'period' => [
                'start' => $start,
                'end' => $end,
            ],
            'data_set' => 'HMIS Form 3 - Dental Morbidity',
            'data_values' => $dataElementValues,
            'generated_at' => Carbon::now()->toIso8601String(),
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
