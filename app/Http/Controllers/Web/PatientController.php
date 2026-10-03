<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly CurrentFacility $current,
    ) {}

    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->search($request->string('search')->toString())
            ->when(
                $request->filled('registered_from'),
                fn ($query) => $query->where('created_at', '>=', $request->date('registered_from')),
            )
            ->latest()
            ->paginate(min((int) $request->integer('per_page', 25), 100))
            ->withQueryString();

        return Inertia::render('Patients/Index', [
            'patients' => [
                // Mapped by hand for the same reason the API has a resource:
                // the table needs a computed name and age, and handing the
                // model straight to the page would send the columns behind
                // fullName() and ageInYears() as empty cells.
                'data' => $patients->getCollection()->map(fn (Patient $patient): array => [
                    'id' => $patient->id,
                    'patient_number' => $patient->patient_number,
                    'full_name' => $patient->fullName(),
                    'age' => $patient->ageInYears(),
                    'gender' => $patient->gender,
                    'phone' => $patient->phone,
                    'registered_at' => $patient->created_at?->toDateString(),
                ])->all(),
                'meta' => [
                    'current_page' => $patients->currentPage(),
                    'last_page' => $patients->lastPage(),
                    'from' => $patients->firstItem(),
                    'to' => $patients->lastItem(),
                    'total' => $patients->total(),
                ],
                'links' => $patients->linkCollection()->toArray(),
            ],
            'filters' => [
                'search' => $request->string('search')->toString(),
                'registered_from' => $request->string('registered_from')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Patients/Create', [
            'genders' => ['female', 'male', 'other'],
        ]);
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $patient = DB::transaction(function () use ($request): Patient {
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
                'patient_number' => $this->numbers->next($this->current->get(), DocumentNumberGenerator::PATIENT),
                'registered_by' => $request->user()->id,
            ]);
        });

        return redirect()
            ->route('patients.show', $patient)
            ->with('success', "{$patient->fullName()} registered as {$patient->patient_number}.");
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['encounters.consultation', 'registeredBy']);

        return Inertia::render('Patients/Show', [
            'patient' => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'first_name' => $patient->first_name,
                'middle_name' => $patient->middle_name,
                'last_name' => $patient->last_name,
                'full_name' => $patient->fullName(),
                'date_of_birth' => $patient->date_of_birth?->toDateString(),
                'age' => $patient->ageInYears(),
                'gender' => $patient->gender,
                'phone' => $patient->phone,
                'email' => $patient->email,
                'address' => $patient->address,
                'next_of_kin_name' => $patient->next_of_kin_name,
                'next_of_kin_phone' => $patient->next_of_kin_phone,
                'next_of_kin_relationship' => $patient->next_of_kin_relationship,
                'notes' => $patient->notes,
                'is_deceased' => $patient->is_deceased,
                'registered_at' => $patient->created_at?->toDayDateTimeString(),
                'registered_by' => $patient->registeredBy?->name,
            ],
            'encounters' => $patient->encounters
                ->map(fn ($encounter): array => [
                    'id' => $encounter->id,
                    'encounter_number' => $encounter->encounter_number,
                    'type' => $encounter->type,
                    'status' => $encounter->status,
                    'reason' => $encounter->reason_for_visit,
                    'registered_at' => $encounter->registered_at?->toDayDateTimeString(),
                    'has_consultation' => $encounter->consultation !== null,
                    'consultation_status' => $encounter->consultation?->status,
                ]),
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('Patients/Edit', [
            'patient' => [
                'id' => $patient->id,
                'first_name' => $patient->first_name,
                'middle_name' => $patient->middle_name,
                'last_name' => $patient->last_name,
                'date_of_birth' => $patient->date_of_birth?->toDateString(),
                'gender' => $patient->gender,
                'phone' => $patient->phone,
                'email' => $patient->email,
                'address' => $patient->address,
                'next_of_kin_name' => $patient->next_of_kin_name,
                'next_of_kin_phone' => $patient->next_of_kin_phone,
                'next_of_kin_relationship' => $patient->next_of_kin_relationship,
                'notes' => $patient->notes,
            ],
            'genders' => ['female', 'male', 'other'],
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
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

        return redirect()
            ->route('patients.show', $patient)
            ->with('success', 'Patient details updated.');
    }
}
