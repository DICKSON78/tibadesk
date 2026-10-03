<?php

namespace App\Http\Resources;

use App\Models\Dispense;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Dispense
 */
class DispenseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'encounter_id' => $this->encounter_id,
            'patient_id' => $this->patient_id,
            'status' => $this->status,
            'notes' => $this->notes,
            'dispensed_by' => $this->dispensedBy?->name,
            'dispensed_at' => $this->dispensed_at?->toIso8601String(),
            'total' => (int) $this->items()->sum('line_total'),
            'items' => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'medicine' => $item->medicine?->name,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
            ]),
        ];
    }
}
