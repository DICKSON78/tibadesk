<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The trial page itself: the screen a visitor actually arrives on.
 *
 * The API test covers opening a trial; this covers the part a person touches.
 * The two matter separately because a working endpoint behind a page nobody can
 * fill in is not self-service.
 */
class TrialPageTest extends TestCase
{
    use RefreshDatabase;

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
        ], $overrides);
    }

    #[Test]
    public function the_page_offers_the_editions_that_can_be_tried(): void
    {
        $this->get('/start-trial')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/StartTrial')
                ->where('trial.days', 14)
                ->where('trial.password_min_length', 10)
                ->has('editions', count(Edition::cases()))
                ->where('editions.0.key', Edition::DentalClinic->value)
                // The modules named on the page have to be the ones the edition
                // actually grants, or the page advertises something the system
                // will refuse.
                ->where('editions.0.modules', fn ($modules) => collect($modules)->contains('key', 'dental'))
                ->where('editions.0.modules', fn ($modules) => collect($modules)->contains('key', 'pharmacy'))
                ->where('editions.0.modules', fn ($modules) => ! collect($modules)->contains('key', 'eye'))
            );
    }

    #[Test]
    public function the_page_does_not_offer_an_edition_that_cannot_be_tried(): void
    {
        config(['tibadesk.trial.editions' => ['hospital']]);

        $this->get('/start-trial')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('editions', 1)
                ->where('editions.0.key', 'hospital')
            );
    }

    #[Test]
    public function the_page_is_closed_when_trials_are_switched_off(): void
    {
        config(['tibadesk.trial.enabled' => false]);

        $this->get('/start-trial')->assertNotFound();
    }

    #[Test]
    public function a_signed_in_user_is_sent_to_the_dashboard_instead(): void
    {
        $facility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $admin = User::factory()->forFacility($facility)->create();

        $this->actingAs($admin)->get('/start-trial')->assertRedirect(route('dashboard'));
    }

    #[Test]
    public function submitting_the_form_opens_the_trial_and_sends_them_to_sign_in(): void
    {
        $this->post('/start-trial', $this->payload())
            ->assertRedirect(route('login'))
            ->assertSessionHas('success');

        $this->assertSame(1, Facility::query()->count());

        // The message has to name the account, because they chose a password a
        // moment ago and should not have to check their email to find out what
        // to sign in with.
        $this->assertStringContainsString('amina@example.test', (string) session('success'));
    }

    #[Test]
    public function a_signed_in_owner_can_reach_their_own_trial_system(): void
    {
        $this->post('/start-trial', $this->payload());

        $this->post('/tibadesk/login', [
            'email' => 'amina@example.test',
            'password' => 'ClinicPass2026',
        ])->assertRedirect(route('dashboard'));

        $this->get('/tibadesk')->assertOk();
    }

    #[Test]
    public function a_bad_submission_comes_back_with_the_details_kept_but_not_the_password(): void
    {
        $this->from('/start-trial')
            ->post('/start-trial', $this->payload(['password' => 'short']))
            ->assertRedirect('/start-trial')
            ->assertSessionHasErrors('password');

        $this->assertSame('amina@example.test', old('owner_email'));
        $this->assertNull(old('password'));
        $this->assertSame(0, Facility::query()->count());
    }

    #[Test]
    public function a_second_trial_for_the_same_address_is_refused_without_an_error_page(): void
    {
        $this->post('/start-trial', $this->payload());

        $this->post('/start-trial', $this->payload(['facility_name' => 'Another One']))
            ->assertSessionHasErrors('owner_email');

        $this->assertSame(1, Facility::query()->count());
    }
}
