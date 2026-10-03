<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEncounterRequest;
use App\Http\Resources\EncounterResource;
use App\Models\Encounter;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EncounterController extends Controller
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly CurrentFacility $current,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $encounters = Encounter::query()
            ->with(['patient', 'clinician'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('clinician_id'), fn ($query) => $query->where('clinician_id', $request->integer('clinician_id')))
            ->when(
                $request->filled('registered_from'),
                fn ($query) => $query->where('registered_at', '>=', $request->date('registered_from')),
            )
            ->when(
                $request->filled('registered_to'),
                fn ($query) => $query->where('registered_at', '<=', $request->date('registered_to')),
            )
            ->latest('registered_at')
            ->paginate(min((int) $request->integer('per_page', 25), 100))
            ->withQueryString();

        return EncounterResource::collection($encounters);
    }

    public function store(StoreEncounterRequest $request): JsonResponse
    {
        $encounter = DB::transaction(function () use ($request): Encounter {
            $facility = $this->current->get();

            return Encounter::create([
                ...$request->safe()->only([
                    'patient_id',
                    'type',
                    'payment_mode',
                    'reason_for_visit',
                    'department',
                    'referred_by',
                    'clinician_id',
                ]),
                'encounter_number' => $this->numbers->next($facility, DocumentNumberGenerator::ENCOUNTER),
                'registered_by' => $request->user()->id,
                'registered_at' => now(),
            ]);
        });

        return (new EncounterResource($encounter->load('patient')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Encounter $encounter): EncounterResource
    {
        return new EncounterResource(
            $encounter->load(['patient', 'clinician', 'consultation.diagnoses', 'consultation.prescriptions']),
        );
    }

    public function start(Encounter $encounter): EncounterResource
    {
        $encounter->start();

        return new EncounterResource($encounter->fresh()->load('patient'));
    }

    public function complete(Encounter $encounter): EncounterResource
    {
        $encounter->complete();

        return new EncounterResource($encounter->fresh()->load('patient'));
    }
}
