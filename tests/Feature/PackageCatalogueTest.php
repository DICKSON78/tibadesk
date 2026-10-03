<?php

namespace Tests\Feature;

use App\Enums\SubscriptionStatus;
use App\Models\SubscriptionOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackageCatalogueTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_publishes_every_edition_with_its_modules_but_no_price(): void
    {
        $response = $this->getJson('/api/packages');

        $response->assertOk();

        $editions = $response->json('editions');

        $this->assertSame(
            ['dental-clinic', 'eye-clinic', 'pharmacy', 'polyclinic', 'hospital'],
            array_column($editions, 'key')
        );

        foreach ($editions as $edition) {
            $this->assertArrayNotHasKey('price', $edition, "{$edition['key']} must not be priced");
            $this->assertArrayNotHasKey('amount', $edition, "{$edition['key']} must not be priced");
            $this->assertNotEmpty($edition['modules'], "{$edition['key']} must list modules");
            $this->assertNotEmpty($edition['module_keys'], "{$edition['key']} must list module keys");
        }
    }

    public function test_it_never_publishes_a_monetary_figure_anywhere_in_the_catalogue(): void
    {
        $response = $this->getJson('/api/packages')->assertOk();
        $body = $response->getContent();

        // No currency is named, and no grouped figure is offered.
        foreach (['TZS', 'Tsh', 'Shilling'] as $currency) {
            $this->assertStringNotContainsStringIgnoringCase(
                $currency,
                $body,
                "The catalogue must not name a currency: \"{$currency}\""
            );
        }

        $this->assertDoesNotMatchRegularExpression(
            '/\b\d{1,3}(,\d{3})+\b/',
            $body,
            'The catalogue must not contain a grouped monetary figure.'
        );

        // No money-bearing key exists anywhere in the payload, at any depth.
        $this->assertSame([], $this->moneyKeys(json_decode($body, true)));
    }

    /**
     * Every key in the payload whose name suggests a monetary value.
     *
     * @param  array<mixed>  $node
     * @return array<int, string>
     */
    private function moneyKeys(array $node, string $path = ''): array
    {
        $found = [];

        foreach ($node as $key => $value) {
            $where = $path === '' ? (string) $key : "{$path}.{$key}";

            if (preg_match('/price|amount|cost|fee|rate|total/i', (string) $key)) {
                $found[] = $where;
            }

            if (is_array($value)) {
                $found = [...$found, ...$this->moneyKeys($value, $where)];
            }
        }

        return $found;
    }

    public function test_every_edition_includes_pharmacy_and_laboratory(): void
    {
        $editions = $this->getJson('/api/packages')->json('editions');

        // The standalone 'pharmacy' edition is a dispensary-only package; it intentionally
        // omits laboratory. All other editions must include both pharmacy and laboratory.
        $clinicalEditions = array_filter($editions, fn ($e) => $e['key'] !== 'pharmacy');

        foreach ($clinicalEditions as $edition) {
            $this->assertContains('pharmacy', $edition['module_keys'], "{$edition['key']} must include pharmacy");
            $this->assertContains('laboratory', $edition['module_keys'], "{$edition['key']} must include laboratory");
        }

        // The pharmacy edition itself must include the pharmacy module.
        $pharmacyEdition = collect($editions)->firstWhere('key', 'pharmacy');
        $this->assertNotNull($pharmacyEdition, 'pharmacy edition must be present in the catalogue');
        $this->assertContains('pharmacy', $pharmacyEdition['module_keys'], 'pharmacy edition must include pharmacy module');
    }

    public function test_it_publishes_the_three_licence_terms(): void
    {
        $terms = $this->getJson('/api/packages')->json('licence_terms');

        $this->assertSame([3, 6, 12], array_column($terms, 'months'));
        $this->assertSame(['3-months', '6-months', '12-months'], array_column($terms, 'key'));
    }

    public function test_the_specialty_packages_carry_their_specialty_module(): void
    {
        $editions = $this->getJson('/api/packages')->json('editions');

        $keys = collect($editions)->keyBy('key');

        $this->assertContains('dental', $keys['dental-clinic']['module_keys']);
        $this->assertContains('eye', $keys['eye-clinic']['module_keys']);
        $this->assertContains('polyclinic', $keys['polyclinic']['module_keys']);
        $this->assertContains('ipd', $keys['hospital']['module_keys']);
    }

    public function test_the_all_modules_option_routes_to_an_enquiry(): void
    {
        $allModules = $this->getJson('/api/packages')->json('all_modules');

        $this->assertSame('enquire', $allModules['action']);
        $this->assertNotEmpty($allModules['modules']);
    }

    public function test_it_lists_the_modules_shared_by_every_edition(): void
    {
        $shared = $this->getJson('/api/packages')->json('shared_modules');

        $this->assertNotEmpty($shared);
        $this->assertContains('registration', array_column($shared, 'key'));
    }

    public function test_it_publishes_the_on_premise_deployment_and_nfr_commitments(): void
    {
        $response = $this->getJson('/api/packages');

        $this->assertTrue($response->json('on_premise'));
        $this->assertNotEmpty($response->json('deployment'));
        $this->assertNotEmpty($response->json('non_functional'));
    }

    public function test_a_facility_can_subscribe_on_a_three_month_term(): void
    {
        $response = $this->postJson('/api/subscriptions', [
            'edition' => 'dental-clinic',
            'licence_term' => '3-months',
            'customer_name' => 'Amani Dental',
            'email' => 'owner@example.test',
            'phone' => '+255700000000',
            'facility_name' => 'Amani Dental Centre',
        ]);

        $response->assertCreated();

        $order = SubscriptionOrder::query()->where('reference', $response->json('reference'))->firstOrFail();

        $this->assertSame('3-months', $order->licence_term);
        $this->assertSame(3, $order->licence_months);
        $this->assertSame(SubscriptionStatus::AwaitingQuote, $order->status);
    }

    public function test_a_facility_can_subscribe_on_a_twelve_month_term(): void
    {
        $response = $this->postJson('/api/subscriptions', [
            'edition' => 'hospital',
            'licence_term' => '12-months',
            'customer_name' => 'Amani Hospital',
            'email' => 'owner@example.test',
            'phone' => '+255700000000',
            'facility_name' => 'Amani Hospital',
        ]);

        $response->assertCreated();
        $this->assertSame(12, $response->json('licence_months'));
        $this->assertSame('1 year', $response->json('licence_term_label'));
    }

    public function test_it_rejects_an_unknown_licence_term(): void
    {
        $this->postJson('/api/subscriptions', [
            'edition' => 'polyclinic',
            'licence_term' => '18-months',
            'customer_name' => 'Amani Clinic',
            'email' => 'owner@example.test',
            'phone' => '+255700000000',
            'facility_name' => 'Amani Clinic',
        ])->assertUnprocessable()->assertJsonValidationErrors('licence_term');
    }

    public function test_it_rejects_a_subscription_with_no_term(): void
    {
        $this->postJson('/api/subscriptions', [
            'edition' => 'polyclinic',
            'customer_name' => 'Amani Clinic',
            'email' => 'owner@example.test',
            'phone' => '+255700000000',
            'facility_name' => 'Amani Clinic',
        ])->assertUnprocessable()->assertJsonValidationErrors('licence_term');
    }
}
