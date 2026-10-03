<?php

namespace Tests\Feature;

use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Facilities come into existence through TibaDesk, not through this application.
 *
 * The endpoint being defended is POST /api/register. Before it was closed it
 * accepted a role of "owner", defaulted to that role when none was sent, and on
 * an owner created a pharmacy row with a subscription attached. That let anyone
 * who could reach the API mint a facility and a plan that KADETECH never sold,
 * and it did so on an unauthenticated route that also answers on the package's
 * own port.
 *
 * These tests pin the closed behaviour and the two ways around it: naming the
 * role outright, and leaving it out to fall through to a default.
 */
class FacilityRegistrationIsClosedTest extends TestCase
{
    use RefreshDatabase;

    private function ownerPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Amani Pharmacy',
            'email' => 'owner@example.test',
            'phone' => '+255700000000',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
            'country' => 'Tanzania',
            'region' => 'Dar es Salaam',
            'district' => 'Ilala',
            'subscription_plan_id' => 1,
            'pharmacy_name' => 'Amani Pharmacy',
        ], $overrides);
    }

    #[Test]
    public function it_refuses_to_register_a_pharmacy_owner(): void
    {
        $response = $this->postJson('/api/register', $this->ownerPayload(['role' => 'owner']));

        $response->assertForbidden();
        $response->assertJsonPath('message', 'Facilities register through TibaDesk, not from here. Please create your TibaDesk account and select your package there.');

        $this->assertSame(0, User::query()->count(), 'a refused registration must not create a user');
        $this->assertSame(0, Pharmacy::query()->count(), 'a refused registration must not create a pharmacy');
    }

    #[Test]
    public function it_refuses_to_register_a_pharmacy_owner_nested_under_the_list_form(): void
    {
        // The pharmacy dashboard's owner form posts this shape, with the
        // pharmacy details inside a "pharmacies" array rather than at the top
        // level, so closing only the flat form would have left the real caller
        // working.
        $response = $this->postJson('/api/register', $this->ownerPayload([
            'role' => 'owner',
            'pharmacies' => [[
                'pharmacy_name' => 'Amani Pharmacy',
                'region' => 'Dar es Salaam',
                'district' => 'Ilala',
            ]],
        ]));

        $response->assertForbidden();
        $this->assertSame(0, Pharmacy::query()->count());
    }

    #[Test]
    public function it_will_not_default_a_missing_role_to_an_owner(): void
    {
        // The original rule was "sometimes", and the created user's role fell
        // back to 'owner' when the field was absent. Omitting the role therefore
        // reached the owner branch just as surely as asking for it.
        $response = $this->postJson('/api/register', $this->ownerPayload());

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('role');

        $this->assertSame(0, User::query()->count());
        $this->assertSame(0, Pharmacy::query()->count());
    }

    #[Test]
    public function it_still_refuses_an_owner_role_written_differently(): void
    {
        // Validation rules are case-sensitive, so a role of "Owner" would slip
        // past the guard above and then past "in:pharmacist,cashier,delivery,
        // customer" too if that check were ever loosened to a lookup.
        $response = $this->postJson('/api/register', $this->ownerPayload(['role' => 'Owner']));

        $response->assertStatus(422);
        $this->assertSame(0, User::query()->count());
        $this->assertSame(0, Pharmacy::query()->count());
    }
}
