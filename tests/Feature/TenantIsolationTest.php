<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\FacilityStatus;
use App\Enums\Module;
use App\Enums\Role;
use App\Models\Consultation;
use App\Models\Encounter;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\User;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The guarantee that makes "every facility is a full working system" safe to
 * sell: one facility can never read or write another facility's data.
 *
 * These tests deliberately go through the model layer and the HTTP layer
 * separately, because a global scope that a controller forgets is still a
 * correct scope, and a scope that a controller can defeat is not.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function asFacility(?Facility $facility): void
    {
        app(CurrentFacility::class)->set($facility);
    }

    /**
     * The other half of the 404 tests below, and the one that was missing.
     *
     * Every isolation test here asserted that somebody else's record is a 404.
     * A build where the tenant was never bound at all also answers 404 to all of
     * them, so the suite went green while every route that opened a patient or
     * an encounter was broken for its own tenant too. An isolation guarantee is
     * only worth anything if the permitted case is asserted alongside the
     * refused one, so this pins the positive: your own record is found.
     *
     * The route has to resolve the record through the URL, because that is where
     * it went wrong — the model was looked up before the tenant was bound.
     */
    #[Test]
    public function a_facility_can_open_its_own_patient_and_encounter_by_id(): void
    {
        $mine = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $me = User::factory()->forFacility($mine)->role(Role::FacilityAdmin)->create();

        $patient = Patient::factory()->forFacility($mine)->create(['first_name' => 'Mwamgweme']);
        $encounter = Encounter::factory()->forPatient($patient)->create();

        $this->actingAs($me, 'sanctum')
            ->getJson("/api/patients/{$patient->id}")
            ->assertOk()
            ->assertJsonPath('data.first_name', 'Mwamgweme');

        $this->actingAs($me, 'sanctum')
            ->getJson("/api/encounters/{$encounter->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $encounter->id);
    }

    /**
     * The same guarantee on the web routes, which carry the tenant in the same
     * middleware and were broken in the same way.
     */
    #[Test]
    public function a_facility_can_open_its_own_patient_page(): void
    {
        $mine = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $me = User::factory()->forFacility($mine)->role(Role::FacilityAdmin)->create();

        $patient = Patient::factory()->forFacility($mine)->create(['first_name' => 'Mwamgweme']);

        $this->actingAs($me)
            ->get("/tibadesk/patients/{$patient->id}")
            ->assertOk();
    }

    #[Test]
    public function a_patient_is_invisible_to_another_facility(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        $theirs = Patient::factory()->forFacility($first)->create(['first_name' => 'Mwamgweme']);

        $this->asFacility($second);

        $this->assertNull(Patient::query()->find($theirs->id));
        $this->assertSame(0, Patient::query()->count());
    }

    #[Test]
    public function a_facility_only_lists_its_own_patients(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        Patient::factory()->count(3)->forFacility($first)->create();
        Patient::factory()->count(2)->forFacility($second)->create();

        $this->asFacility($first);
        $this->assertSame(3, Patient::query()->count());

        $this->asFacility($second);
        $this->assertSame(2, Patient::query()->count());
    }

    #[Test]
    public function a_patient_cannot_be_read_by_its_facility_number_from_elsewhere(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        $theirs = Patient::factory()->forFacility($first)->create(['patient_number' => 'P-000001']);

        $this->asFacility($second);

        $this->assertNull(Patient::query()->where('patient_number', 'P-000001')->first());
        $this->assertNotNull(
            Patient::query()->acrossFacilities($first->id)->where('patient_number', 'P-000001')->first(),
        );
    }

    #[Test]
    public function nothing_is_returned_when_no_facility_is_bound(): void
    {
        $facility = Facility::factory()->create();
        Patient::factory()->count(3)->forFacility($facility)->create();

        $this->asFacility(null);

        // Fails closed. A forgotten binding must never hand over every row.
        $this->assertSame(0, Patient::query()->count());
    }

    #[Test]
    public function creating_a_patient_without_a_facility_is_refused(): void
    {
        $this->asFacility(null);

        $this->expectException(\RuntimeException::class);

        Patient::factory()->create();
    }

    #[Test]
    public function encounters_and_consultations_do_not_cross_facilities(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        $patient = Patient::factory()->forFacility($first)->create();
        $encounter = Encounter::factory()->forPatient($patient)->create();
        $consultation = Consultation::factory()->forEncounter($encounter)->create();

        $this->asFacility($second);

        $this->assertNull(Encounter::query()->find($encounter->id));
        $this->assertNull(Consultation::query()->find($consultation->id));

        $this->asFacility($first);

        $this->assertNotNull(Encounter::query()->find($encounter->id));
        $this->assertNotNull(Consultation::query()->find($consultation->id));
    }

    #[Test]
    public function updating_another_facilitys_patient_does_nothing(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        $theirs = Patient::factory()->forFacility($first)->create(['first_name' => 'Original']);

        $this->asFacility($second);

        $this->assertSame(0, Patient::query()->whereKey($theirs->id)->update([
            'first_name' => 'Tampered',
        ]));

        $this->assertSame('Original', $theirs->fresh()->first_name);
    }

    #[Test]
    public function deleting_another_facilitys_patient_does_nothing(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        $theirs = Patient::factory()->forFacility($first)->create();

        $this->asFacility($second);

        // A mass delete reports how many rows it touched, so the proof is
        // the count being zero rather than a boolean.
        $this->assertSame(0, Patient::query()->whereKey($theirs->id)->delete());
        $this->assertNotNull(Patient::query()->withTrashed()->acrossFacilities($first->id)->find($theirs->id));
    }

    #[Test]
    public function patient_numbers_are_unique_per_facility_not_globally(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        // Two hospitals both starting at P-000001 is the normal case, so the
        // database must allow it while still catching a repeat inside one.
        Patient::factory()->forFacility($first)->create(['patient_number' => 'P-000001']);
        Patient::factory()->forFacility($second)->create(['patient_number' => 'P-000001']);

        Patient::factory()->forFacility($first)->create(['patient_number' => 'P-000002']);

        $this->expectException(QueryException::class);

        Patient::factory()->forFacility($first)->create(['patient_number' => 'P-000001']);
    }

    #[Test]
    public function the_facility_comes_from_the_signed_in_user_not_the_request(): void
    {
        // Both facilities are fully provisioned, so the 403 below can only
        // come from the tenant boundary and not from a missing module.
        $mine = Facility::factory()->provisioned()->create();
        $theirs = Facility::factory()->provisioned()->create();

        $me = User::factory()->forFacility($mine)->role(Role::Clinician)->create();
        Patient::factory()->forFacility($theirs)->create(['first_name' => 'NotMine']);

        // A client that names someone else's facility in the payload cannot
        // change whose data it reads, because nothing reads the payload here.
        $response = $this->actingAs($me, 'sanctum')
            ->getJson('/api/patients?facility_id='.$theirs->id);

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    /**
     * The realistic attack: not a stray query parameter but a real id taken
     * from another facility, sent straight at the route.
     */
    #[Test]
    public function fetching_a_patient_by_id_from_another_facility_is_a_404(): void
    {
        $mine = Facility::factory()->provisioned()->create();
        $theirs = Facility::factory()->provisioned()->create();

        $me = User::factory()->forFacility($mine)->role(Role::FacilityAdmin)->create();
        $theirPatient = Patient::factory()->forFacility($theirs)->create();
        $originalName = $theirPatient->first_name;

        $this->actingAs($me, 'sanctum')
            ->getJson("/api/patients/{$theirPatient->id}")
            ->assertNotFound();

        $this->actingAs($me, 'sanctum')
            ->patchJson("/api/patients/{$theirPatient->id}", ['first_name' => 'Tampered'])
            ->assertNotFound();

        $this->actingAs($me, 'sanctum')
            ->deleteJson("/api/patients/{$theirPatient->id}")
            ->assertNotFound();

        $this->assertSame($originalName, $theirPatient->fresh()->first_name);
        $this->assertNull($theirPatient->fresh()->deleted_at);
    }

    #[Test]
    public function an_encounter_from_another_facility_cannot_be_consulted(): void
    {
        $mine = Facility::factory()->provisioned()->create();
        $theirs = Facility::factory()->provisioned()->create();

        $me = User::factory()->forFacility($mine)->role(Role::FacilityAdmin)->create();

        $theirPatient = Patient::factory()->forFacility($theirs)->create();
        $theirEncounter = Encounter::factory()->forPatient($theirPatient)->create();

        $this->actingAs($me, 'sanctum')
            ->getJson("/api/encounters/{$theirEncounter->id}")
            ->assertNotFound();

        $this->actingAs($me, 'sanctum')
            ->postJson("/api/encounters/{$theirEncounter->id}/consultation", [
                'clinical_notes' => 'Should never land.',
            ])
            ->assertNotFound();

        $this->assertSame(0, Consultation::query()->count());
    }

    #[Test]
    public function platform_staff_cannot_read_a_facilitys_patients_as_a_clinician(): void
    {
        $facility = Facility::factory()->create();
        Patient::factory()->forFacility($facility)->create();

        $support = User::factory()->platformStaff()->create();

        $this->assertFalse($support->canWork());
        $this->assertFalse($support->canPerform('patients.view', Module::Registration));
    }

    #[Test]
    public function a_suspended_facility_loses_access_to_its_own_data(): void
    {
        $facility = Facility::factory()->provisioned()->create();
        $clinician = User::factory()->forFacility($facility)->role(Role::Clinician)->create();
        Patient::factory()->forFacility($facility)->create();

        $this->assertTrue($clinician->canPerform('patients.view', Module::Registration));

        $facility->update(['status' => FacilityStatus::Suspended]);

        $this->assertFalse($clinician->fresh()->can('patients.view', Module::Registration));
        $this->assertFalse($facility->fresh()->hasModule(Module::Registration));
    }

    #[Test]
    public function a_module_from_another_edition_is_refused(): void
    {
        $dental = Facility::factory()->edition(Edition::DentalClinic)->provisioned()->create();

        $this->assertTrue($dental->hasModule(Module::Dental));
        // An eye facility's module must not appear in a dental facility.
        $this->assertFalse($dental->hasModule(Module::Eye));
        $this->assertFalse($dental->hasModule(Module::Ipd));
    }

    #[Test]
    public function run_using_restores_the_previous_facility(): void
    {
        $first = Facility::factory()->create();
        $second = Facility::factory()->create();

        $current = app(CurrentFacility::class);
        $this->asFacility($first);

        $current->runUsing($second, function () use ($current, $second): void {
            $this->assertSame($second->id, $current->id());
        });

        $this->assertSame($first->id, $current->id());
    }

    #[Test]
    public function run_using_restores_the_previous_facility_after_a_failure(): void
    {
        $first = Facility::factory()->create();
        $current = app(CurrentFacility::class);
        $this->asFacility($first);

        try {
            $current->runUsing(Facility::factory()->create(), function (): void {
                throw new \RuntimeException('boom');
            });
        } catch (\RuntimeException) {
            // expected
        }

        $this->assertSame($first->id, $current->id());
    }
}
