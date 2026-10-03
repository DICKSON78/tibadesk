<?php

namespace App\Http\Resources;

use App\Models\EncounterReferral;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EncounterReferral
 */
class EncounterReferralResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'encounter_id' => $this->encounter_id,
            'from_department' => $this->fromDepartment?->name,
            'to_department' => $this->toDepartment?->name,
            'reason' => $this->reason,
            'status' => $this->status,
            'referred_at' => $this->referred_at?->toIso8601String(),
            'accepted_at' => $this->accepted_at?->toIso8601String(),
        ];
    }
}
