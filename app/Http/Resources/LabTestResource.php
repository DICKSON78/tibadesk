<?php

namespace App\Http\Resources;

use App\Models\LabTest;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LabTest
 */
class LabTestResource extends JsonResource
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
            'category' => $this->category,
            'unit' => $this->unit,
            'unit_price' => $this->unit_price,
            'turnaround_hours' => $this->turnaround_hours,
            'is_active' => $this->is_active,
        ];
    }
}
