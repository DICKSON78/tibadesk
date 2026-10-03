<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\FacilityStatus;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * What a lapsed licence actually stops.
 *
 * Charging per licence only means something if the licence is enforced, and the
 * date alone does not enforce anything. These cover the line that is drawn: a
 * facility that has stopped paying keeps every record it has and keeps reading
 * them, and loses the ability to add new ones.
 *
 * The read side is the half that is easy to get wrong. A clinic is a place where
 * people are treated, and the person treating them has to be able to open a
 * chart whatever the state of the invoice.
 */
class LicenceEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;

    private User $receptionist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->facility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $this->receptionist = User::factory()->forFacility($this->facility)->role(Role::Receptionist)->create();
    }

    /**
     * Sign the receptionist in as a freshly loaded account.
     *
     * actingAs() reuses one User instance across calls in a test, and
     * ResolveFacility caches that instance's facility relation on the first
     * request. Handing the same instance to a second request would keep
     * serving the date loaded then. Real requests do not behave this way, so
     * the account is re-read to match what the browser would actually send.
     */
    private function asReceptionist(): self
    {
        $this->receptionist = $this->receptionist->fresh();

        return $this->actingAs($this->receptionist, 'sanctum');
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function patientPayload(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Amina',
            'last_name' => 'Mzee',
            'date_of_birth' => '1994-03-11',
            'gender' => 'female',
        ], $overrides);
    }

    private function lapseLicence(): void
    {
        $this->facility->forceFill(['licence_expires_at' => now()->subDay()])->save();
    }

    #[Test]
    public function a_licence_inside_its_term_writes_normally(): void
    {
        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', $this->patientPayload());

        $response->assertCreated();
    }

    #[Test]
    public function a_lapsed_licence_refuses_new_records(): void
    {
        $this->lapseLicence();

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', $this->patientPayload());

        // 402 rather than 403: the account is valid and the permission is real,
        // what has run out is the term it was granted under.
        $response->assertStatus(402);
        $response->assertJsonPath('message', fn (string $message) => str_contains($message, 'licence has expired'));
    }

    #[Test]
    public function a_lapsed_licence_still_reads_patient_records(): void
    {
        $patient = Patient::factory()->forFacility($this->facility)->create();

        $this->lapseLicence();

        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson("/api/patients/{$patient->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $patient->id);
    }

    #[Test]
    public function a_lapsed_licence_still_lists_and_searches_its_patients(): void
    {
        Patient::factory()->forFacility($this->facility)->create(['first_name' => 'Regina']);

        $this->lapseLicence();

        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson('/api/patients')
            ->assertOk()
            ->assertJsonPath('data.0.first_name', 'Regina');
    }

    #[Test]
    public function renewing_restores_writing_with_no_reactivation_step(): void
    {
        $this->lapseLicence();

        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', $this->patientPayload())
            ->assertStatus(402);

        // The only thing that changes is the date the licence was sold to. No
        // status to flip and no job to run, so a paying customer cannot be left
        // locked out by a nightly task that failed.
        $this->facility->forceFill(['licence_expires_at' => now()->addMonths(12)])->save();

        $this->asReceptionist()
            ->postJson('/api/patients', $this->patientPayload())
            ->assertCreated();
    }

    #[Test]
    public function a_facility_without_a_licence_term_is_not_refused(): void
    {
        // A facility provisioned with no term is not this method's business to
        // refuse; expiry is a commercial decision, and absence of a date is not
        // evidence of one.
        $this->facility->forceFill(['licence_expires_at' => null])->save();

        $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/patients', $this->patientPayload())
            ->assertCreated();
    }

    #[Test]
    public function one_facility_lapsing_does_not_affect_another(): void
    {
        $other = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $otherReceptionist = User::factory()->forFacility($other)->role(Role::Receptionist)->create();

        $this->lapseLicence();

        $this->actingAs($otherReceptionist, 'sanctum')
            ->postJson('/api/patients', $this->patientPayload())
            ->assertCreated();
    }

    #[Test]
    public function a_lapsed_facility_keeps_its_reads_to_its_own_patients_only(): void
    {
        $mine = Patient::factory()->forFacility($this->facility)->create();

        $theirs = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $notMine = Patient::factory()->forFacility($theirs)->create();

        $this->lapseLicence();

        // Read-only is not a way round the tenant boundary. Losing the ability
        // to write must not have widened what can be read.
        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson("/api/patients/{$notMine->id}")
            ->assertNotFound();

        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson("/api/patients/{$mine->id}")
            ->assertOk();
    }

    #[Test]
    public function a_suspended_facility_is_still_shut_out_entirely(): void
    {
        // Suspension is the deliberate decision to stop a facility, and it keeps
        // working as one: reads included, not just writes. The read-only
        // behaviour belongs to a lapsed licence, not to every unhappy customer.
        $this->facility->forceFill([
            'status' => FacilityStatus::Suspended,
            'licence_expires_at' => now()->addMonths(12),
        ])->save();

        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson('/api/patients')
            ->assertForbidden();
    }

    #[Test]
    public function the_lapsed_state_is_visible_to_the_facility_itself(): void
    {
        $this->lapseLicence();

        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.facility.read_only', true);
    }

    #[Test]
    public function a_current_licence_is_not_reported_as_read_only(): void
    {
        $this->actingAs($this->receptionist, 'sanctum')
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.facility.read_only', false);
    }
}
