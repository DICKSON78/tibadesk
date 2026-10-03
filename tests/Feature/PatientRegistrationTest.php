<?php

namespace Tests\Feature;

use App\Enums\FacilityStatus;
use App\Enums\Module;
use App\Enums\Role;
use App\Models\Consultation;
use App\Models\Encounter;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The shared clinical core as a receptionist and a clinician actually walk it:
 * register the patient, open the visit, write the note, sign it off.
 */
class PatientRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;

    private User $receptionist;

    private User $clinician;

    protected function setUp(): void
    {
        parent::setUp();

        $this->facility = Facility::factory()->provisioned()->create();
        $this->receptionist = User::factory()->forFacility($this->facility)->role(Role::Receptionist)->create();
        $this->clinician = User::factory()->forFacility($this->facility)->role(Role::Clinician)->create();
    }

    #[Test]
    public function a_receptionist_registers_a_patient_and_gets_a_number(): void
    {
        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', [
                'first_name' => 'Amina',
                'last_name' => 'Mzee',
                'date_of_birth' => '1994-03-11',
                'gender' => 'female',
                'phone' => '+255754000111',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.first_name', 'Amina');
        $response->assertJsonPath('data.full_name', 'Amina Mzee');
        $response->assertJsonPath('data.age', 32);

        $this->assertMatchesRegularExpression(
            '/^P-\d{6}$/',
            $response->json('data.patient_number'),
        );

        $this->assertDatabaseHas('patients', [
            'facility_id' => $this->facility->id,
            'first_name' => 'Amina',
        ]);
    }

    #[Test]
    public function patient_numbers_run_in_order_and_never_repeat(): void
    {
        $first = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'First'])->json('data.patient_number');

        $second = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Second'])->json('data.patient_number');

        $this->assertSame('P-000001', $first);
        $this->assertSame('P-000002', $second);
    }

    #[Test]
    public function two_facilities_each_start_their_own_numbering(): void
    {
        $otherFacility = Facility::factory()->provisioned()->create();
        $otherReceptionist = User::factory()->forFacility($otherFacility)->role(Role::Receptionist)->create();

        $mine = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Mine'])->json('data.patient_number');

        $theirs = $this->actingAs($otherReceptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Theirs'])->json('data.patient_number');

        // Both read P-000001, because the number is only ever meant to be
        // meaningful inside the building that issued it.
        $this->assertSame('P-000001', $mine);
        $this->assertSame('P-000001', $theirs);
    }

    #[Test]
    public function a_patient_without_a_name_is_refused(): void
    {
        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['gender' => 'male'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('first_name');
    }

    #[Test]
    public function a_date_of_birth_in_the_future_is_refused(): void
    {
        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', [
                'first_name' => 'Time',
                'date_of_birth' => now()->addYear()->toDateString(),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date_of_birth');
    }

    #[Test]
    public function a_patient_cannot_be_looked_up_by_another_facilitys_number(): void
    {
        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Private']);

        $otherFacility = Facility::factory()->provisioned()->create();
        $theirReceptionist = User::factory()->forFacility($otherFacility)->role(Role::Receptionist)->create();

        $this->actingAs($theirReceptionist, 'sanctum')
            ->getJson('/api/patients?search=Private')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    #[Test]
    public function a_receptionist_cannot_complete_a_consultation(): void
    {
        $encounter = $this->openEncounter();

        // A receptionist may see the consultation but not sign it: the record
        // has to carry a clinician's name.
        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation/complete")
            ->assertForbidden();
    }

    #[Test]
    public function a_clinician_writes_and_completes_a_consultation(): void
    {
        $encounter = $this->openEncounter();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'chief_complaint' => 'Headache and fever for three days',
                'examination' => 'Febrile, 38.4C. No neck stiffness.',
                'clinical_notes' => 'Features of malaria. Parasites not yet seen.',
                'plan' => 'Malaria rapid diagnostic test, then treat.',
                'diagnoses' => [
                    ['description' => 'Malaria, uncomplicated', 'type' => 'principal'],
                ],
                'prescriptions' => [
                    [
                        'medicine' => 'Artemether/Lumefantrine 20/120mg',
                        'dose' => '4 tablets',
                        'frequency' => 'Twice daily',
                        'duration' => '3 days',
                        'quantity' => 8,
                    ],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.chief_complaint', 'Headache and fever for three days')
            ->assertJsonPath('data.diagnoses.0.description', 'Malaria, uncomplicated')
            ->assertJsonPath('data.diagnoses.0.is_principal', true)
            ->assertJsonPath('data.prescriptions.0.medicine', 'Artemether/Lumefantrine 20/120mg')
            ->assertJsonPath('data.prescriptions.0.status', 'pending');

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation/complete")
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.is_locked', true);

        $this->assertDatabaseHas('consultations', [
            'facility_id' => $this->facility->id,
            'encounter_id' => $encounter->id,
            'clinician_id' => $this->clinician->id,
            'status' => 'completed',
        ]);
    }

    #[Test]
    public function a_completed_consultation_cannot_be_edited_afterwards(): void
    {
        $encounter = $this->openEncounter();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'examination' => 'Normal',
                'clinical_notes' => 'Original note',
            ])->assertCreated();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation/complete")
            ->assertOk();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'clinical_notes' => 'Tampered note',
            ])
            ->assertStatus(409);

        $this->assertDatabaseHas('consultations', [
            'id' => Consultation::query()->value('id'),
            'clinical_notes' => 'Original note',
        ]);
    }

    #[Test]
    public function an_empty_consultation_cannot_be_completed(): void
    {
        $encounter = $this->openEncounter();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", ['chief_complaint' => 'Malaise'])
            ->assertCreated();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation/complete")
            ->assertUnprocessable();
    }

    #[Test]
    public function re_saving_a_draft_replaces_its_diagnoses_without_duplicating(): void
    {
        $encounter = $this->openEncounter();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'clinical_notes' => 'First pass',
                'diagnoses' => [['description' => 'Malaria, uncomplicated']],
            ])->assertCreated();

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'clinical_notes' => 'Second pass',
                'diagnoses' => [['description' => 'Typhoid fever']],
            ])->assertCreated();

        $consultation = Consultation::query()->where('encounter_id', $encounter->id)->firstOrFail();

        $this->assertSame('Second pass', $consultation->clinical_notes);
        $this->assertSame(1, $consultation->diagnoses()->count());
        $this->assertSame('Typhoid fever', $consultation->diagnoses()->value('description'));
    }

    #[Test]
    public function the_visit_runs_registered_to_started_to_completed(): void
    {
        $patientId = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Walkin'])
            ->assertCreated()
            ->json('data.id');

        $encounterId = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/encounters', ['patient_id' => $patientId])
            ->assertCreated()
            ->json('data.id');

        $encounter = Encounter::query()->findOrFail($encounterId);

        $this->assertSame('registered', $encounter->status);

        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/complete")
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertNotNull($encounter->fresh()->completed_at);
    }

    #[Test]
    public function a_clinic_without_the_consultation_module_cannot_consult(): void
    {
        $encounter = $this->openEncounter();

        // Revoke consultation only once the visit is open, which is what an
        // unsupported add-on looks like at runtime.
        $this->facility->ownModuleGrants()
            ->where('module', Module::Consultation->value)
            ->update(['revoked_at' => now()]);

        $this->actingAs($this->clinician, 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'clinical_notes' => 'Should never be accepted.',
            ])
            ->assertForbidden();

        $this->assertSame(0, Consultation::query()->count());
    }

    #[Test]
    public function a_signed_in_user_cannot_write_into_another_facility(): void
    {
        $otherFacility = Facility::factory()->provisioned()->create();

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', [
                'first_name' => 'Trespass',
                'facility_id' => $otherFacility->id,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('patients', [
            'facility_id' => $this->facility->id,
            'first_name' => 'Trespass',
        ]);
        $this->assertDatabaseMissing('patients', [
            'facility_id' => $otherFacility->id,
            'first_name' => 'Trespass',
        ]);
    }

    #[Test]
    public function signing_in_returns_the_facility_and_its_modules(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $this->clinician->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonPath('user.role', Role::Clinician->value);
        $response->assertJsonPath('user.facility.id', $this->facility->id);
        $response->assertJsonPath('user.facility.edition', $this->facility->edition->value);
        $this->assertNotEmpty($response->json('token'));
    }

    #[Test]
    public function a_wrong_password_is_refused_without_revealing_whether_the_account_exists(): void
    {
        $unknown = $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.test',
            'password' => 'whatever',
        ])->assertUnprocessable()->json('errors.email.0');

        $wrong = $this->postJson('/api/auth/login', [
            'email' => $this->clinician->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable()->json('errors.email.0');

        $this->assertSame($unknown, $wrong);
    }

    #[Test]
    public function a_disabled_account_cannot_sign_in(): void
    {
        $this->clinician->update(['is_active' => false]);

        $this->postJson('/api/auth/login', [
            'email' => $this->clinician->email,
            'password' => 'password',
        ])->assertUnprocessable();
    }

    #[Test]
    public function a_suspended_facility_stops_its_staff_signing_in(): void
    {
        $this->facility->update(['status' => FacilityStatus::Suspended]);

        $this->postJson('/api/auth/login', [
            'email' => $this->clinician->email,
            'password' => 'password',
        ])->assertUnprocessable();
    }

    #[Test]
    public function the_register_lists_only_this_facilitys_patients(): void
    {
        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Mwamgweme'])
            ->assertCreated();

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->getJson('/api/patients')
            ->assertOk();

        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.first_name', 'Mwamgweme');
        $response->assertJsonPath('meta.current_page', 1);
    }

    #[Test]
    public function a_deleted_patient_leaves_the_clinical_history_in_place(): void
    {
        $encounter = $this->openEncounter();

        $patient = Patient::query()->findOrFail($encounter->patient_id);

        $this->actingAs($this->receptionist, 'sanctum')
            ->deleteJson("/api/patients/{$patient->id}")
            ->assertNoContent();

        // Gone from the register, still reachable from the visit it belongs to.
        $this->assertNull(Patient::query()->find($patient->id));
        $this->assertNotNull(Patient::query()->withTrashed()->find($patient->id));
        $this->assertDatabaseHas('encounters', ['id' => $encounter->id]);
    }

    /**
     * Register a patient and open a visit for them, as reception would.
     */
    private function openEncounter(): Encounter
    {
        $patientId = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', ['first_name' => 'Patient'])
            ->assertCreated()
            ->json('data.id');

        $encounterId = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/encounters', [
                'patient_id' => $patientId,
                'type' => 'opd',
                'reason_for_visit' => 'General complaint',
            ])
            ->assertCreated()
            ->json('data.id');

        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson("/api/encounters/{$encounterId}/start")
            ->assertOk();

        return Encounter::query()->findOrFail($encounterId);
    }
}
