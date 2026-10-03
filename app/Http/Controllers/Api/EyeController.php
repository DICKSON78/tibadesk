<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEyeExamRequest;
use App\Http\Resources\EyeExamResource;
use App\Models\Encounter;
use App\Models\EyeExam;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EyeController extends Controller
{
    public function __construct(private readonly CurrentFacility $current) {}

    public function index(Encounter $encounter): AnonymousResourceCollection
    {
        return EyeExamResource::collection(
            EyeExam::query()
                ->where('encounter_id', $encounter->getKey())
                ->latest('recorded_at')
                ->get()
        );
    }

    /**
     * Record an examination.
     *
     * A refraction is only meaningful as a pair, so a request carrying one
     * eye and not the other is refused rather than filed half read.
     */
    public function store(StoreEyeExamRequest $request, Encounter $encounter): JsonResponse
    {
        $data = $request->safe()->all();

        // Parenthesised, because xor binds looser than !== and the unbracketed
        // version silently meant something else.
        $hasRight = ($data['od_sphere'] ?? null) !== null;
        $hasLeft = ($data['os_sphere'] ?? null) !== null;
        $hasOneEyeOnly = $hasRight !== $hasLeft;

        if ($hasOneEyeOnly) {
            return response()->json([
                'message' => 'Record the refraction for both eyes, or for neither.',
                'errors' => ['os_sphere' => ['The left eye refraction is required alongside the right.']],
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $exam = EyeExam::create([
            'facility_id' => $this->current->idOrFail(),
            'encounter_id' => $encounter->getKey(),
            'patient_id' => $encounter->patient_id,
            'consultation_id' => $encounter->consultation?->getKey(),
            ...$data,
            'recorded_by' => $request->user()->id,
            'recorded_at' => now(),
        ]);

        return (new EyeExamResource($exam))->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
