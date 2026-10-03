<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Notifications\ContactMessageReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ContactMessageTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Amani Dental',
            'email' => 'owner@amani.test',
            'phone' => '+255700000000',
            'facility' => 'Amani Dental Centre',
            'message' => 'Please quote us for the dental clinic edition.',
        ], $overrides);
    }

    #[Test]
    public function it_stores_an_enquiry_and_alerts_the_team_inbox(): void
    {
        Notification::fake();

        $this->postJson('/api/contact', $this->payload())
            ->assertAccepted()
            ->assertJsonPath('message', 'We have your message and will reply within one business day.');

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Amani Dental',
            'email' => 'owner@amani.test',
            'phone' => '+255700000000',
            'facility' => 'Amani Dental Centre',
        ]);

        Notification::assertSentOnDemand(
            ContactMessageReceived::class,
            function (ContactMessageReceived $notification, array $channels, AnonymousNotifiable $notifiable): bool {
                return $notifiable->routeNotificationFor('mail') === (string) config('tibadesk.enquiry_inbox');
            },
        );
    }

    #[Test]
    public function the_facility_is_optional(): void
    {
        Notification::fake();

        $this->postJson('/api/contact', $this->payload(['facility' => null]))
            ->assertAccepted();

        $this->assertDatabaseHas('contact_messages', ['facility' => null]);
    }

    #[Test]
    public function it_requires_the_core_contact_details(): void
    {
        Notification::fake();

        $this->postJson('/api/contact', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'phone', 'message']);

        $this->assertSame(0, ContactMessage::count());
        Notification::assertNothingSent();
    }

    #[Test]
    public function it_rejects_a_malformed_email_address(): void
    {
        Notification::fake();

        $this->postJson('/api/contact', $this->payload(['email' => 'not-an-address']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertSame(0, ContactMessage::count());
    }

    #[Test]
    public function a_honeypot_submission_is_absorbed_without_being_stored(): void
    {
        Notification::fake();

        $this->postJson('/api/contact', $this->payload(['website' => 'https://spam.example']))
            ->assertAccepted();

        $this->assertSame(0, ContactMessage::count());
        Notification::assertNothingSent();
    }

    #[Test]
    public function the_enquiry_survives_an_unreachable_mailbox(): void
    {
        Notification::fake(fn () => throw new \RuntimeException('SMTP unavailable'));

        $this->postJson('/api/contact', $this->payload())->assertAccepted();

        $this->assertSame(1, ContactMessage::count());
    }

    #[Test]
    public function the_notification_carries_the_enquiry_and_replies_to_the_sender(): void
    {
        $message = ContactMessage::create($this->payload());

        $mail = (new ContactMessageReceived($message))->toMail(new class {});

        $this->assertSame('New TibaDesk enquiry from Amani Dental', $mail->subject);
        $this->assertSame([['owner@amani.test', 'Amani Dental']], $mail->replyTo);
        $this->assertStringContainsString('Amani Dental Centre', implode("\n", $mail->introLines));
    }
}
