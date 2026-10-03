<?php

namespace App\Http\Resources;

use App\Models\Medicine;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Medicine
 */
class MedicineResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'generic_name' => $this->generic_name,
            'form' => $this->form,
            'strength' => $this->strength,
            'unit' => $this->unit,
            'unit_price' => $this->unit_price,
            'is_active' => $this->is_active,
            'quantity_on_hand' => $this->quantityOnHand(),
            'is_low' => $this->isLowOnStock(),
        ];
    }
}
