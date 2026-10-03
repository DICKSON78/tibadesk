<?php

namespace App\Http\Resources;

use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Prescription
 */
class PrescriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medicine' => $this->medicine,
            'dose' => $this->dose,
            'route' => $this->route,
            'frequency' => $this->frequency,
            'duration' => $this->duration,
            'instructions' => $this->instructions,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'dispensed_at' => $this->dispensed_at?->toIso8601String(),
        ];
    }
}
