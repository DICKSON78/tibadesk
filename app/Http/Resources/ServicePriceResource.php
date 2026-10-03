<?php

namespace App\Http\Resources;

use App\Models\ServicePrice;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServicePrice
 */
class ServicePriceResource extends JsonResource
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
            'module' => $this->module,
            'price' => $this->price,
            'is_active' => $this->is_active,
        ];
    }
}
