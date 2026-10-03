<?php

namespace Tests\Feature;

use App\Enums\RegistrationStatus;
use App\Models\FacilityRegistration;
use App\Notifications\FacilityRegistrationReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FacilityRegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'facility_name' => 'Mkwakwa Hospital',
            'facility_type' => 'hospital',
            'edition' => 'hospital',
            'licence_term' => '12-months',
            'contact_name' => 'Amina Juma',
            'contact_email' => 'amina@mkwakwa.test',
            'contact_phone' => '+255754000111',
            'username' => 'mkwakwa_admin',
            'password' => 'SuperSecret123',
            'password_confirmation' => 'SuperSecret123',
        ], $overrides);
    }

    #[Test]
    public function it_stores_a_registration_and_alerts_the_team_inbox(): void
    {
        Notification::fake();

        $this->postJson('/api/registrations', $this->payload())
            ->assertAccepted()
            ->assertJsonStructure(['message', 'reference']);

        $registration = FacilityRegistration::query()->sole();

        $this->assertSame('Mkwakwa Hospital', $registration->facility_name);
        $this->assertSame('hospital', $registration->edition);
        $this->assertSame(RegistrationStatus::Pending, $registration->status);
        $this->assertStringStartsWith('TBR-', $registration->reference);

        // The months come off the published term, so a hand-rolled post cannot
        // claim a year on a one-month term.
        $this->assertSame(12, $registration->months);

        Notification::assertSentOnDemand(
            FacilityRegistrationReceived::class,
            function (FacilityRegistrationReceived $notification, array $channels, AnonymousNotifiable $notifiable): bool {
                return $notifiable->routeNotificationFor('mail') === (string) config('tibadesk.enquiry_inbox')
                    && $notification->registration->username === 'mkwakwa_admin';
            },
        );
    }

    #[Test]
    public function it_stores_the_password_hashed_and_never_returns_it(): void
    {
        Notification::fake();

        $this->postJson('/api/registrations', $this->payload())
            ->assertAccepted()
            ->assertJsonMissingPath('password');

        $registration = FacilityRegistration::query()->sole();

        $this->assertNotSame('SuperSecret123', $registration->password);
        $this->assertTrue(Hash::check('SuperSecret123', $registration->password));
    }

    #[Test]
    public function it_refuses_an_edition_the_site_does_not_sell(): void
    {
        Notification::fake();

        $this->postJson('/api/registrations', $this->payload(['edition' => 'retail']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('edition');

        $this->assertSame(0, FacilityRegistration::query()->count());
    }

    #[Test]
    public function it_refuses_a_licence_term_the_catalogue_does_not_offer(): void
    {
        Notification::fake();

        $this->postJson('/api/registrations', $this->payload(['licence_term' => 'lifetime']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('licence_term');
    }

    #[Test]
    public function it_refuses_a_username_that_is_already_taken(): void
    {
        Notification::fake();

        FacilityRegistration::factory()->create(['username' => 'mkwakwa_admin']);

        $this->postJson('/api/registrations', $this->payload())
            ->assertStatus(422)
            ->assertJsonValidationErrors('username');

        $this->assertSame(1, FacilityRegistration::query()->count());
    }

    #[Test]
    public function it_requires_a_matching_password_confirmation(): void
    {
        Notification::fake();

        $this->postJson('/api/registrations', $this->payload(['password_confirmation' => 'SomethingElse123']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('password');

        $this->assertSame(0, FacilityRegistration::query()->count());
    }

    #[Test]
    public function it_stores_nothing_when_the_honeypot_is_filled(): void
    {
        Notification::fake();

        // Answered as though it worked, so the bot learns nothing, but the row
        // is never written and no mail goes out.
        $this->postJson('/api/registrations', $this->payload(['website' => 'http://spam.test']))
            ->assertAccepted()
            ->assertJsonPath('reference', null);

        $this->assertSame(0, FacilityRegistration::query()->count());

        Notification::assertNothingSent();
    }
}
