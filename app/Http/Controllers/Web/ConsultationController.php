<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsultationRequest;
use App\Models\Consultation;
use App\Models\ConsultationDiagnosis;
use App\Models\Encounter;
use App\Models\Prescription;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly CurrentFacility $current,
    ) {}

    /**
     * The consultation for an encounter, as JSON.
     *
     * A web route rather than the API one because this screen is reached from
     * the session, not from a Sanctum token, and the visit must not 404 just
     * because no consultation has been written yet.
     */
    public function show(Encounter $encounter): JsonResponse
    {
        $consultation = $encounter->consultation;

        if ($consultation === null) {
            return response()->json(['data' => null], JsonResponse::HTTP_NOT_FOUND);
        }

        $consultation->load(['clinician', 'diagnoses', 'prescriptions']);

        return response()->json([
            'data' => [
                'id' => $consultation->id,
                'consultation_number' => $consultation->consultation_number,
                'status' => $consultation->status,
                'is_locked' => $consultation->isLocked(),
                'chief_complaint' => $consultation->chief_complaint,
                'history_present_illness' => $consultation->history_present_illness,
                'past_medical_history' => $consultation->past_medical_history,
                'drug_history' => $consultation->drug_history,
                'family_history' => $consultation->family_history,
                'allergy_history' => $consultation->allergy_history,
                'general_health' => $consultation->general_health,
                'examination' => $consultation->examination,
                'clinical_notes' => $consultation->clinical_notes,
                'plan' => $consultation->plan,
                'remarks' => $consultation->remarks,
                'completed_at' => $consultation->completed_at?->toIso8601String(),
                'diagnoses' => $consultation->diagnoses
                    ->map(fn (ConsultationDiagnosis $diagnosis): array => [
                        'id' => $diagnosis->id,
                        'description' => $diagnosis->description,
                        'code' => $diagnosis->code,
                        'type' => $diagnosis->type,
                        'is_principal' => $diagnosis->isPrincipal(),
                    ]),
                'prescriptions' => $consultation->prescriptions
                    ->map(fn (Prescription $prescription): array => [
                        'id' => $prescription->id,
                        'medicine' => $prescription->medicine,
                        'dose' => $prescription->dose,
                        'route' => $prescription->route,
                        'frequency' => $prescription->frequency,
                        'duration' => $prescription->duration,
                        'instructions' => $prescription->instructions,
                        'quantity' => $prescription->quantity,
                        'status' => $prescription->status,
                    ]),
            ],
        ]);
    }

    public function store(StoreConsultationRequest $request, Encounter $encounter): RedirectResponse
    {
        // Checked before the encounter status, because a signed consultation is
        // refused for being signed. Reporting "start the encounter" instead
        // would send the clinician looking for a button that does not exist.
        $existing = $encounter->consultation;

        abort_if(
            $existing !== null && $existing->isLocked(),
            409,
            'This consultation is already completed and cannot be edited. Raise a follow-up encounter instead.',
        );

        $refusal = $encounter->consultableRefusal();
        abort_if($refusal !== null, 422, $refusal);

        $consultation = DB::transaction(function () use ($request, $encounter): Consultation {
            $existing = $encounter->consultation;

            if ($existing !== null) {
                return $this->apply($existing, $request, $request->user());
            }

            $consultation = Consultation::create([
                'facility_id' => $this->current->idOrFail(),
                'encounter_id' => $encounter->getKey(),
                'consultation_number' => $this->numbers->nextForCurrent(
                    DocumentNumberGenerator::CONSULTATION,
                ),
                'status' => 'draft',
                'clinician_id' => $request->user()->id,
            ]);

            $consultation = $this->apply($consultation, $request, $request->user());

            // Inside the transaction on purpose: a consultation that cannot be
            // signed off must leave no record behind, not a stranded empty
            // draft that the next attempt then trips over.
            if ($request->completesTheConsultation()) {
                $this->assertSignable($consultation);

                $consultation->complete($request->user());
            }

            return $consultation;
        });

        // Saving and signing off is one submit and one transaction, so the
        // notes a clinician just typed cannot be dropped on the way to being
        // signed, and a half-signed consultation cannot be left behind.
        if ($request->completesTheConsultation()) {
            $encounter->complete();

            return back()->with('success', "Consultation {$consultation->consultation_number} saved and completed.");
        }

        return back()->with('success', "Consultation {$consultation->consultation_number} saved.");
    }

    public function complete(Encounter $encounter): RedirectResponse
    {
        $consultation = $encounter->consultation;

        abort_if($consultation === null, 404, 'Write the consultation before completing it.');

        $this->assertSignable($consultation);

        $consultation->complete(request()->user());
        $encounter->complete();

        return back()->with('success', 'Consultation completed.');
    }

    /**
     * Refuse to sign off a record with nothing in it, rather than letting an
     * empty consultation enter the legal record.
     */
    private function assertSignable(Consultation $consultation): void
    {
        abort_if(
            blank($consultation->clinical_notes) && blank($consultation->examination),
            422,
            'A consultation needs at least an examination or clinical notes before it can be completed.',
        );
    }

    private function apply(Consultation $consultation, StoreConsultationRequest $request, $author): Consultation
    {
        $consultation->fill($request->safe()->only([
            'chief_complaint',
            'history_present_illness',
            'past_medical_history',
            'drug_history',
            'family_history',
            'allergy_history',
            'general_health',
            'examination',
            'clinical_notes',
            'plan',
            'remarks',
        ]))->save();

        $this->syncDiagnoses($consultation, $request, $author);
        $this->syncPrescriptions($consultation, $request, $author);

        return $consultation;
    }

    private function syncDiagnoses(Consultation $consultation, StoreConsultationRequest $request, $author): void
    {
        if (! $request->has('diagnoses')) {
            return;
        }

        $consultation->diagnoses()->delete();

        foreach ($request->array('diagnoses', []) as $diagnosis) {
            ConsultationDiagnosis::create([
                'facility_id' => $consultation->facility_id,
                'consultation_id' => $consultation->getKey(),
                'description' => $diagnosis['description'],
                'code' => $diagnosis['code'] ?? null,
                'type' => $diagnosis['type'] ?? 'preliminary',
                'notes' => $diagnosis['notes'] ?? null,
                'recorded_by' => $author->id,
            ]);
        }
    }

    private function syncPrescriptions(Consultation $consultation, StoreConsultationRequest $request, $author): void
    {
        if (! $request->has('prescriptions')) {
            return;
        }

        // A prescription already dispensed is part of the pharmacy record and
        // must not vanish because a clinician re-saved the notes.
        $consultation->prescriptions()->where('status', 'pending')->delete();

        $patientId = $consultation->encounter->patient_id;

        foreach ($request->array('prescriptions', []) as $prescription) {
            Prescription::create([
                'facility_id' => $consultation->facility_id,
                'consultation_id' => $consultation->getKey(),
                'patient_id' => $patientId,
                'medicine' => $prescription['medicine'],
                'dose' => $prescription['dose'] ?? null,
                'route' => $prescription['route'] ?? null,
                'frequency' => $prescription['frequency'] ?? null,
                'duration' => $prescription['duration'] ?? null,
                'instructions' => $prescription['instructions'] ?? null,
                'quantity' => $prescription['quantity'] ?? 1,
                'prescribed_by' => $author->id,
            ]);
        }
    }
}
