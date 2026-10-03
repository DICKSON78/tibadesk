<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\MedicineBatch;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MedicineBatch
 */
class BatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        // Whole days between today and the expiry date, compared as dates rather
        // than instants so a batch expiring "in 20 days" reports 20 whatever
        // time of day the screen is opened.
        $daysToExpiry = $this->expiry_date === null
            ? null
            : (int) now()->startOfDay()->diffInDays($this->expiry_date->copy()->startOfDay(), true);

        return [
            'id' => $this->id,
            'medicine_id' => $this->medicine_id,
            'medicine' => $this->whenLoaded('medicine', fn (): array => [
                'id' => $this->medicine->id,
                'name' => $this->medicine->name,
                'strength' => $this->medicine->strength,
                'unit' => $this->medicine->unit,
            ]),
            'batch_number' => $this->batch_number,
            'expiry_date' => $this->expiry_date?->toDateString(),
            'quantity_received' => $this->quantity_received,
            'quantity_available' => $this->quantity_available,
            'cost_price' => $this->cost_price,
            'stock_value' => $this->stockValue(),
            'received_on' => $this->received_on?->toDateString(),
            'is_expired' => $this->isExpired(),
            // Null once expired, so a screen can show "expired" rather than a
            // misleading negative countdown.
            'days_to_expiry' => $this->isExpired() ? null : (int) floor($daysToExpiry),
            'is_recalled' => $this->isRecalled(),
        ];
    }
}
