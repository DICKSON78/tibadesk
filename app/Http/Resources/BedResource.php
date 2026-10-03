<?php

namespace App\Http\Resources;

use App\Models\Bed;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Bed
 */
class BedResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'ward_id' => $this->ward_id,
            'ward' => $this->ward?->name,
            'bed_number' => $this->bed_number,
            'status' => $this->status,
            'daily_rate' => $this->daily_rate,
        ];
    }
}
