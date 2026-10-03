<?php

namespace App\Http\Resources;

use App\Models\LeaveRequest;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LeaveRequest
 */
class LeaveRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'staff_record_id' => $this->staff_record_id,
            'staff_name' => $this->staffRecord?->full_name,
            'leave_type' => $this->leave_type,
            'from_date' => $this->from_date?->toDateString(),
            'to_date' => $this->to_date?->toDateString(),
            'days' => $this->days,
            'reason' => $this->reason,
            'status' => $this->status,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
        ];
    }
}
