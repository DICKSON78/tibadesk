<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\PharmacySupplier;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PharmacySupplier
 */
class SupplierResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact_person' => $this->contact_person,
            'email' => $this->email,
            'phone' => $this->phone,
            'city' => $this->city,
            'payment_terms' => $this->payment_terms,
            'is_active' => $this->is_active,
            'total_purchased' => $this->totalPurchased(),
        ];
    }
}
