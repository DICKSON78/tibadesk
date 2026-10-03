<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\StockTransfer;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StockTransfer
 */
class TransferResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'transfer_number' => $this->transfer_number,
            'status' => $this->status,
            'from_location' => $this->whenLoaded('origin', fn (): ?array => $this->origin === null ? null : [
                'id' => $this->origin->id,
                'name' => $this->origin->name,
            ]),
            'to_location' => $this->whenLoaded('destination', fn (): ?array => $this->destination === null ? null : [
                'id' => $this->destination->id,
                'name' => $this->destination->name,
            ]),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'received_at' => $this->received_at?->toIso8601String(),
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', fn (): array => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'medicine_id' => $item->medicine_id,
                'medicine' => $item->relationLoaded('medicine') ? [
                    'id' => $item->medicine->id,
                    'name' => $item->medicine->name,
                ] : null,
                'batch_id' => $item->medicine_batch_id,
                'quantity_sent' => $item->quantity_sent,
                'quantity_received' => $item->quantity_received,
            ])->all()),
        ];
    }
}
