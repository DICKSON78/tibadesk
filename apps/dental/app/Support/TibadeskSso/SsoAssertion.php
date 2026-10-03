<?php

namespace App\Support\TibadeskSso;

use Illuminate\Support\Carbon;
use RuntimeException;

/**
 * Verifies an assertion signed by the TibaDesk application.
 *
 * An assertion says "this user is signed in to TibaDesk, and here is who they
 * are". Nothing in it grants a privilege — the role it carries is a hint used
 * only to pick a local role for a user this application has not seen before.
 * What the user may actually do is decided entirely by this application's own
 * privilege tables, which is the same boundary the TibaDesk side draws: it
 * decides who may open an application, this decides what they may do inside.
 *
 * The signature is checked before the claims are read, and the claims are
 * checked before anything is looked up. An unsigned assertion that reached the
 * user lookup would already be a vulnerability, so the ordering is the
 * security property, not a detail.
 */
class SsoAssertion
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(private readonly array $payload) {}

    /**
     * Verify a signature over a payload and return the verified claims.
     *
     * @param  array<string, mixed>  $payload
     *
     * @throws RuntimeException when the assertion cannot be trusted, with a
     *                          message that says which check failed, because
     *                          "invalid" alone does not tell an operator
     *                          whether to rotate a secret or fix a clock.
     */
    public static function verify(array $payload, string $signature, string $secret, string $audience, int $clockSkew = 60): self
    {
        if ($secret === '') {
            throw new RuntimeException('Single sign-on is not configured: no shared secret.');
        }

        $expected = base64_encode(hash_hmac(
            'sha256',
            (string) json_encode(self::canonicalise($payload), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            $secret,
            true,
        ));

        // Compared in constant time. A signature check that returns early on
        // the first differing byte leaks, through its timing, how much of a
        // guessed signature was correct.
        if (! hash_equals($expected, $signature)) {
            throw new RuntimeException('Single sign-on assertion is not correctly signed.');
        }

        if (($payload['aud'] ?? null) !== $audience) {
            throw new RuntimeException('Single sign-on assertion was issued for a different application.');
        }

        $expiry = $payload['exp'] ?? null;

        if (! is_int($expiry)) {
            throw new RuntimeException('Single sign-on assertion carries no expiry.');
        }

        // The assertion exists only to be exchanged immediately, so it is
        // refused the moment it is stale rather than merely after a long
        // window: a leaked assertion should be worthless by the time anyone
        // could realistically have replayed it.
        if (Carbon::now()->timestamp > $expiry + $clockSkew) {
            throw new RuntimeException('Single sign-on assertion has expired.');
        }

        if (($payload['sub'] ?? null) === null || ($payload['email'] ?? null) === null) {
            throw new RuntimeException('Single sign-on assertion is missing the user identity.');
        }

        return new self($payload);
    }

    public function subject(): string
    {
        return (string) $this->payload['sub'];
    }

    public function email(): string
    {
        return (string) $this->payload['email'];
    }

    public function name(): string
    {
        return (string) ($this->payload['name'] ?? '');
    }

    /**
     * The TibaDesk role, used only to choose a local role on first sign-in.
     */
    public function role(): string
    {
        return (string) ($this->payload['role'] ?? '');
    }

    /**
     * The exact byte sequence that was signed.
     *
     * Key order is part of the signature, so both sides have to agree on it.
     * Sorting here and in the TibaDesk application is what makes them agree
     * without either side having to preserve the order it happened to build
     * the array in.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private static function canonicalise(array $payload): array
    {
        ksort($payload);

        return $payload;
    }
}
