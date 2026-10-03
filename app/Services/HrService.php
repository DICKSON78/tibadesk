<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\StaffRecord;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use RuntimeException;

/**
 * Staff records and leave.
 */
class HrService
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * @return LengthAwarePaginator
     */
    public function staff(?string $search = null, ?string $department = null)
    {
        return StaffRecord::query()
            ->when($search, fn ($query, $term) => $query->where(function ($q) use ($term): void {
                $q->where('full_name', 'like', "%{$term}%")
                    ->orWhere('staff_number', 'like', "%{$term}%");
            }))
            ->when($department, fn ($query, $dept) => $query->where('department', $dept))
            ->orderBy('full_name')
            ->paginate(50);
    }

    public function requestLeave(
        StaffRecord $staff,
        string $leaveType,
        string $fromDate,
        string $toDate,
        ?string $reason = null,
    ): LeaveRequest {
        $from = Carbon::parse($fromDate)->startOfDay();
        $to = Carbon::parse($toDate)->startOfDay();

        if ($to->lt($from)) {
            throw new RuntimeException('Leave cannot end before it starts.');
        }

        $overlap = LeaveRequest::query()
            ->where('staff_record_id', $staff->getKey())
            ->whereIn('status', ['pending', 'approved'])
            ->whereDate('from_date', '<=', $to)
            ->whereDate('to_date', '>=', $from)
            ->exists();

        if ($overlap) {
            throw new RuntimeException('This overlaps leave already requested or approved for these dates.');
        }

        return LeaveRequest::create([
            'facility_id' => $this->current->idOrFail(),
            'staff_record_id' => $staff->getKey(),
            'leave_type' => $leaveType,
            'from_date' => $from,
            'to_date' => $to,
            'days' => LeaveRequest::countDays($from, $to),
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }

    public function reviewLeave(LeaveRequest $request, bool $approve, int $reviewerId): LeaveRequest
    {
        if (! $request->isPending()) {
            throw new RuntimeException('This leave request has already been reviewed.');
        }

        $request->forceFill([
            'status' => $approve ? 'approved' : 'rejected',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ])->save();

        return $request;
    }
}
