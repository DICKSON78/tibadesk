<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEncounterRequest;
use App\Models\Encounter;
use App\Models\Patient;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EncounterController extends Controller
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly CurrentFacility $current,
    ) {}

    public function index(Request $request): Response
    {
        $encounters = Encounter::query()
            ->with(['patient', 'clinician'])
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')),
            )
            ->latest('registered_at')
            ->paginate(min((int) $request->integer('per_page', 25), 100))
            ->withQueryString();

        return Inertia::render('Encounters/Index', [
            'encounters' => [
                'data' => $encounters->getCollection()->map(fn (Encounter $encounter): array => [
                    'id' => $encounter->id,
                    'encounter_number' => $encounter->encounter_number,
                    'type' => $encounter->type,
                    'status' => $encounter->status,
                    'reason_for_visit' => $encounter->reason_for_visit,
                    'department' => $encounter->department,
                    'clinician' => $encounter->clinician?->name,
                    // Sent as a date string, because the page is JavaScript and
                    // cannot call a PHP formatter on it.
                    'registered_at' => $encounter->registered_at?->toIso8601String(),
                    'patient' => [
                        'id' => $encounter->patient->id,
                        'patient_number' => $encounter->patient->patient_number,
                        'full_name' => $encounter->patient->fullName(),
                    ],
                ])->all(),
                'meta' => [
                    'current_page' => $encounters->currentPage(),
                    'last_page' => $encounters->lastPage(),
                    'from' => $encounters->firstItem(),
                    'to' => $encounters->lastItem(),
                    'total' => $encounters->total(),
                ],
                'links' => $encounters->linkCollection()->toArray(),
            ],
            'filters' => [
                'status' => $request->string('status')->toString(),
            ],
            'statuses' => [
                'registered' => 'Waiting',
                'in_progress' => 'In consultation',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $patients = Patient::query()
            ->search($request->string('search')->toString())
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Patient $patient): array => [
                'id' => $patient->id,
                'patient_number' => $patient->patient_number,
                'full_name' => $patient->fullName(),
                'age' => $patient->ageInYears(),
                'gender' => $patient->gender,
            ]);

        return Inertia::render('Encounters/Create', [
            'patients' => $patients,
            'filters' => ['search' => $request->string('search')->toString()],
            // Arriving from a patient record pre-selects that patient, so the
            // receptionist does not have to find them in the list again.
            'preselected' => $request->integer('patient') ?: null,
            'types' => [
                'opd' => 'OPD',
                'emergency' => 'Emergency',
                'day_case' => 'Day case',
                'inpatient' => 'Inpatient',
                'home_visit' => 'Home visit',
            ],
            'paymentModes' => [
                'cash' => 'Cash',
                'insurance' => 'Insurance',
                'mobile_money' => 'Mobile money',
                'card' => 'Card',
                'bank_transfer' => 'Bank transfer',
                'credit' => 'Credit',
            ],
        ]);
    }

    public function store(StoreEncounterRequest $request): RedirectResponse
    {
        $encounter = DB::transaction(function () use ($request): Encounter {
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
                'encounter_number' => $this->numbers->next(
                    $this->current->get(),
                    DocumentNumberGenerator::ENCOUNTER,
                ),
                'registered_by' => $request->user()->id,
                'registered_at' => now(),
            ]);
        });

        return redirect()
            ->route('encounters.show', $encounter)
            ->with('success', "{$encounter->encounter_number} opened for {$encounter->patient->fullName()}.");
    }

    public function show(Encounter $encounter): Response
    {
        $encounter->load(['patient', 'clinician', 'consultation.diagnoses', 'consultation.prescriptions']);

        return Inertia::render('Encounters/Show', [
            'encounter' => [
                'id' => $encounter->id,
                'encounter_number' => $encounter->encounter_number,
                'status' => $encounter->status,
                'type' => $encounter->type,
                'payment_mode' => $encounter->payment_mode,
                'reason_for_visit' => $encounter->reason_for_visit,
                'department' => $encounter->department,
                'registered_at' => $encounter->registered_at?->toDayDateTimeString(),
                'started_at' => $encounter->started_at?->toDayDateTimeString(),
                'completed_at' => $encounter->completed_at?->toDayDateTimeString(),
                'clinician' => $encounter->clinician?->name,
            ],
            'patient' => [
                'id' => $encounter->patient->id,
                'patient_number' => $encounter->patient->patient_number,
                'full_name' => $encounter->patient->fullName(),
                'age' => $encounter->patient->ageInYears(),
                'gender' => $encounter->patient->gender,
                'phone' => $encounter->patient->phone,
                'allergy_history' => $encounter->patient->notes,
            ],
        ]);
    }

    public function start(Encounter $encounter): RedirectResponse
    {
        $encounter->start();

        return back()->with('success', 'Consultation started.');
    }
}
