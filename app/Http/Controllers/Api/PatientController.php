<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly CurrentFacility $current,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $patients = Patient::query()
            ->search($request->string('search')->toString())
            ->when($request->filled('registered_from'), fn ($query) => $query->where('created_at', '>=', $request->date('registered_from')))
            ->when($request->filled('registered_to'), fn ($query) => $query->where('created_at', '<=', $request->date('registered_to')))
            ->latest()
            // One-based, matching what the counter and the printed register
            // both say, rather than the zero-based offset a UI component would
            // otherwise assume.
            ->paginate(min((int) $request->integer('per_page', 25), 100))
            ->withQueryString();

        return PatientResource::collection($patients);
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = DB::transaction(function () use ($request): Patient {
            $facility = $this->current->get();

            return Patient::create([
                ...$request->safe()->only([
                    'first_name',
                    'middle_name',
                    'last_name',
                    'date_of_birth',
                    'gender',
                    'phone',
                    'email',
                    'address',
                    'next_of_kin_name',
                    'next_of_kin_phone',
                    'next_of_kin_relationship',
                    'notes',
                ]),
                // Allocated here rather than accepted from the client, so two
                // receptionists cannot choose the same number.
                'patient_number' => $this->numbers->next($facility, DocumentNumberGenerator::PATIENT),
                'registered_by' => $request->user()->id,
            ]);
        });

        return (new PatientResource($patient))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Patient $patient): PatientResource
    {
        return new PatientResource($patient->load('encounters'));
    }

    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        $patient->fill($request->safe()->only([
            'first_name',
            'middle_name',
            'last_name',
            'date_of_birth',
            'gender',
            'phone',
            'email',
            'address',
            'next_of_kin_name',
            'next_of_kin_phone',
            'next_of_kin_relationship',
            'notes',
        ]))->save();

        return new PatientResource($patient->fresh());
    }

    public function destroy(Patient $patient): Response
    {
        // Soft delete: the patient's clinical history outlives the register
        // entry, so the record is withdrawn from the list, never erased.
        $patient->delete();

        return response()->noContent();
    }
}
