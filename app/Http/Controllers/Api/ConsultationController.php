<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsultationRequest;
use App\Http\Resources\ConsultationResource;
use App\Models\Consultation;
use App\Models\ConsultationDiagnosis;
use App\Models\Encounter;
use App\Models\Prescription;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly CurrentFacility $current,
    ) {}

    public function show(Encounter $encounter): ConsultationResource
    {
        $consultation = $encounter->consultation;

        abort_if($consultation === null, 404, 'This encounter has no consultation yet.');

        return new ConsultationResource(
            $consultation->load(['clinician', 'diagnoses', 'prescriptions']),
        );
    }

    /**
     * Open the consultation for an encounter, or keep editing its draft.
     *
     * A completed consultation is never edited in place. One encounter carries
     * exactly one consultation, so reopening is refused outright rather than
     * overwriting the version a clinician signed off.
     */
    public function store(StoreConsultationRequest $request, Encounter $encounter): JsonResponse
    {
        $refusal = $encounter->consultableRefusal();
        abort_if($refusal !== null, 422, $refusal);

        $consultation = DB::transaction(function () use ($request, $encounter): Consultation {
            $existing = $encounter->consultation;

            if ($existing !== null) {
                abort_if(
                    $existing->isLocked(),
                    409,
                    'This consultation is already completed and cannot be edited. Raise a follow-up encounter instead.',
                );

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

            return $this->apply($consultation, $request, $request->user());
        });

        return (new ConsultationResource($consultation->load(['diagnoses', 'prescriptions'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function complete(Request $request, Encounter $encounter): ConsultationResource
    {
        $consultation = $encounter->consultation;

        abort_if($consultation === null, 404, 'This encounter has no consultation to complete.');

        // Refuse to sign off a record with nothing in it, rather than letting
        // an empty consultation enter the legal record.
        abort_if(
            blank($consultation->clinical_notes) && blank($consultation->examination),
            422,
            'A consultation needs at least an examination or clinical notes before it can be completed.',
        );

        $consultation->complete($request->user());

        return new ConsultationResource(
            $consultation->fresh()->load(['clinician', 'diagnoses', 'prescriptions']),
        );
    }

    /**
     * Replace the clinical content of a draft: the narrative fields, plus the
     * diagnoses and prescriptions supplied with them.
     */
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
