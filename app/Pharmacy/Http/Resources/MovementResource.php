<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\MedicineMovement;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MedicineMovement
 */
class MovementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'medicine' => $this->whenLoaded('medicine', fn (): array => [
                'id' => $this->medicine->id,
                'name' => $this->medicine->name,
            ]),
            'batch' => $this->whenLoaded('batch', fn (): ?array => $this->batch === null ? null : [
                'id' => $this->batch->id,
                'batch_number' => $this->batch->batch_number,
                'expiry_date' => $this->batch->expiry_date?->toDateString(),
            ]),
            'movement_type' => $this->movement_type,
            'quantity' => $this->quantity,
            'direction' => $this->isInbound() ? 'in' : 'out',
            'unit_cost' => $this->unit_cost,
            'value' => $this->quantity * $this->unit_cost,
            'reference_type' => $this->reference_type,
            'reference_number' => $this->reference_number,
            'notes' => $this->notes,
            'performed_by' => $this->whenLoaded('performer', fn (): ?string => $this->performer?->name),
            'occurred_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
