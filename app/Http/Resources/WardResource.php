<?php

namespace App\Http\Resources;

use App\Models\Ward;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Ward
 */
class WardResource extends JsonResource
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
            'specialty' => $this->specialty,
            'total_beds' => $this->totalBeds(),
            'available_beds' => $this->availableBeds(),
        ];
    }
}
