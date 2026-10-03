<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewLeaveRequest;
use App\Http\Requests\StoreLeaveRequest;
use App\Http\Requests\StoreStaffRecordRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Http\Resources\StaffRecordResource;
use App\Models\LeaveRequest;
use App\Models\StaffRecord;
use App\Services\HrService;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class HrController extends Controller
{
    public function __construct(
        private readonly HrService $hr,
        private readonly CurrentFacility $current,
    ) {}

    public function staff(Request $request): AnonymousResourceCollection
    {
        return StaffRecordResource::collection(
            $this->hr->staff(
                $request->string('search')->toString() ?: null,
                $request->string('department')->toString() ?: null,
            )
        );
    }

    public function storeStaff(StoreStaffRecordRequest $request): JsonResponse
    {
        $staff = StaffRecord::create([
            'facility_id' => $this->current->idOrFail(),
            ...$request->safe()->all(),
        ]);

        return (new StaffRecordResource($staff))->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function leaveRequests(): AnonymousResourceCollection
    {
        return LeaveRequestResource::collection(
            LeaveRequest::query()
                ->with('staffRecord')
                ->when(
                    request()->filled('status'),
                    fn ($q) => $q->where('status', request()->string('status')->toString())
                )
                ->latest('from_date')
                ->paginate(50)
        );
    }

    public function requestLeave(StoreLeaveRequest $request, StaffRecord $staffRecord): JsonResponse
    {
        try {
            $leave = $this->hr->requestLeave(
                $staffRecord,
                $request->string('leave_type')->toString(),
                $request->string('from_date')->toString(),
                $request->string('to_date')->toString(),
                $request->string('reason')->toString() ?: null,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new LeaveRequestResource($leave->load('staffRecord')))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function review(ReviewLeaveRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        try {
            $leaveRequest = $this->hr->reviewLeave(
                $leaveRequest,
                $request->boolean('approve'),
                $request->user()->id,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new LeaveRequestResource($leaveRequest->load('staffRecord')))->response();
    }
}
