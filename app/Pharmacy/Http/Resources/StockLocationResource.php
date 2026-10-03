<?php

namespace App\Pharmacy\Http\Resources;

use App\Pharmacy\Models\StockLocation;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StockLocation
 */
class StockLocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'kind' => $this->kind,
            'is_active' => $this->is_active,
        ];
    }
}
