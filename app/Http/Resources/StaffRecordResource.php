<?php

namespace App\Http\Resources;

use App\Models\StaffRecord;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StaffRecord
 */
class StaffRecordResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'staff_number' => $this->staff_number,
            'full_name' => $this->full_name,
            'department' => $this->department,
            'designation' => $this->designation,
            'employment_type' => $this->employment_type,
            'hired_on' => $this->hired_on?->toDateString(),
            'monthly_salary' => $this->monthly_salary,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
        ];
    }
}
