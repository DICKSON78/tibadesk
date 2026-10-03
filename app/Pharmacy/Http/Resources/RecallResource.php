<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\MedicineRecall;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MedicineRecall
 */
class RecallResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'status' => $this->status,
            'is_open' => $this->isOpen(),
            'recall_reason' => $this->recall_reason,
            'severity' => $this->severity,
            'manufacturer' => $this->manufacturer,
            'issued_on' => $this->issued_on?->toDateString(),
            'medicine' => $this->whenLoaded('medicine', fn (): ?array => $this->medicine === null ? null : [
                'id' => $this->medicine->id,
                'name' => $this->medicine->name,
                'strength' => $this->medicine->strength,
            ]),
            'batch' => $this->whenLoaded('batch', fn (): ?array => $this->batch === null ? null : [
                'id' => $this->batch->id,
                'batch_number' => $this->batch->batch_number,
                'expiry_date' => $this->batch->expiry_date?->toDateString(),
            ]),
            'affected_quantity' => $this->affected_quantity,
            'returned_quantity' => $this->returned_quantity,
            'quantity_outstanding' => $this->quantityOutstanding(),
            'notes' => $this->notes,
        ];
    }
}
