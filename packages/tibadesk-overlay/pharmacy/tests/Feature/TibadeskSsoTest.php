<?php

namespace Tests\Feature;

use App\Models\Pharmacy;
use App\Models\User;
use App\Support\TibadeskSso\SsoAssertion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Signing in to the pharmacy through TibaDesk.
 *
 * The thing being defended is that an account arriving from TibaDesk is a
 * working member of this pharmacy, not merely a row in the users table. Those
 * are two different facts and only one of them is obvious: the selected
 * pharmacy is a column on the user, while membership is a row in the pivot
 * that every scoped screen asks about. An account can hold the first, sign in
 * successfully, and be refused by everything behind the scope — which is what
 * happened, and looked from inside the application like a package that simply
 * refused to load anything.
 */
class TibadeskSsoTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'test-assertion-secret';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'tibadesk_sso.secret' => self::SECRET,
            'tibadesk_sso.audience' => 'pharmacy',
        ]);
    }

    private function pharmacy(): Pharmacy
    {
        // The pharmacies table requires an owner, so a test that only cares
        // about TibaDesk arrivals still has to stand one up. It is deliberately
        // a different person from the arrivals, so a test cannot pass because
        // the two accounts got confused.
        $owner = User::create([
            'name' => 'Local Owner',
            'email' => 'owner@example.test',
            'phone' => '0700000001',
            'role' => 'owner',
            'user_code' => User::generateUserCode(),
            'is_active' => true,
            'is_verified' => true,
            'password' => Hash::make('password'),
        ]);

        $pharmacy = Pharmacy::create([
            'owner_id' => $owner->id,
            'pharmacy_name' => 'TibaDesk Pharmacy',
            'pharmacy_code' => 'TBD-001',
            'status' => 'active',
            'application_status' => 'approved',
            'payment_status' => 'paid',
            'subscription_end_date' => now()->addYear(),
        ]);

        $owner->pharmacy()->syncWithoutDetaching([$pharmacy->id]);

        return $pharmacy;
    }

    /**
     * A correctly signed assertion, built the way the ERP builds one.
     *
     * @return array{assertion: string, payload: array<string, mixed>}
     */
    private function assertion(int $tibadeskId, string $email, string $role = 'facility_admin'): array
    {
        $payload = [
            'sub' => (string) $tibadeskId,
            'email' => $email,
            'name' => 'Demo Admin',
            'role' => $role,
            'aud' => 'pharmacy',
            'iat' => now()->timestamp,
            'exp' => now()->addMinutes(5)->timestamp,
        ];

        ksort($payload);

        return [
            'assertion' => base64_encode(hash_hmac(
                'sha256',
                (string) json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                self::SECRET,
                true,
            )),
            'payload' => $payload,
        ];
    }

    private function signIn(int $tibadeskId, string $email, string $role = 'facility_admin'): array
    {
        $body = $this->assertion($tibadeskId, $email, $role);

        return (array) $this->postJson('/api/auth/sso', $body)->json();
    }

    #[Test]
    public function a_first_arrival_is_provisioned_and_given_a_session(): void
    {
        $this->pharmacy();

        $response = $this->assertion(7, 'demo@tibadesk.test');

        $this->postJson('/api/auth/sso', $response)
            ->assertOk()
            ->assertJsonStructure(['token']);

        $user = User::where('tibadesk_id', '7')->sole();

        $this->assertSame('demo@tibadesk.test', $user->email);
        $this->assertTrue($user->is_verified);
    }

    /**
     * The whole point of the fix. Membership is what the pharmacy scope reads,
     * so an account without it can sign in and then be refused everywhere.
     */
    #[Test]
    public function a_provisioned_user_belongs_to_the_pharmacy(): void
    {
        $pharmacy = $this->pharmacy();

        $this->assertion(7, 'demo@tibadesk.test');
        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();

        $this->assertSame($pharmacy->id, $user->current_pharmacy_id);
        $this->assertTrue(
            $user->pharmacy()->where('pharmacies.id', $pharmacy->id)->exists(),
            'A user signed in through TibaDesk has no membership of the pharmacy they were placed in.',
        );
    }

    /**
     * A TibaDesk facility_admin owns the facility, so they arrive as this
     * pharmacy's owner. The owner role is what the stock, pricing, staff,
     * payroll and reporting screens hang off, so mapping them down to
     * pharmacist would quietly hide the whole owner experience.
     */
    #[Test]
    public function a_facility_arrives_as_the_pharmacy_owner(): void
    {
        $this->pharmacy();

        $this->signIn(7, 'demo@tibadesk.test', 'facility_admin');

        $this->assertSame('owner', User::where('tibadesk_id', '7')->sole()->role);
    }

    #[Test]
    public function a_tibadesk_pharmacist_arrives_as_a_pharmacist(): void
    {
        $this->pharmacy();

        $this->signIn(8, 'dispenser@tibadesk.test', 'pharmacist');

        $this->assertSame('pharmacist', User::where('tibadesk_id', '8')->sole()->role);
    }

    /**
     * The mapping must not guess upwards. A receptionist is nowhere near
     * issuing stock, so the coarsest possible local role is the safe landing.
     */
    #[Test]
    public function a_receptionist_cannot_be_promoted_by_arriving(): void
    {
        $this->pharmacy();

        $this->signIn(9, 'front-desk@tibadesk.test', 'receptionist');

        $this->assertSame('cashier', User::where('tibadesk_id', '9')->sole()->role);
    }

    /**
     * The failure this guards against was silent: the application booted and
     * the session was valid, and every screen behind the scope answered 403.
     */
    #[Test]
    public function a_provisioned_user_is_not_refused_by_the_pharmacy_scope(): void
    {
        $this->pharmacy();

        $session = $this->signIn(7, 'demo@tibadesk.test');

        $this->withHeader('Authorization', 'Bearer '.$session['token'])
            ->getJson('/api/prescriptions')
            ->assertOk();
    }

    /**
     * An account provisioned before membership was recorded is corrected on
     * its next arrival rather than staying permanently unable to use the
     * application it signs into.
     */
    #[Test]
    public function an_account_provisioned_without_membership_is_repaired_on_its_next_sign_in(): void
    {
        $pharmacy = $this->pharmacy();

        $user = User::create([
            'tibadesk_id' => '7',
            'tibadesk_synced_at' => now()->subDay(),
            'current_pharmacy_id' => $pharmacy->id,
            'name' => 'Demo Admin',
            'email' => 'demo@tibadesk.test',
            'phone' => '0700000000',
            'role' => 'pharmacist',
            'user_code' => User::generateUserCode(),
            'is_active' => true,
            'is_verified' => true,
            'password' => Str::random(48),
        ]);

        $this->assertSame(0, $user->pharmacy()->count());

        $this->signIn(7, 'demo@tibadesk.test');

        $this->assertSame(1, $user->fresh()->pharmacy()->count());
    }

    /**
     * Repairing membership must not also reassign a role an administrator set
     * locally, which a naive re-derivation on every sign-in would do.
     */
    #[Test]
    public function a_locally_adjusted_role_survives_a_later_sign_in(): void
    {
        $this->pharmacy();

        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();
        $user->forceFill(['role' => 'cashier'])->save();

        $this->signIn(7, 'demo@tibadesk.test');

        $this->assertSame('cashier', $user->fresh()->role);
    }

    #[Test]
    public function the_role_carried_by_the_assertion_picks_the_local_role_for_a_new_account(): void
    {
        $this->pharmacy();

        $this->signIn(7, 'demo@tibadesk.test', 'facility_admin');

        $this->assertSame(
            config('tibadesk_sso.role_map.facility_admin', config('tibadesk_sso.default_role')),
            User::where('tibadesk_id', '7')->sole()->role,
        );
    }

    /**
     * The signature is the whole trust boundary: without it, anyone who can
     * reach this endpoint could mint themselves an account.
     */
    #[Test]
    public function an_assertion_signed_with_a_different_secret_is_refused(): void
    {
        $this->pharmacy();

        $body = $this->assertion(7, 'demo@tibadesk.test');

        ksort($body['payload']);
        $body['assertion'] = base64_encode(hash_hmac(
            'sha256',
            (string) json_encode($body['payload'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'a-secret-nobody-shared',
            true,
        ));

        $this->postJson('/api/auth/sso', $body)->assertForbidden();

        $this->assertNull(User::where('tibadesk_id', '7')->first());
    }

    /**
     * An expired assertion is a replay risk, so it is refused on its own terms
     * rather than being treated as merely unsigned.
     */
    #[Test]
    public function an_expired_assertion_is_refused(): void
    {
        $this->pharmacy();

        $payload = [
            'sub' => '7',
            'email' => 'demo@tibadesk.test',
            'name' => 'Demo Admin',
            'role' => 'facility_admin',
            'aud' => 'pharmacy',
            'iat' => now()->subHour()->timestamp,
            'exp' => now()->subHour()->timestamp,
        ];

        ksort($payload);

        $this->postJson('/api/auth/sso', [
            'assertion' => base64_encode(hash_hmac(
                'sha256',
                (string) json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                self::SECRET,
                true,
            )),
            'payload' => $payload,
        ])->assertForbidden();
    }

    #[Test]
    public function an_assertion_for_another_application_is_refused(): void
    {
        $this->pharmacy();

        $body = $this->assertion(7, 'demo@tibadesk.test');
        $body['payload']['aud'] = 'dental';

        ksort($body['payload']);
        $body['assertion'] = base64_encode(hash_hmac(
            'sha256',
            (string) json_encode($body['payload'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            self::SECRET,
            true,
        ));

        $this->postJson('/api/auth/sso', $body)->assertForbidden();

        $this->assertNull(User::where('tibadesk_id', '7')->first());
    }

    /**
     * Deactivation is this application's own kill switch, and it has to apply
     * here too. A suspended staff member is still a valid member of staff in
     * TibaDesk, so the assertion that arrives is perfectly genuine — which is
     * exactly why the local decision has to be what decides.
     */
    #[Test]
    public function a_suspended_local_account_cannot_be_signed_in(): void
    {
        $this->pharmacy();

        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();
        $user->forceFill(['is_active' => false])->save();

        $this->postJson('/api/auth/sso', $this->assertion(7, 'demo@tibadesk.test'))
            ->assertForbidden();
    }
}
