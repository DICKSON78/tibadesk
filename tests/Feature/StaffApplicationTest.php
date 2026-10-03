<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\FacilityStatus;
use App\Enums\Module;
use App\Enums\Role;
use App\Models\Encounter;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The screens a receptionist and a clinician actually open.
 *
 * The API tests prove the rules; these prove the rules reach a page, because a
 * gate that is enforced in a controller but missing from the route file lets
 * anyone through, and a gate applied in the right order but not the right
 * group closes a page a user needs.
 */
class StaffApplicationTest extends TestCase
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

    /**
     * /patients/create and /encounters/create are shadowed by the {patient} and
     * {encounter} routes unless the parameter is constrained to a number. It
     * looks correct in route:list either way, so it needs a test.
     */
    #[Test]
    public function the_create_screens_are_not_shadowed_by_the_show_routes(): void
    {
        $this->actingAs($this->receptionist)
            ->get('/tibadesk/patients/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Patients/Create'));

        $this->actingAs($this->receptionist)
            ->get('/tibadesk/encounters/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Encounters/Create'));
    }

    #[Test]
    public function a_guest_is_sent_to_the_login_screen(): void
    {
        $this->get('/tibadesk')->assertRedirect('/tibadesk/login');
        $this->get('/tibadesk/patients')->assertRedirect('/tibadesk/login');
    }

    #[Test]
    public function the_login_screen_renders_bare_with_no_navigation(): void
    {
        $this->get('/tibadesk/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Login')
                // The bare screen's whole point: no user, no facility, so the
                // layout has nothing to build a navigation from.
                ->where('auth.user', null)
                ->where('auth.facility', null)
            );
    }

    /**
     * The marketing site proxies this sign-in form, so it needs a token bound
     * to a session it can post back here. It has to be issued to a signed-in
     * visitor as readily as to a guest: the site asks for one on every visit
     * to its login screen, and anybody still holding a valid cookie would
     * otherwise be left with a disabled submit button.
     */
    #[Test]
    public function a_csrf_token_is_issued_to_a_guest_and_to_a_signed_in_user_alike(): void
    {
        $guest = $this->get('/csrf-token');

        $guest->assertOk()->assertJsonStructure(['token']);

        $this->actingAs($this->receptionist)->get('/csrf-token')
            ->assertOk()
            ->assertJsonStructure(['token']);
    }

    #[Test]
    public function the_csrf_token_is_usable_against_the_sign_in_post(): void
    {
        $token = $this->get('/csrf-token')->json('token');

        $this->withSession(['_token' => $token])
            ->post('/tibadesk/login', [
                'email' => $this->receptionist->email,
                'password' => 'password',
            ])
            ->assertRedirect('/tibadesk');
    }

    #[Test]
    public function a_receptionist_can_sign_in_and_see_the_dashboard(): void
    {
        $this->post('/tibadesk/login', [
            'email' => $this->receptionist->email,
            'password' => 'password',
        ])->assertRedirect('/tibadesk');

        $this->actingAs($this->receptionist)
            ->get('/tibadesk')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('auth.facility.name', $this->facility->name)
                ->where('auth.user.role', 'receptionist')
                ->where('can.registerPatient', true)
                // Front desk registers, but does not write clinical notes.
                ->where('can.consult', false)
            );
    }

    #[Test]
    public function signing_in_with_the_wrong_password_is_refused(): void
    {
        $this->post('/tibadesk/login', [
            'email' => $this->receptionist->email,
            'password' => 'wrong',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    #[Test]
    public function a_suspended_facility_cannot_sign_in(): void
    {
        $this->facility->update(['status' => FacilityStatus::Suspended]);

        $this->post('/tibadesk/login', [
            'email' => $this->receptionist->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    #[Test]
    public function the_register_is_reachable_and_searchable(): void
    {
        $this->actingAs($this->receptionist)
            ->get('/tibadesk/patients')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Patients/Index')
                ->has('patients')
                ->has('filters.search')
            );

        $this->actingAs($this->receptionist)
            ->get('/tibadesk/patients?search=Amina')
            ->assertInertia(fn (Assert $page) => $page->where('filters.search', 'Amina'));
    }

    #[Test]
    public function a_receptionist_can_register_a_patient_and_is_shown_the_number(): void
    {
        $this->actingAs($this->receptionist)
            ->post('/tibadesk/patients', ['first_name' => 'Amina', 'last_name' => 'Mzee'])
            ->assertSessionHas('success');

        $this->actingAs($this->receptionist)
            ->get('/tibadesk/patients')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Patients/Index')
                ->where('patients.data.0.full_name', 'Amina Mzee')
                ->where('patients.data.0.patient_number', 'P-000001')
                ->where('patients.data.0.age', null)
            );
    }

    #[Test]
    public function a_receptionist_cannot_reach_the_consultation_screen(): void
    {
        $encounter = $this->openEncounter();

        // They may open the visit, but not write the clinical record in it.
        $this->actingAs($this->receptionist)
            ->get("/tibadesk/encounters/{$encounter->id}")
            ->assertOk();

        $this->actingAs($this->receptionist)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'clinical_notes' => 'Should be refused.',
            ])
            ->assertForbidden();
    }

    #[Test]
    public function a_clinician_cannot_write_notes_on_a_visit_still_waiting(): void
    {
        $encounter = $this->openEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", ['clinical_notes' => 'Too early.'])
            ->assertStatus(422);
    }

    #[Test]
    public function a_clinician_can_write_and_complete_a_consultation_from_the_screen(): void
    {
        $encounter = $this->startedEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'chief_complaint' => 'Headache and fever',
                'examination' => 'Febrile, 38.4C',
                'clinical_notes' => 'Features of malaria.',
                'diagnoses' => [
                    ['description' => 'Malaria, uncomplicated', 'type' => 'principal'],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->actingAs($this->clinician)
            ->get("/tibadesk/encounters/{$encounter->id}/consultation")
            ->assertOk()
            ->assertJsonPath('data.chief_complaint', 'Headache and fever')
            ->assertJsonPath('data.diagnoses.0.description', 'Malaria, uncomplicated');

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation/complete")
            ->assertRedirect();

        $this->assertSame('completed', $encounter->fresh()->status);
    }

    /**
     * The screen offers one button for "save and complete", so a single submit
     * must both persist what is on screen and sign it off. Two requests lose
     * the notes typed between them.
     */
    #[Test]
    public function saving_and_completing_in_one_submit_keeps_the_notes_and_signs_the_visit(): void
    {
        $encounter = $this->startedEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'complete' => true,
                'chief_complaint' => 'Cough, three days',
                'examination' => 'Chest clear',
                'clinical_notes' => 'Likely viral. No antibiotics indicated.',
                'diagnoses' => [
                    ['description' => 'Upper respiratory tract infection', 'type' => 'principal'],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $consultation = $encounter->fresh()->consultation;

        $this->assertNotNull($consultation, 'The single submit must still create the consultation.');
        $this->assertSame('completed', $consultation->status);
        $this->assertSame('Cough, three days', $consultation->chief_complaint);
        $this->assertSame('Likely viral. No antibiotics indicated.', $consultation->clinical_notes);
        $this->assertSame('Upper respiratory tract infection', $consultation->diagnoses->first()->description);
        $this->assertSame('completed', $encounter->fresh()->status);
    }

    #[Test]
    public function a_completed_consultation_cannot_be_edited_through_the_same_submit(): void
    {
        $encounter = $this->startedEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'complete' => true,
                'examination' => 'Normal',
                'clinical_notes' => 'Signed off.',
            ])->assertRedirect();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'complete' => true,
                'clinical_notes' => 'Quietly rewritten after signing.',
            ])->assertStatus(409);

        $this->assertSame(
            'Signed off.',
            $encounter->fresh()->consultation->clinical_notes,
        );
    }

    #[Test]
    public function an_empty_consultation_cannot_be_signed_off_in_one_submit(): void
    {
        $encounter = $this->startedEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'complete' => true,
                'chief_complaint' => 'Malaise',
            ])->assertStatus(422);

        $this->assertNull($encounter->fresh()->consultation);
    }

    #[Test]
    public function a_receptionist_cannot_sign_off_a_consultation(): void
    {
        $encounter = $this->startedEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'examination' => 'Normal',
                'clinical_notes' => 'Draft only.',
            ])->assertRedirect();

        $this->actingAs($this->receptionist)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", [
                'complete' => true,
                'clinical_notes' => 'Signed off by the wrong role.',
            ])->assertForbidden();

        $this->assertSame('draft', $encounter->fresh()->consultation->status);
    }

    #[Test]
    public function a_facility_without_the_consultation_module_cannot_reach_the_consultation_screen(): void
    {
        $encounter = $this->openEncounter();

        $this->facility->ownModuleGrants()
            ->where('module', Module::Consultation->value)
            ->update(['revoked_at' => now()]);

        $this->actingAs($this->clinician)
            ->get("/tibadesk/encounters/{$encounter->id}/consultation")
            ->assertForbidden();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", ['clinical_notes' => 'x'])
            ->assertForbidden();
    }

    #[Test]
    public function a_patient_from_another_facility_is_not_reachable_by_id(): void
    {
        $theirFacility = Facility::factory()->provisioned()->create();
        $theirPatient = Patient::factory()->forFacility($theirFacility)->create();

        $this->actingAs($this->receptionist)
            ->get("/tibadesk/patients/{$theirPatient->id}")
            ->assertNotFound();
    }

    #[Test]
    public function the_navigation_only_offers_modules_the_facility_holds(): void
    {
        // The layout builds the navigation from this prop and nothing else, so
        // this is the contract that keeps a menu entry from being a dead link.
        $this->actingAs($this->receptionist)
            ->get('/tibadesk')
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.facility.modules', fn (mixed $modules): bool => collect($modules)->all() === [
                    Module::Registration->value,
                    Module::Consultation->value,
                    Module::Polyclinic->value,
                    Module::Pharmacy->value,
                    Module::Laboratory->value,
                    Module::Billing->value,
                    Module::Reporting->value,
                    Module::Licensing->value,
                ])
                ->where('auth.user.capabilities', fn (mixed $capabilities): bool => in_array('patients.register', collect($capabilities)->all(), true))
            );

        // Take a module away and it leaves the menu with it, rather than
        // surviving as a link that 403s on click.
        $this->facility->ownModuleGrants()
            ->where('module', Module::Pharmacy->value)
            ->update(['revoked_at' => now()]);

        $this->actingAs($this->receptionist)
            ->get('/tibadesk')
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.facility.modules', fn (mixed $modules): bool => ! in_array(Module::Pharmacy->value, collect($modules)->all(), true))
            );
    }

    #[Test]
    public function an_empty_consultation_cannot_be_completed_from_the_screen(): void
    {
        $encounter = $this->startedEncounter();

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation", ['chief_complaint' => 'Malaise']);

        $this->actingAs($this->clinician)
            ->post("/tibadesk/encounters/{$encounter->id}/consultation/complete")
            ->assertStatus(422);
    }

    #[Test]
    public function signing_out_ends_the_session(): void
    {
        $this->actingAs($this->receptionist)->post('/tibadesk/logout')->assertRedirect('/tibadesk/login');

        $this->assertGuest();
    }

    /**
     * Provision a facility the way a real customer arrives: through the
     * activation endpoint, so the screens are exercised against the same
     * shape of data production creates.
     */
    #[Test]
    public function a_facility_activated_from_a_registration_can_use_the_application(): void
    {
        config(['services.tibadesk.activation_key' => 'secret']);

        $this->postJson('/api/activations', [
            'name' => 'Bweru Clinic',
            'edition' => Edition::DentalClinic->value,
            'owner_name' => 'Grace Nali',
            'owner_email' => 'grace@bweru.test',
            'owner_password' => 'a-good-password',
            'registration_reference' => 'TBR-BWERU001',
        ], ['X-TibaDesk-Activation-Key' => 'secret'])->assertCreated();

        $owner = User::query()->where('email', 'grace@bweru.test')->firstOrFail();

        $this->post('/tibadesk/login', [
            'email' => 'grace@bweru.test',
            'password' => 'a-good-password',
        ])->assertRedirect('/tibadesk');

        $this->actingAs($owner)->get('/tibadesk')->assertOk()->assertSee('Bweru Clinic');
    }

    /**
     * A visit sitting in the waiting room: registered, not yet started.
     */
    private function openEncounter(): Encounter
    {
        $patient = Patient::factory()->forFacility($this->facility)->create();

        $this->actingAs($this->receptionist)
            ->post('/tibadesk/encounters', ['patient_id' => $patient->id, 'reason_for_visit' => 'General'])
            ->assertRedirect();

        return Encounter::query()->latest('id')->firstOrFail();
    }

    /**
     * A visit the clinician has actually picked up.
     */
    private function startedEncounter(): Encounter
    {
        $encounter = $this->openEncounter();

        $this->actingAs($this->receptionist)
            ->post("/tibadesk/encounters/{$encounter->id}/start")
            ->assertRedirect();

        return $encounter->fresh();
    }
}
