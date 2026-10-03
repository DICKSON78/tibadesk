<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\PurchaseOrder;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PurchaseOrder
 */
class PurchaseOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'supplier' => $this->whenLoaded('supplier', fn (): array => [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ]),
            'ordered_on' => $this->ordered_on?->toDateString(),
            'expected_on' => $this->expected_on?->toDateString(),
            'received_at' => $this->received_at?->toIso8601String(),
            'total_value' => $this->total_value,
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', fn (): array => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'medicine_id' => $item->medicine_id,
                'medicine' => $this->when(
                    $item->relationLoaded('medicine'),
                    fn (): ?array => $item->medicine === null ? null : [
                        'id' => $item->medicine->id,
                        'name' => $item->medicine->name,
                        'unit' => $item->medicine->unit,
                    ],
                ),
                'quantity_ordered' => $item->quantity_ordered,
                'quantity_received' => $item->quantity_received,
                'quantity_outstanding' => $item->quantityOutstanding(),
                'unit_cost' => $item->unit_cost,
                'line_total' => $item->line_total,
                'batch_number' => $item->batch_number,
                'expiry_date' => $item->expiry_date?->toDateString(),
            ])->all()),
        ];
    }
}
