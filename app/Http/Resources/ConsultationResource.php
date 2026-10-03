<?php

namespace App\Http\Resources;

use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Consultation
 */
class ConsultationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'consultation_number' => $this->consultation_number,
            'encounter_id' => $this->encounter_id,
            'status' => $this->status,
            'is_locked' => $this->isLocked(),
            'chief_complaint' => $this->chief_complaint,
            'history_present_illness' => $this->history_present_illness,
            'past_medical_history' => $this->past_medical_history,
            'drug_history' => $this->drug_history,
            'family_history' => $this->family_history,
            'allergy_history' => $this->allergy_history,
            'general_health' => $this->general_health,
            'examination' => $this->examination,
            'clinical_notes' => $this->clinical_notes,
            'plan' => $this->plan,
            'remarks' => $this->remarks,
            'clinician' => $this->whenLoaded('clinician', fn () => [
                'id' => $this->clinician->id,
                'name' => $this->clinician->name,
            ]),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'diagnoses' => ConsultationDiagnosisResource::collection(
                $this->whenLoaded('diagnoses'),
            ),
            'prescriptions' => PrescriptionResource::collection(
                $this->whenLoaded('prescriptions'),
            ),
        ];
    }
}
