<?php

namespace App\Http\Resources;

use App\Models\Admission;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Admission
 */
class AdmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'encounter_id' => $this->encounter_id,
            'patient_id' => $this->patient_id,
            'bed' => $this->bed?->label(),
            'status' => $this->status,
            'admission_diagnosis' => $this->admission_diagnosis,
            'admitted_at' => $this->admitted_at?->toIso8601String(),
            'discharged_at' => $this->discharged_at?->toIso8601String(),
            'length_of_stay_days' => $this->lengthOfStayDays(),
            'discharge_summary' => $this->discharge_summary,
        ];
    }
}
