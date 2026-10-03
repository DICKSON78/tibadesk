<?php

declare(strict_types=1);

namespace App\EmbeddedApps;

use App\Models\User;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Carries a signed-in TibaDesk user into an embedded package.
 *
 * Each package authenticates its own users, so without this a user who has
 * signed in to the ERP would meet a second login the moment they opened a
 * package. That is the one thing the mount is meant to remove, so on entering
 * an application the shell asks for a token rather than showing a login.
 *
 * The mechanism is a signed assertion rather than a shared session or a
 * forwarded cookie, because the packages are separate applications with
 * separate user tables and separate session stores. The ERP holds the only
 * credential that matters here — the fact that this user is signed in and what
 * they may open — and signs it. The package verifies the signature against the
 * shared secret, resolves or provisions a local user, and answers with its own
 * Sanctum token. No user password ever crosses the boundary, and a package
 * cannot mint an assertion for itself.
 *
 * The assertion is deliberately narrow. It names a user, not a privilege: what
 * that user may do inside the package remains the package's own decision, which
 * is the same boundary the frame already draws. The ERP gates which application
 * a user may open; the package gates what they may do once inside.
 */
class SsoBroker
{
    /**
     * How long a single assertion stays valid.
     *
     * Short, because the assertion exists only to cross one request boundary
     * and mint a token. A longer window would let a leaked assertion be
     * replayed, and the whole point of minting a per-package token is that the
     * package can expire and revoke it on its own terms.
     */
    private const ASSERTION_TTL_SECONDS = 60;

    public function __construct(private readonly HttpFactory $http) {}

    /**
     * Mint a package session token for an ERP user.
     *
     * @throws RuntimeException when the package refuses the assertion or cannot
     *                          be reached; the caller reports this to the user
     *                          rather than silently showing a login.
     */
    public function issueToken(string $key, User $user): string
    {
        $definition = $this->definition($key);

        $secret = $definition['sso_secret'] ?? null;

        if (! is_string($secret) || $secret === '') {
            throw new RuntimeException(
                "Embedded application [{$key}] has no SSO secret configured."
            );
        }

        $origin = rtrim((string) $definition['origin'], '/');
        $payload = $this->payload($user, $key);

        // Where the package expects to be handed an assertion. Configurable
        // because these are separate applications that were not written to a
        // common convention, and normalising all three is a larger change than
        // this mount should make on their behalf.
        $endpoint = (string) ($definition['sso_endpoint'] ?? '/api/auth/sso');

        $response = $this->http
            ->timeout(10)
            ->acceptJson()
            ->asJson()
            ->post("{$origin}{$endpoint}", [
                'assertion' => $this->sign($payload, $secret),
                'payload' => $payload,
            ]);

        if ($response->failed()) {
            Log::warning('Embedded application SSO exchange failed.', [
                'app' => $key,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException(
                "Embedded application [{$key}] refused the sign-in assertion (HTTP {$response->status()})."
            );
        }

        $token = $response->json('token');

        if (! is_string($token) || $token === '') {
            throw new RuntimeException(
                "Embedded application [{$key}] returned no session token."
            );
        }

        return $token;
    }

    /**
     * The claims carried into the package.
     *
     * `subject` is the ERP's own user id, which is what the package stores as
     * the external identity it maps the local user to. The email and name are
     * there so a package can provision a readable account on first sign-in
     * without a second round trip.
     *
     * @return array<string, scalar>
     */
    private function payload(User $user, string $key): array
    {
        return [
            'iss' => config('app.url'),
            'aud' => $key,
            'sub' => (string) $user->getKey(),
            'email' => (string) $user->email,
            'name' => (string) $user->name,
            'role' => $user->role instanceof \BackedEnum ? $user->role->value : (string) $user->role,
            'iat' => Carbon::now()->timestamp,
            'exp' => Carbon::now()->addSeconds(self::ASSERTION_TTL_SECONDS)->timestamp,
        ];
    }

    /**
     * @param  array<string, scalar>  $payload
     */
    private function sign(array $payload, string $secret): string
    {
        // The claims are signed as their JSON encoding, and the package
        // re-encodes the same array the same way to verify, so the two must
        // agree on ordering and escaping. Both sides therefore canonicalise
        // through this exact method rather than hashing whatever they were
        // handed.
        ksort($payload);

        $encoded = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return base64_encode(hash_hmac('sha256', (string) $encoded, $secret, true));
    }

    /**
     * @return array<string, mixed>
     */
    private function definition(string $key): array
    {
        $definition = config("embedded_apps.{$key}");

        if (! is_array($definition)) {
            throw new RuntimeException("Unknown embedded application [{$key}].");
        }

        return $definition;
    }
}
