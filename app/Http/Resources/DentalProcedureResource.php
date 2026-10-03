<?php

namespace App\Http\Resources;

use App\Models\DentalProcedure;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin DentalProcedure
 */
class DentalProcedureResource extends JsonResource
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
            'tooth_number' => $this->tooth_number,
            'surfaces' => $this->surfaces,
            'status' => $this->status,
            'quoted_price' => $this->quoted_price,
            'notes' => $this->notes,
        ];
    }
}
