<?php

namespace App\Http\Resources;

use App\Models\Encounter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Encounter
 */
class EncounterResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'encounter_number' => $this->encounter_number,
            'patient_id' => $this->patient_id,
            'type' => $this->type,
            'status' => $this->status,
            'payment_mode' => $this->payment_mode,
            'reason_for_visit' => $this->reason_for_visit,
            'department' => $this->department,
            'clinician' => $this->whenLoaded('clinician', fn () => [
                'id' => $this->clinician->id,
                'name' => $this->clinician->name,
            ]),
            'registered_at' => $this->registered_at?->toIso8601String(),
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'consultation' => ConsultationResource::make($this->whenLoaded('consultation')),
        ];
    }
}
