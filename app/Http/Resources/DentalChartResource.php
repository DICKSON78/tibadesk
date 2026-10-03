<?php

namespace App\Http\Resources;

use App\Models\DentalChart;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin DentalChart
 */
class DentalChartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'tooth_number' => $this->tooth_number,
            'surfaces' => $this->surfaces,
            'condition' => $this->condition,
            'notes' => $this->notes,
        ];
    }
}
