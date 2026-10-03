<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\Module;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Opening a trial without anybody approving it.
 *
 * This is the first route in the system that a stranger can use to write a
 * tenant, so the tests are as much about what it refuses as about what it
 * builds. A trial that can be opened twice for one address, or opened for an
 * edition that is not finished, or opened a hundred times from one machine, is
 * a way to make rubbish and is worse than not offering trials at all.
 */
class TrialSignupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('5,1');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'facility_name' => 'Mkwakwa Dental Centre',
            'edition' => Edition::DentalClinic->value,
            'owner_name' => 'Amina Mzee',
            'owner_email' => 'amina@example.test',
            'password' => 'ClinicPass2026',
            'owner_phone' => '+255754000111',
        ], $overrides);
    }

    #[Test]
    public function the_catalogue_publishes_every_edition_and_what_is_in_it(): void
    {
        $response = $this->getJson('/api/catalogue');

        $response->assertOk()
            ->assertJsonPath('trial.enabled', true)
            ->assertJsonPath('trial.days', 14);

        $editions = collect($response->json('editions'))->keyBy('key');

        $this->assertCount(count(Edition::cases()), $editions);
        $this->assertSame('Dental Clinic', $editions['dental-clinic']['name']);

        // The modules named must be the ones the running system would actually
        // grant, or the catalogue is advertising something that does not work.
        $this->assertContains('dental', array_column($editions['dental-clinic']['modules'], 'key'));
        $this->assertNotContains('eye', array_column($editions['dental-clinic']['modules'], 'key'));
    }

    #[Test]
    public function the_catalogue_marks_which_editions_can_be_tried(): void
    {
        $editions = collect($this->getJson('/api/catalogue')->json('editions'))->keyBy('key');

        $this->assertTrue($editions['dental-clinic']['triallable']);
        $this->assertTrue($editions['hospital']['triallable']);
    }

    #[Test]
    public function a_visitor_can_open_a_trial_and_sign_in_with_it(): void
    {
        $response = $this->postJson('/api/trials', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('account.email', 'amina@example.test')
            ->assertJsonPath('trial.facility', 'Mkwakwa Dental Centre')
            ->assertJsonPath('trial.edition', 'Dental Clinic');

        // The whole point: they are in, now, with no approval step.
        $this->postJson('/api/auth/login', [
            'email' => 'amina@example.test',
            'password' => 'ClinicPass2026',
        ])->assertOk();
    }

    #[Test]
    public function a_trial_is_a_real_facility_with_the_editions_modules_granted(): void
    {
        $this->postJson('/api/trials', $this->payload())->assertCreated();

        $facility = Facility::query()->sole();

        $this->assertSame(Edition::DentalClinic, $facility->edition);
        $this->assertSame('trial', $facility->licence_term);
        $this->assertSame(
            array_map(fn (Module $m) => $m->value, $facility->modules()),
            array_map(fn (Module $m) => $m->value, Edition::DentalClinic->modules()),
        );

        $owner = $facility->users()->sole();
        $this->assertSame(Role::FacilityAdmin, $owner->role);
        $this->assertTrue($owner->is_active);
    }

    #[Test]
    public function a_trial_lasts_the_advertised_number_of_days(): void
    {
        $this->travelTo(now()->startOfDay());
        $this->postJson('/api/trials', $this->payload())->assertCreated();

        $facility = Facility::query()->sole();

        $this->assertSame(14, $facility->licence_term === 'trial' ? config('tibadesk.trial.days') : -1);
        $this->assertTrue($facility->licence_expires_at->is(now()->addDays(14)->startOfDay()));
    }

    #[Test]
    public function a_trial_expires_into_read_only_without_anyone_doing_anything(): void
    {
        $this->postJson('/api/trials', $this->payload())->assertCreated();

        $email = 'amina@example.test';

        // The trial is over, and nothing was switched off, no status was flipped
        // and no job ran: the licence simply reached its date.
        $this->travel(15)->days();

        $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'ClinicPass2026',
        ])->assertOk()
            ->assertJsonPath('user.facility.read_only', true);
    }

    #[Test]
    public function an_expired_trial_can_still_read_but_not_register_a_patient(): void
    {
        $this->postJson('/api/trials', $this->payload())->assertCreated();
        $this->travel(15)->days();

        $token = $this->postJson('/api/auth/login', [
            'email' => 'amina@example.test',
            'password' => 'ClinicPass2026',
        ])->json('token');

        $this->withToken($token)
            ->postJson('/api/patients', ['first_name' => 'Refused'])
            ->assertStatus(402);
    }

    #[Test]
    public function an_email_can_only_be_tried_once(): void
    {
        $this->postJson('/api/trials', $this->payload())->assertCreated();

        // The same person coming back to try again, under any facility name.
        $this->postJson('/api/trials', $this->payload([
            'facility_name' => 'A Second Attempt',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors('owner_email');

        $this->assertSame(1, Facility::query()->count());
    }

    #[Test]
    public function an_email_already_used_by_a_paid_customer_cannot_be_tried(): void
    {
        $existing = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        User::factory()->forFacility($existing)->role(Role::FacilityAdmin)->create([
            'email' => 'amina@example.test',
        ]);

        $this->postJson('/api/trials', $this->payload())->assertStatus(422)
            ->assertJsonValidationErrors('owner_email');
    }

    #[Test]
    public function an_edition_that_is_not_offered_for_trial_is_refused(): void
    {
        config(['tibadesk.trial.editions' => ['hospital']]);

        $this->postJson('/api/trials', $this->payload([
            'edition' => Edition::EyeClinic->value,
        ]))->assertStatus(422)
            ->assertJsonValidationErrors('edition');

        $this->assertSame(0, Facility::query()->count());
    }

    #[Test]
    public function an_unknown_edition_is_refused(): void
    {
        $this->postJson('/api/trials', $this->payload(['edition' => 'vip-enterprise']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('edition');
    }

    #[Test]
    public function a_weak_password_is_refused(): void
    {
        $this->postJson('/api/trials', $this->payload(['password' => 'password']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    #[Test]
    public function the_response_never_echoes_the_password(): void
    {
        $body = $this->postJson('/api/trials', $this->payload())->assertCreated()->getContent();

        $this->assertStringNotContainsString('ClinicPass2026', (string) $body);
    }

    #[Test]
    public function repeated_attempts_from_one_address_are_throttled(): void
    {
        // The unique-email rule stops one address opening many trials, but not
        // one machine working through a list of throwaway addresses. That is the
        // route throttle's job.
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/trials', $this->payload([
                'owner_email' => "trial{$i}@example.test",
            ]));
        }

        $this->postJson('/api/trials', $this->payload([
            'owner_email' => 'trial5@example.test',
        ]))->assertStatus(429);
    }

    #[Test]
    public function no_trial_is_opened_when_trials_are_switched_off(): void
    {
        config(['tibadesk.trial.enabled' => false]);

        $this->postJson('/api/trials', $this->payload())->assertStatus(503);
        $this->assertSame(0, Facility::query()->count());

        // And the catalogue says so rather than advertising something that
        // cannot be started.
        $this->getJson('/api/catalogue')
            ->assertOk()
            ->assertJsonPath('trial.enabled', false);

        $this->assertSame(
            [false],
            array_values(array_unique(array_column($this->getJson('/api/catalogue')->json('editions'), 'triallable'))),
        );
    }
}
