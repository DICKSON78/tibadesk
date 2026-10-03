<?php

namespace Tests\Feature;

use App\Enums\SubscriptionStatus;
use App\Models\SubscriptionOrder;
use App\Services\Licence\LicenceIssuer;
use App\Services\Payments\PaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class SubscriptionCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private const QUOTE_TOKEN = 'test-quote-token';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('tibadesk.quote_token', self::QUOTE_TOKEN);

        if (! is_file(config('tibadesk.licence.private_key_path'))) {
            Artisan::call('tibadesk:licence-key');
        }
    }

    /**
     * @return array<string, string>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'edition' => 'polyclinic',
            'licence_term' => '6-months',
            'customer_name' => 'Dr Dickson Kade',
            'email' => 'dickson@example.co.tz',
            'phone' => '+255700000000',
            'facility_name' => 'Mwanza Polyclinic',
        ], $overrides);
    }

    private function createOrder(array $overrides = []): SubscriptionOrder
    {
        $response = $this->postJson('/api/subscriptions', $this->payload($overrides));

        return SubscriptionOrder::query()->where('reference', $response->json('reference'))->firstOrFail();
    }

    /**
     * Record a quote the way the team would, through the internal endpoint.
     *
     * The amount is deliberately passed straight through rather than typed, so
     * a malformed value reaches validation exactly as a caller would send it.
     *
     * @param  array<string, mixed>  $overrides
     */
    private function quote(SubscriptionOrder $order, mixed $amount = 1_500_000, array $overrides = []): TestResponse
    {
        return $this->withHeader('Authorization', 'Bearer '.self::QUOTE_TOKEN)
            ->postJson("/api/internal/subscriptions/{$order->reference}/quote", array_merge([
                'amount' => $amount,
                'quoted_by' => 'KADETECH',
            ], $overrides));
    }

    public function test_a_visitor_can_start_a_subscription(): void
    {
        $response = $this->postJson('/api/subscriptions', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('status', SubscriptionStatus::AwaitingQuote->value)
            ->assertJsonPath('status_label', 'Awaiting quote')
            ->assertJsonPath('edition', 'polyclinic')
            ->assertJsonPath('licence_term', '6-months')
            ->assertJsonPath('licence_term_label', '6 months')
            ->assertJsonPath('licence_months', 6)
            ->assertJsonPath('checkout_url', null);

        $this->assertStringStartsWith('TBS-', $response->json('reference'));
        $this->assertStringContainsString('quote', $response->json('next_step'));
    }

    public function test_the_catalogue_publishes_no_amount_on_a_subscription(): void
    {
        $response = $this->postJson('/api/subscriptions', $this->payload());

        $response->assertCreated()
            ->assertJsonMissingPath('amount')
            ->assertJsonMissingPath('currency');

        $order = SubscriptionOrder::query()->where('reference', $response->json('reference'))->firstOrFail();

        $this->assertNull($order->amount, 'No amount may be set before the team quotes a price.');
    }

    public function test_a_client_cannot_inflate_the_licence_term(): void
    {
        $this->postJson('/api/subscriptions', $this->payload([
            'licence_term' => 'life-time',
            'licence_months' => 120,
        ]))->assertUnprocessable()->assertJsonValidationErrors('licence_term');

        $this->assertSame(0, SubscriptionOrder::query()->count());
    }

    public function test_it_rejects_an_unknown_edition(): void
    {
        $this->postJson('/api/subscriptions', $this->payload(['edition' => 'cardiology-suite']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('edition');
    }

    public function test_it_requires_contact_details(): void
    {
        $this->postJson('/api/subscriptions', ['edition' => 'polyclinic'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['customer_name', 'email', 'phone', 'facility_name']);
    }

    public function test_the_package_is_locked_until_payment_clears(): void
    {
        $order = $this->createOrder();

        $this->getJson("/api/subscriptions/{$order->reference}/download?artifact=licence")
            ->assertStatus(402);
    }

    public function test_recording_a_quote_stores_the_amount_and_opens_payment(): void
    {
        $order = $this->createOrder();

        $this->quote($order, 1_500_000, ['note' => 'Six months, includes training.'])
            ->assertOk()
            ->assertJsonPath('status', SubscriptionStatus::AwaitingPayment->value)
            ->assertJsonPath('amount', 1_500_000)
            ->assertJsonPath('currency', 'TZS')
            ->assertJsonPath('quoted_by', 'KADETECH')
            ->assertJsonPath('quote_note', 'Six months, includes training.');

        $order->refresh();

        $this->assertSame(1_500_000, $order->amount);
        $this->assertNotNull($order->quoted_at);
        $this->assertNotNull($order->checkout_url, 'A quoted order is the only one that can carry a payment link.');
    }

    public function test_the_public_view_never_reveals_a_quoted_amount(): void
    {
        $order = $this->createOrder();
        $this->quote($order);

        $this->getJson("/api/subscriptions/{$order->reference}")
            ->assertOk()
            ->assertJsonMissingPath('amount')
            ->assertJsonMissingPath('currency')
            ->assertJsonMissingPath('quoted_by')
            ->assertJsonMissingPath('customer_name')
            ->assertJsonMissingPath('email')
            ->assertJsonMissingPath('phone')
            ->assertJsonMissingPath('facility_name')
            ->assertJsonPath('checkout_url', $order->refresh()->checkout_url);
    }

    public function test_the_internal_endpoints_are_closed_without_a_quote_token(): void
    {
        $order = $this->createOrder();

        $this->getJson('/api/internal/subscriptions')->assertUnauthorized();
        $this->postJson("/api/internal/subscriptions/{$order->reference}/quote", ['amount' => 1_000])
            ->assertUnauthorized();

        $this->assertNull($order->refresh()->amount, 'A refused request must not record an amount.');
    }

    public function test_the_internal_endpoints_are_closed_when_no_token_is_configured(): void
    {
        config()->set('tibadesk.quote_token', null);

        $this->getJson('/api/internal/subscriptions')->assertStatus(503);
    }

    public function test_a_wrong_quote_token_is_refused(): void
    {
        $order = $this->createOrder();

        $this->withHeader('Authorization', 'Bearer not-the-token')
            ->postJson("/api/internal/subscriptions/{$order->reference}/quote", ['amount' => 1_000])
            ->assertUnauthorized();
    }

    public function test_the_internal_list_reports_the_enquiries_waiting_for_a_quote(): void
    {
        $order = $this->createOrder();
        $this->quote($order, 750_000);

        $this->withHeader('Authorization', 'Bearer '.self::QUOTE_TOKEN)
            ->getJson('/api/internal/subscriptions?status='.SubscriptionStatus::AwaitingQuote->value)
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->withHeader('Authorization', 'Bearer '.self::QUOTE_TOKEN)
            ->getJson('/api/internal/subscriptions')
            ->assertOk()
            ->assertJsonPath('data.0.reference', $order->reference)
            ->assertJsonPath('data.0.amount', 750_000)
            ->assertJsonPath('data.0.email', 'dickson@example.co.tz')
            ->assertJsonPath('data.0.facility_name', 'Mwanza Polyclinic');
    }

    /**
     * @return array<string, array{mixed, string}>
     */
    public static function unusableAmounts(): array
    {
        return [
            'missing' => [null, 'Enter the amount you are quoting.'],
            'zero' => [0, 'The amount must be at least 1 TZS.'],
            'negative' => [-500, 'The amount must be at least 1 TZS.'],
            'fractional' => ['12.50', 'The amount must be a whole number of TZS.'],
            'not a number' => ['free', 'The amount must be a whole number of TZS.'],
        ];
    }

    #[DataProvider('unusableAmounts')]
    public function test_a_quote_needs_a_sensible_amount(mixed $amount, string $expectedMessage): void
    {
        $order = $this->createOrder();

        $this->quote($order, $amount)
            ->assertStatus(422)
            ->assertJsonValidationErrors('amount')
            ->assertJsonFragment([$expectedMessage]);

        $this->assertNull($order->refresh()->amount);
    }

    public function test_a_quote_ignores_keys_the_customer_must_not_control(): void
    {
        $order = $this->createOrder();

        $this->quote($order, 1_000, [
            'status' => 'licence_issued',
            'paid_at' => '2020-01-01 00:00:00',
            'currency' => 'USD',
            'licence_months' => 120,
        ])->assertOk();

        $order->refresh();

        $this->assertSame(SubscriptionStatus::AwaitingPayment, $order->status);
        $this->assertNull($order->paid_at);
        $this->assertSame('TZS', $order->currency);
        $this->assertSame(6, $order->licence_months);
    }

    public function test_an_unquoted_subscription_cannot_be_marked_paid(): void
    {
        $order = $this->createOrder();

        $this->postJson('/api/clickpesa/callback', [
            'reference' => $order->reference,
            'status' => 'paid',
        ])->assertStatus(409);

        $this->postJson("/api/subscriptions/{$order->reference}/simulate-payment")->assertStatus(409);

        $this->assertSame(SubscriptionStatus::AwaitingQuote, $order->refresh()->status);
    }

    public function test_a_paid_subscription_cannot_be_requoted(): void
    {
        $order = $this->createOrder();
        $this->quote($order);
        $this->postJson("/api/subscriptions/{$order->reference}/simulate-payment")->assertOk();

        $this->quote($order, 99_000)
            ->assertStatus(409)
            ->assertJsonFragment(['This subscription has already been paid, so the quote is final.']);

        $this->assertSame(1_500_000, $order->refresh()->amount);
    }

    public function test_quoting_an_unknown_reference_is_not_found(): void
    {
        $this->withHeader('Authorization', 'Bearer '.self::QUOTE_TOKEN)
            ->postJson('/api/internal/subscriptions/TBS-DOESNOTEXIST/quote', ['amount' => 1_000])
            ->assertNotFound();
    }

    public function test_the_fake_driver_cannot_start_a_live_application(): void
    {
        $this->app['env'] = 'production';
        config()->set('clickpesa.driver', 'fake');
        $this->app->forgetInstance(PaymentGateway::class);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('fake');

        $this->app->make(PaymentGateway::class);
    }

    public function test_the_clickpesa_driver_requires_an_api_key(): void
    {
        config()->set('clickpesa.driver', 'clickpesa');
        config()->set('clickpesa.api_key', null);
        $this->app->forgetInstance(PaymentGateway::class);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('CLICKPESA_API_KEY');

        $this->app->make(PaymentGateway::class);
    }

    public function test_a_paid_notification_issues_a_licence_and_the_subscribed_term(): void
    {
        $order = $this->createOrder();
        $this->quote($order);

        $this->postJson('/api/clickpesa/callback', [
            'reference' => $order->reference,
            'payment_reference' => 'CP-12345',
            'status' => 'paid',
        ])->assertOk()->assertJsonPath('status', SubscriptionStatus::LicenceIssued->value);

        $order->refresh();

        $this->assertSame(SubscriptionStatus::LicenceIssued, $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertNotNull($order->licence_issued_at);
        $this->assertTrue($order->period_end->equalTo($order->period_start->copy()->addMonths(6)));
    }

    public function test_the_download_is_unlocked_and_the_checkout_url_is_withheld_after_payment(): void
    {
        $order = $this->createOrder();
        $this->quote($order);

        $this->postJson("/api/subscriptions/{$order->reference}/simulate-payment");

        $this->getJson("/api/subscriptions/{$order->reference}/download?artifact=licence")->assertOk();

        $this->getJson("/api/subscriptions/{$order->reference}")
            ->assertOk()
            ->assertJsonPath('checkout_url', null);
    }

    public function test_the_licence_is_signed_for_the_paying_customer_and_rejects_tampering(): void
    {
        $order = $this->createOrder(['edition' => 'dental-clinic']);
        $this->quote($order);
        $this->postJson("/api/subscriptions/{$order->reference}/simulate-payment");

        $this->get("/api/subscriptions/{$order->reference}/download?artifact=licence")->assertOk();

        $licence = json_decode(File::get(storage_path("app/private/licences/{$order->reference}.json")), true);

        $this->assertSame('ed25519', $licence['algorithm']);
        $this->assertSame('dental-clinic', $licence['payload']['edition']);
        $this->assertSame('Mwanza Polyclinic', $licence['payload']['licensed_to']['facility']);

        $publicKey = base64_decode(trim(File::get(config('tibadesk.licence.public_key_path'))));
        $signature = base64_decode($licence['signature']);

        $encoded = json_encode($licence['payload'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $this->assertTrue(
            sodium_crypto_sign_verify_detached($signature, $encoded, $publicKey),
            'The licence signature must verify with the published public key.'
        );

        $licence['payload']['edition'] = 'hospital';

        $this->assertFalse(
            sodium_crypto_sign_verify_detached(
                $signature,
                json_encode($licence['payload'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
                $publicKey,
            ),
            'A tampered licence must not verify.'
        );
    }

    public function test_a_failed_payment_keeps_the_downloads_locked(): void
    {
        $order = $this->createOrder();
        $this->quote($order);

        $this->postJson('/api/clickpesa/callback', [
            'reference' => $order->reference,
            'status' => 'failed',
        ])->assertOk()->assertJsonPath('status', SubscriptionStatus::Failed->value);

        $this->getJson("/api/subscriptions/{$order->reference}/download?artifact=licence")
            ->assertStatus(402);
    }

    public function test_the_installer_download_is_served_once_the_package_is_published(): void
    {
        $order = $this->createOrder();
        $this->quote($order);
        $this->postJson("/api/subscriptions/{$order->reference}/simulate-payment");

        $path = config("tibadesk.artifacts.package.{$order->edition}");
        File::ensureDirectoryExists(dirname($path));
        File::put($path, 'installer');

        try {
            $this->getJson("/api/subscriptions/{$order->reference}/download?artifact=package")
                ->assertOk();
        } finally {
            File::delete($path);
        }
    }

    public function test_an_unpublished_installer_download_says_so_rather_than_failing_obscurely(): void
    {
        $order = $this->createOrder();
        $this->quote($order);
        $this->postJson("/api/subscriptions/{$order->reference}/simulate-payment");

        $path = config("tibadesk.artifacts.package.{$order->edition}");
        File::delete($path);

        $this->getJson("/api/subscriptions/{$order->reference}/download?artifact=package")
            ->assertNotFound();
    }

    public function test_an_unknown_reference_is_not_found(): void
    {
        $this->getJson('/api/subscriptions/TBS-DOESNOTEXIST')->assertNotFound();
        $this->getJson('/api/subscriptions/TBS-DOESNOTEXIST/download?artifact=licence')->assertNotFound();
    }

    public function test_a_callback_without_a_reference_is_rejected(): void
    {
        $this->postJson('/api/clickpesa/callback', ['status' => 'paid'])->assertStatus(422);
    }

    public function test_the_published_licence_carries_the_edition_limits(): void
    {
        $order = $this->createOrder(['edition' => 'hospital']);
        $issuer = app(LicenceIssuer::class);

        $payload = $issuer->payloadFor($order);

        $this->assertSame('hospital', $payload['edition']);
        $this->assertSame('Hospital Management', $payload['edition_name']);
        $this->assertSame('50+', $payload['limits']['users']);
    }
}
