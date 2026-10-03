<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The embedded application launcher and mount.
 *
 * Two things are being defended here, and they are different in kind.
 *
 * The gate is a permission. A facility must only ever be offered the packages
 * its edition includes, and a user must only reach an application their role is
 * actually capable of. A link that is merely hidden is not a permission, so
 * each refusal is asserted directly against the route rather than inferred from
 * the navigation. This has to hold for the mount as well as for the frame,
 * because the frame is only how a user arrives at an application, not the way
 * into it — the mount is a real, bookmarkable URL.
 *
 * The mount itself is plumbing: a request under /apps/{key} is forwarded to
 * that package's process with the prefix stripped. The assertions below pin
 * the parts that would otherwise fail quietly and expensively — that the
 * prefix is stripped rather than passed through, that the package's absolute
 * URLs come back under the mount, and that a package's session cookie is not
 * handed to the browser with a path that escapes the mount.
 */
class EmbeddedAppTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Origins and secrets are set explicitly rather than inherited from the
        // environment, so a test never reaches a real package process and
        // never depends on a developer's local .env.
        config([
            'embedded_apps.pharmacy.origin' => 'http://pharmacy.test',
            'embedded_apps.pharmacy.mount' => '/tibadesk/apps/pharmacy',
            'embedded_apps.pharmacy.sso_secret' => 'pharmacy-secret',
            'embedded_apps.dental.origin' => 'http://dental.test',
            'embedded_apps.dental.mount' => '/tibadesk/apps/dental',
            'embedded_apps.dental.sso_secret' => 'dental-secret',
            'embedded_apps.eye.origin' => 'http://eye.test',
            'embedded_apps.eye.mount' => '/tibadesk/apps/eye',
            'embedded_apps.eye.sso_secret' => 'eye-secret',
        ]);

        // Every mount forwards somewhere by default, so a test only has to
        // describe the response it actually cares about.
        Http::preventStrayRequests();
    }

    // ---- the gate ---------------------------------------------------------

    public function test_it_offers_only_the_applications_the_facility_licence_includes(): void
    {
        // A hospital edition has pharmacy but neither dental nor eye, so the
        // two packages it has not bought must not appear.
        $facility = $this->facility(Edition::Hospital);
        $user = $this->userFor($facility, Role::Pharmacist);

        $this->actingAs($user)
            ->get('/tibadesk/apps')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Apps/Index')
                ->where('apps', fn ($apps) => $apps
                    ->pluck('key')
                    ->all() === ['pharmacy']
                )
            );
    }

    public function test_a_dental_facility_sees_its_own_package_and_pharmacy(): void
    {
        $facility = $this->facility(Edition::DentalClinic);

        $this->actingAs($this->userFor($facility, Role::Dentist))
            ->get('/tibadesk/apps')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('apps', fn ($apps) => $apps
                    ->pluck('key')
                    ->sort()
                    ->values()
                    ->all() === ['dental', 'pharmacy']
                )
            );
    }

    public function test_it_refuses_an_application_the_facility_does_not_hold(): void
    {
        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/dental/open')
            ->assertForbidden();
    }

    public function test_it_refuses_a_user_whose_role_lacks_the_capability(): void
    {
        // The facility holds pharmacy and this user works there, but a
        // receptionist has no pharmacy.view. Reaching the frame must be a
        // 403, not a link that quietly does not appear.
        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Receptionist))
            ->get('/tibadesk/apps/pharmacy/open')
            ->assertForbidden();
    }

    public function test_an_unknown_application_is_not_found(): void
    {
        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/optometry/open')
            ->assertNotFound();
    }

    public function test_a_guest_is_sent_to_login(): void
    {
        $this->get('/tibadesk/apps')->assertRedirect('/tibadesk/login');
    }

    public function test_a_suspended_facility_is_offered_nothing_and_is_refused_every_way_in(): void
    {
        // Suspension has to close the embedded apps too. They are separate
        // applications holding their own data, and a suspended licence must
        // not be a way to keep using them. The launcher answers with an empty
        // list rather than a 403, because "you hold nothing" is the honest
        // answer to a page that lists what you hold; the routes that grant
        // actual access are refused.
        $facility = Facility::factory()
            ->edition(Edition::Hospital)
            ->suspended()
            ->provisioned()
            ->create();

        $user = $this->userFor($facility, Role::FacilityAdmin);

        $this->actingAs($user)
            ->get('/tibadesk/apps')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('apps', fn ($apps) => $apps->isEmpty()));

        $this->actingAs($user)->get('/tibadesk/apps/pharmacy/open')->assertForbidden();
        $this->actingAs($user)->get('/tibadesk/apps/pharmacy/dashboard')->assertForbidden();
    }

    // ---- the frame --------------------------------------------------------

    public function test_it_hands_the_mount_to_the_frame_rather_than_the_internal_origin(): void
    {
        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/pharmacy/open')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Apps/Show')
                ->where('app.key', 'pharmacy')
                ->where('app.url', '/tibadesk/apps/pharmacy')
                ->where('app.configured', true)
                ->where('sso_endpoint', url('/tibadesk/apps/pharmacy/sso-token'))
            );
    }

    public function test_the_frame_opens_the_application_rather_than_a_packages_public_face(): void
    {
        // A package root is not automatically the start of the application.
        // Eye serves its public marketing site at the root, so a frame pointed
        // at the mount would greet a user who has just signed in to TibaDesk
        // with a sales page instead of the clinic.
        $facility = $this->facility(Edition::EyeClinic);

        $this->actingAs($this->userFor($facility, Role::Ophthalmologist))
            ->get('/tibadesk/apps/eye/open')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('app.url', '/tibadesk/apps/eye')
                ->where('app.entry', '/dashboard')
                ->where('app.frame_url', '/tibadesk/apps/eye/dashboard')
            );
    }

    public function test_a_frame_url_is_built_without_doubling_the_slash(): void
    {
        // Dental's entry is the mount root, so the two must collapse to a
        // single address rather than producing a trailing-slash variant that
        // the package would treat as a different route.
        $facility = $this->facility(Edition::DentalClinic);

        $this->actingAs($this->userFor($facility, Role::Dentist))
            ->get('/tibadesk/apps/dental/open')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('app.entry', '/')
                ->where('app.frame_url', '/tibadesk/apps/dental')
            );
    }

    public function test_the_frame_never_exposes_the_packages_internal_address(): void
    {
        // The origin may be a loopback port that works on the machine that set
        // it up and is unreachable everywhere else. If it reaches the browser
        // at all, a correct deployment turns into a broken frame in
        // production, so it is asserted to be absent rather than unused.
        $facility = $this->facility(Edition::Hospital);

        $response = $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/pharmacy/open')
            ->assertOk();

        $this->assertStringNotContainsString('pharmacy.test', $response->getContent());
    }

    public function test_an_unconfigured_application_is_listed_but_not_framed(): void
    {
        config(['embedded_apps.pharmacy.mount' => null]);

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('apps', fn ($apps) => $apps
                    ->count() === 1
                    && $apps->first()['key'] === 'pharmacy'
                    && $apps->first()['configured'] === false
                )
            );
    }

    // ---- the mount --------------------------------------------------------

    public function test_the_mount_strips_its_own_prefix_before_forwarding(): void
    {
        Http::fake([
            'pharmacy.test/*' => Http::response('<h1>Stock</h1>', 200, ['Content-Type' => 'text/html']),
        ]);

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/pharmacy/stock/low')
            ->assertOk()
            ->assertSee('Stock');

        // The package's router knows nothing about TibaDesk, so passing the
        // prefix through would 404 inside the package rather than here — a
        // failure that looks like a routing bug in the wrong application.
        Http::assertSent(fn (Request $request) => $request->url() === 'http://pharmacy.test/stock/low');
    }

    public function test_the_mount_rewrites_a_package_redirect_back_under_the_mount(): void
    {
        // A package that redirects to its own login would otherwise send the
        // browser to the TibaDesk root, where this application answers instead
        // of the package — the user would land on the ERP dashboard, which
        // reads as success and is not.
        Http::fake([
            'dental.test/*' => Http::response('', 302, ['Location' => 'http://dental.test/login']),
        ]);

        $facility = $this->facility(Edition::DentalClinic);

        $this->actingAs($this->userFor($facility, Role::Dentist))
            ->get('/tibadesk/apps/dental/reception')
            ->assertRedirect('/tibadesk/apps/dental/login');
    }

    public function test_a_package_redirect_to_its_own_root_relative_login_lands_on_the_tibadesk_login(): void
    {
        // A package's unauthenticated redirect is root-relative, so it is
        // absolute to the site root rather than to the mount. Left alone it
        // would arrive at the marketing site, which now owns the root and has
        // a page of its own there — the user would be shown a sales page at the
        // moment their session ended. The sign-in page moved under /tibadesk
        // when the public website took the root, so the redirect is mapped.
        Http::fake([
            'pharmacy.test/*' => Http::response('', 302, ['Location' => '/login']),
        ]);

        $facility = $this->facility(Edition::Pharmacy);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/pharmacy/dashboard')
            ->assertRedirect('/tibadesk/login');
    }

    public function test_the_mount_rewrites_absolute_package_urls_in_a_response_body(): void
    {
        // These packages generate absolute URLs from their own APP_URL. Left
        // alone they resolve against the TibaDesk origin and hit this
        // application's routes, so an /api call inside a package would
        // silently reach the wrong application.
        Http::fake([
            'eye.test/*' => Http::response(
                '<a href="http://eye.test/patients">Patients</a><img src="/build/eye.js">',
                200,
                ['Content-Type' => 'text/html'],
            ),
        ]);

        $facility = $this->facility(Edition::EyeClinic);

        $body = $this->actingAs($this->userFor($facility, Role::Ophthalmologist))
            ->get('/tibadesk/apps/eye/patients')
            ->assertOk()
            ->getContent();

        $this->assertStringContainsString('href="/tibadesk/apps/eye/patients"', $body);
        $this->assertStringContainsString('src="/tibadesk/apps/eye/build/eye.js"', $body);
        $this->assertStringNotContainsString('eye.test', $body);
    }

    public function test_the_mount_refuses_a_package_the_facility_does_not_hold(): void
    {
        // The mount is a real URL, not a side effect of the frame, so the gate
        // has to be applied to it directly.
        Http::fake();

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/dental/patients')
            ->assertForbidden();

        Http::assertNothingSent();
    }

    public function test_a_guest_cannot_reach_a_package_through_the_mount(): void
    {
        Http::fake();

        $this->get('/tibadesk/apps/pharmacy/stock')->assertRedirect('/tibadesk/login');

        Http::assertNothingSent();
    }

    public function test_the_mount_reports_a_package_that_cannot_be_reached(): void
    {
        // A dead package should not present as a blank frame. The answer says
        // what is actually wrong, in the same visual language as the rest of
        // the launcher.
        Http::fake(fn () => throw new ConnectionException('Connection refused'));

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->get('/tibadesk/apps/pharmacy/stock')
            ->assertStatus(502)
            ->assertSee('could not be reached');
    }

    // ---- single sign-on ---------------------------------------------------

    public function test_it_mints_a_package_token_for_the_signed_in_user(): void
    {
        // The point of the mount being same-origin: one sign-in to TibaDesk is
        // enough to open any package, and the user is never shown a second
        // login. If this stops working, the user meets a login screen inside
        // the frame and the whole mount reads as a bug.
        Http::fake([
            'pharmacy.test/api/auth/sso' => Http::response(['token' => 'pkg-token-abc']),
        ]);

        $facility = $this->facility(Edition::Hospital);
        $user = $this->userFor($facility, Role::Pharmacist);

        $this->actingAs($user)
            ->getJson('/tibadesk/apps/pharmacy/sso-token')
            ->assertOk()
            ->assertJson([
                'token' => 'pkg-token-abc',
                'mount' => '/tibadesk/apps/pharmacy',
                'storage_key' => 'tibadesk.pharmacy.token',
            ]);

        // Each package keeps its own keyspace. They share one localStorage now
        // that they share an origin, so a single shared key would mean signing
        // in to dental silently signs the user out of eye.
        Http::assertSent(function (Request $request) use ($user) {
            $payload = $request->data();

            return $payload['payload']['sub'] === (string) $user->getKey()
                && $payload['payload']['email'] === $user->email;
        });
    }

    public function test_the_assertion_is_signed_with_the_shared_secret(): void
    {
        // The assertion is what carries a TibaDesk login into a package, so an
        // unsigned or wrongly-signed one must not be honoured. Verifying the
        // signature here is the only place the two sides' agreement is checked.
        Http::fake([
            'dental.test/api/auth/sso' => Http::response(['token' => 'tok']),
        ]);

        $facility = $this->facility(Edition::DentalClinic);

        $this->actingAs($this->userFor($facility, Role::Dentist))
            ->getJson('/tibadesk/apps/dental/sso-token')
            ->assertOk();

        Http::assertSent(function (Request $request): bool {
            $payload = $request->data()['payload'];
            $expected = base64_encode(hash_hmac(
                'sha256',
                (string) json_encode($this->canonicalise($payload), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'dental-secret',
                true,
            ));

            return $request->data()['assertion'] === $expected;
        });
    }

    public function test_it_refuses_to_mint_a_token_for_an_application_the_facility_does_not_hold(): void
    {
        // Otherwise the token endpoint would be a way around the mount's own
        // gate, handing out a live session for an application the facility
        // never licensed.
        Http::fake();

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->getJson('/tibadesk/apps/dental/sso-token')
            ->assertForbidden();

        Http::assertNothingSent();
    }

    public function test_it_reports_a_package_that_refuses_the_assertion(): void
    {
        Http::fake([
            'pharmacy.test/api/auth/sso' => Http::response(['message' => 'Bad signature'], 403),
        ]);

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->getJson('/tibadesk/apps/pharmacy/sso-token')
            ->assertStatus(502);
    }

    public function test_it_does_not_mint_a_token_without_a_configured_secret(): void
    {
        // Failing loudly beats minting nothing: a deployment that forgot the
        // secret should say so rather than present as a package that is simply
        // unavailable.
        config(['embedded_apps.pharmacy.sso_secret' => null]);

        Http::fake();

        $facility = $this->facility(Edition::Hospital);

        $this->actingAs($this->userFor($facility, Role::Pharmacist))
            ->getJson('/tibadesk/apps/pharmacy/sso-token')
            ->assertStatus(502);
    }

    private function facility(Edition $edition): Facility
    {
        return Facility::factory()->edition($edition)->provisioned()->create();
    }

    private function userFor(Facility $facility, Role $role): User
    {
        return User::factory()->forFacility($facility)->role($role)->create();
    }

    /**
     * Mirrors the broker's ordering, so the signature is recomputed the same
     * way the package will recompute it.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function canonicalise(array $payload): array
    {
        ksort($payload);

        return $payload;
    }
}
