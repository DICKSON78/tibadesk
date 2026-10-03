<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\StoreReferralRequest;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\EncounterReferralResource;
use App\Models\Department;
use App\Models\Encounter;
use App\Models\EncounterReferral;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PolyclinicController extends Controller
{
    public function __construct(private readonly CurrentFacility $current) {}

    public function departments(): AnonymousResourceCollection
    {
        return DepartmentResource::collection(Department::query()->orderBy('name')->get());
    }

    public function storeDepartment(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create([
            'facility_id' => $this->current->idOrFail(),
            ...$request->safe()->all(),
        ]);

        return (new DepartmentResource($department))->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function referrals(Encounter $encounter): AnonymousResourceCollection
    {
        return EncounterReferralResource::collection(
            EncounterReferral::query()
                ->where('encounter_id', $encounter->getKey())
                ->with(['fromDepartment', 'toDepartment'])
                ->latest('referred_at')
                ->get()
        );
    }

    public function refer(StoreReferralRequest $request, Encounter $encounter): JsonResponse
    {
        $from = (int) $request->validated('from_department_id');
        $to = (int) $request->validated('to_department_id');

        if ($from === $to) {
            return response()->json([
                'message' => 'A visit cannot be referred to the department it is already in.',
                'errors' => ['to_department_id' => ['Choose a different department.']],
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $referral = EncounterReferral::create([
            'facility_id' => $this->current->idOrFail(),
            'encounter_id' => $encounter->getKey(),
            'from_department_id' => $from,
            'to_department_id' => $to,
            'reason' => $request->string('reason')->toString(),
            'status' => 'pending',
            'referred_by' => $request->user()->id,
            'referred_at' => now(),
        ]);

        return (new EncounterReferralResource($referral->load(['fromDepartment', 'toDepartment'])))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function accept(Request $request, EncounterReferral $referral): EncounterReferralResource|JsonResponse
    {
        if (! $referral->isPending()) {
            return response()->json(
                ['message' => 'This referral has already been actioned.'],
                JsonResponse::HTTP_CONFLICT
            );
        }

        $referral->forceFill([
            'status' => 'accepted',
            'accepted_by' => $request->user()->id,
            'accepted_at' => now(),
        ])->save();

        return new EncounterReferralResource($referral->fresh()->load(['fromDepartment', 'toDepartment']));
    }
}
