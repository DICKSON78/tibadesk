<?php

namespace Tests\Feature;

use App\Models\Facility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The sign-in and registration overlays on the public site.
 *
 * Both are rendered by the same bundle as every other page, so the only things
 * the server owes them are the addresses that open them and a sign-in post that
 * answers with a reason instead of a redirect. That last part is what makes the
 * overlay usable: the form cannot post natively, because a rejected sign-in is
 * a validation failure and a native post follows the redirect off the site.
 */
class SiteAuthModalsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string}>
     */
    public static function overlayRoutes(): array
    {
        return [
            'register' => ['/register'],
            'login' => ['/login'],
            'login asked for over another page' => ['/packages?modal=login'],
        ];
    }

    #[Test]
    #[DataProvider('overlayRoutes')]
    public function the_overlay_addresses_are_served_by_the_site_shell(string $path): void
    {
        $this->get($path)
            ->assertOk()
            // The whole site is one React app driven by the router in the browser;
            // the server has no per-page view to assert on.
            ->assertViewIs('site');
    }

    #[Test]
    public function a_rejected_sign_in_answers_with_the_reason_rather_than_a_redirect(): void
    {
        $this->postJson('/tibadesk/login', [
            'email' => 'nobody@example.test',
            'password' => 'whatever',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    #[Test]
    public function a_signed_in_member_is_told_where_the_console_wants_them(): void
    {
        $facility = Facility::factory()->create();
        $user = User::factory()->for($facility)->create(['password' => 'ClinicPass2026']);

        $response = $this->postJson('/tibadesk/login', [
            'email' => $user->email,
            'password' => 'ClinicPass2026',
        ]);

        $response->assertRedirect();
        $this->assertAuthenticatedAs($user);
    }
}
