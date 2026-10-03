<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DischargeAdmissionRequest;
use App\Http\Requests\StoreAdmissionRequest;
use App\Http\Requests\StoreWardRequest;
use App\Http\Resources\AdmissionResource;
use App\Http\Resources\BedResource;
use App\Http\Resources\WardResource;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\Encounter;
use App\Models\Ward;
use App\Services\IpdService;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class IpdController extends Controller
{
    public function __construct(
        private readonly IpdService $ipd,
        private readonly CurrentFacility $current,
    ) {}

    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'wards' => $this->ipd->occupancy(),
                'admitted' => Admission::query()->where('status', 'admitted')->count(),
            ],
        ]);
    }

    public function wards(): AnonymousResourceCollection
    {
        return WardResource::collection(Ward::query()->with('beds')->orderBy('name')->get());
    }

    /**
     * Create a ward and, in the same request, its beds.
     *
     * A ward with no beds cannot admit anybody, so they are created together
     * rather than as a second step that can be forgotten.
     */
    public function storeWard(StoreWardRequest $request): JsonResponse
    {
        $ward = DB::transaction(function () use ($request): Ward {
            $ward = Ward::create([
                'facility_id' => $this->current->idOrFail(),
                'code' => $request->string('code')->toString(),
                'name' => $request->string('name')->toString(),
                'specialty' => $request->string('specialty')->toString() ?: null,
                'description' => $request->string('description')->toString() ?: null,
            ]);

            foreach ($request->validated('beds') ?? [] as $bed) {
                Bed::create([
                    'facility_id' => $this->current->idOrFail(),
                    'ward_id' => $ward->getKey(),
                    'bed_number' => $bed['bed_number'],
                    'status' => 'available',
                    'daily_rate' => $bed['daily_rate'] ?? 0,
                ]);
            }

            return $ward;
        });

        return (new WardResource($ward->load('beds')))->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function beds(Request $request): AnonymousResourceCollection
    {
        return BedResource::collection(
            Bed::query()
                ->with('ward')
                ->when($request->filled('ward_id'), fn ($q) => $q->where('ward_id', $request->integer('ward_id')))
                ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
                ->orderBy('ward_id')
                ->orderBy('bed_number')
                ->get()
        );
    }

    public function admissions(): AnonymousResourceCollection
    {
        return AdmissionResource::collection(
            Admission::query()
                ->with(['bed.ward', 'patient'])
                ->where('status', 'admitted')
                ->latest('admitted_at')
                ->get()
        );
    }

    public function admit(StoreAdmissionRequest $request, Encounter $encounter): JsonResponse
    {
        try {
            $admission = $this->ipd->admit(
                $encounter,
                $request->integer('bed_id') ?: null,
                $request->user()->id,
                $request->string('admission_diagnosis')->toString() ?: null,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new AdmissionResource($admission->load('bed.ward')))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function discharge(DischargeAdmissionRequest $request, Admission $admission): JsonResponse
    {
        try {
            $admission = $this->ipd->discharge(
                $admission,
                $request->user()->id,
                $request->string('discharge_summary')->toString() ?: null,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new AdmissionResource($admission->load('bed.ward')))->response();
    }
}
