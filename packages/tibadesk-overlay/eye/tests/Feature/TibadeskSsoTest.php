<?php

namespace Tests\Feature;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Signing in to the eye application through TibaDesk.
 *
 * The thing being defended is that an account arriving from TibaDesk is a
 * working member of this clinic, not merely a row in the users table. Those are
 * two different facts and only one of them is obvious: a user can hold the
 * other half of the pair — no clinic at all — sign in successfully, and then be
 * refused by every screen behind the scope, which looks from inside the
 * application like a mount that simply refuses to load.
 *
 * Suspension is here for the same reason. TibaDesk governs who may open this
 * package; whether an account inside this package has been deactivated is a
 * fact only this application holds, and it is the local decision that has to
 * win.
 *
 * This application runs on PHPUnit 9, which does not read the #[Test]
 * attribute, so the tests are named with the default `test` prefix.
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
            'tibadesk_sso.audience' => 'eye',
        ]);
    }

    private function clinic(): Clinic
    {
        return Clinic::create([
            'name' => 'TibaDesk Eye',
        ]);
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
            'aud' => 'eye',
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

    private function arrival(array $overrides = []): User
    {
        return User::create(array_merge([
            'tibadesk_id' => '7',
            'tibadesk_synced_at' => now()->subDay(),
            'first_name' => 'Demo',
            'last_name' => 'Admin',
            'username' => 'demo-admin',
            'email' => 'demo@tibadesk.test',
            'role' => 'Receptionist',
            'status' => 'Active',
            'password' => Str::random(48),
        ], $overrides));
    }

    public function test_a_first_arrival_is_provisioned_and_given_a_session(): void
    {
        $this->clinic();

        $response = $this->assertion(7, 'demo@tibadesk.test');

        $this->postJson('/api/auth/sso', $response)
            ->assertOk()
            ->assertJsonStructure(['token']);

        $user = User::where('tibadesk_id', '7')->sole();

        $this->assertSame('demo@tibadesk.test', $user->email);
        $this->assertSame('Active', $user->status);
    }

    /**
     * The whole point of the fix. Clinic membership is what the scoped screens
     * read, so an account without it can sign in and then be refused everywhere.
     */
    public function test_a_provisioned_user_belongs_to_the_clinic(): void
    {
        $clinic = $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();

        $this->assertSame($clinic->id, $user->clinic_id);
        $this->assertTrue(
            $user->clinic()->where('clinics.id', $clinic->id)->exists(),
            'A user signed in through TibaDesk has no clinic they were placed in.',
        );
    }

    /**
     * The failure this guards against was silent: the application booted and
     * the session was valid, and every screen behind the scope answered 403.
     */
    public function test_a_provisioned_user_is_not_refused_after_signing_in(): void
    {
        $this->clinic();

        $session = $this->signIn(7, 'demo@tibadesk.test');

        $this->withHeader('Authorization', 'Bearer '.$session['token'])
            ->getJson('/api/dashboard')
            ->assertOk();
    }

    /**
     * A user who signs in and is then shown nothing at all is
     * indistinguishable, from where they sit, from a broken mount — so a
     * baseline of clinical modules is granted on arrival. This application does
     * not gate its API on privileges, but the interface is built from them.
     */
    public function test_a_new_arrival_is_granted_a_baseline_of_clinical_modules(): void
    {
        $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test');

        $privileges = User::where('tibadesk_id', '7')->sole()->privileges()->pluck('privilege');

        $this->assertTrue($privileges->contains('dashboard'));
        $this->assertTrue($privileges->contains('reception'));
    }

    /**
     * Administration is not part of the baseline for any arrival. A TibaDesk
     * role is a coarser signal than this application needs to trust with staff
     * accounts, settings or money.
     */
    public function test_a_receptionist_cannot_be_promoted_by_arriving(): void
    {
        $this->clinic();

        $this->signIn(9, 'front-desk@tibadesk.test', 'receptionist');

        $user = User::where('tibadesk_id', '9')->sole();

        $this->assertSame('Client', $user->role);
        $this->assertFalse(
            $user->is_admin,
            'A receptionist was made an administrator by arriving.',
        );
        $this->assertFalse(
            $user->privileges()->whereIn('privilege', ['user_management', 'financial_management'])->exists(),
            'A receptionist was granted an administrative module by arriving.',
        );
    }

    public function test_a_facility_arrives_as_an_admin(): void
    {
        $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test', 'facility_admin');

        $this->assertSame('Admin', User::where('tibadesk_id', '7')->sole()->role);
    }

    public function test_a_tibadesk_ophthalmologist_arrives_as_a_non_administrator(): void
    {
        $this->clinic();

        $this->signIn(8, 'eye@tibadesk.test', 'ophthalmologist');

        $user = User::where('tibadesk_id', '8')->sole();

        $this->assertSame('Client', $user->role);
        $this->assertFalse(
            $user->is_admin,
            'An ophthalmologist arriving through TibaDesk was made an administrator.',
        );
    }

    /**
     * Every role the mapping can produce has to be one the users.role column
     * can store.
     *
     * The column is an enum of Admin and Client, and MySQL writes a value
     * outside an enum as an empty string rather than refusing it. The User model
     * reads an empty role as an administrator, so a mapping written in good
     * faith against roles the column has never heard of — Doctor, Optician,
     * Nurse, Receptionist, Cashier — does not fail visibly. It silently turns
     * every clinician, optician, nurse, receptionist and cashier into an
     * administrator. This is the test that would have caught it.
     */
    public function test_every_mapped_role_is_one_the_role_column_can_store(): void
    {
        $storable = ['Admin', 'Client'];

        foreach ((array) config('tibadesk_sso.role_map') as $from => $to) {
            $this->assertContains(
                $to,
                $storable,
                "TibaDesk role [{$from}] maps to [{$to}], which the users.role enum cannot store.",
            );
        }

        $this->assertContains(
            config('tibadesk_sso.default_role'),
            $storable,
            'The default role is not a value the users.role enum can store.',
        );
    }

    /**
     * The whole of the escalation above, asserted on the account rather than on
     * the configuration: a clinician arriving through TibaDesk is not an
     * administrator, whatever the mapping happens to say today.
     */
    public function test_no_clinical_arrival_becomes_an_administrator(): void
    {
        $this->clinic();

        foreach (['clinician', 'ophthalmologist', 'optician', 'nurse', 'receptionist', 'cashier'] as $index => $tibadeskRole) {
            $this->signIn(100 + $index, "staff{$index}@tibadesk.test", $tibadeskRole);

            $user = User::where('tibadesk_id', (string) (100 + $index))->sole();

            $this->assertFalse(
                $user->is_admin,
                "A {$tibadeskRole} arriving through TibaDesk became an administrator.",
            );
        }
    }

    /**
     * An account that reached a sign-in without clinic membership is corrected
     * on its next arrival rather than staying permanently unable to use the
     * application it signs into.
     */
    public function test_an_account_provisioned_without_a_clinic_is_repaired_on_its_next_sign_in(): void
    {
        $clinic = $this->clinic();

        $user = $this->arrival(['clinic_id' => null]);

        $this->assertNull($user->clinic_id);

        $this->signIn(7, 'demo@tibadesk.test');

        $this->assertSame($clinic->id, $user->fresh()->clinic_id);
    }

    /**
     * Removing the clinic nulls the foreign key rather than leaving the id
     * behind, so this is how an account actually loses its membership in
     * production — and it is repaired on the next arrival.
     */
    public function test_an_account_whose_clinic_is_removed_is_repaired_on_its_next_sign_in(): void
    {
        $clinic = $this->clinic();

        $user = $this->arrival(['clinic_id' => $clinic->id]);

        $clinic->delete();

        $this->assertNull($user->fresh()->clinic_id);

        $replacement = $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test');

        $this->assertSame($replacement->id, $user->fresh()->clinic_id);
    }

    /**
     * Repairing membership must not also reassign a role an administrator set
     * locally, which a naive re-derivation on every sign-in would do.
     */
    public function test_a_locally_adjusted_role_survives_a_later_sign_in(): void
    {
        $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();
        $user->forceFill(['role' => 'Client'])->save();

        $this->signIn(7, 'demo@tibadesk.test');

        $this->assertSame('Client', $user->fresh()->role);
    }

    public function test_the_role_carried_by_the_assertion_picks_the_local_role_for_a_new_account(): void
    {
        $this->clinic();

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
    public function test_an_assertion_signed_with_a_different_secret_is_refused(): void
    {
        $this->clinic();

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
    public function test_an_expired_assertion_is_refused(): void
    {
        $this->clinic();

        $payload = [
            'sub' => '7',
            'email' => 'demo@tibadesk.test',
            'name' => 'Demo Admin',
            'role' => 'facility_admin',
            'aud' => 'eye',
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

    public function test_an_assertion_for_another_application_is_refused(): void
    {
        $this->clinic();

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
     * here too. A suspended staff member is still valid in TibaDesk, so the
     * assertion that arrives is perfectly genuine — which is exactly why the
     * local decision has to be what decides.
     */
    public function test_a_suspended_local_account_cannot_be_signed_in(): void
    {
        $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();
        $user->forceFill(['status' => 'Inactive'])->save();

        $this->postJson('/api/auth/sso', $this->assertion(7, 'demo@tibadesk.test'))
            ->assertForbidden();
    }

    /**
     * Suspension is checked before anything is written, so a refused arrival
     * leaves no trace behind it.
     */
    public function test_a_refused_suspended_arrival_is_not_refreshed(): void
    {
        $this->clinic();

        $this->signIn(7, 'demo@tibadesk.test');

        $user = User::where('tibadesk_id', '7')->sole();
        $user->forceFill(['status' => 'Inactive', 'email' => 'changed@example.test'])->save();

        $before = $user->tibadesk_synced_at;

        $this->postJson('/api/auth/sso', $this->assertion(7, 'renamed@tibadesk.test'))
            ->assertForbidden();

        $this->assertSame('changed@example.test', $user->fresh()->email);
        $this->assertEquals($before, $user->fresh()->tibadesk_synced_at);
    }
}
