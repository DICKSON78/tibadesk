<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\TibadeskSso\SsoAssertion;
use App\Support\TibadeskSso\SsoUserResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exchanges a TibaDesk assertion for a local session token.
 *
 * This is the only way into the application that does not involve a password,
 * and it is deliberately narrow: it verifies a signature, resolves a user, and
 * mints a token. It grants no privilege of its own, and it is never consulted
 * to answer what a user may do — that stays with this application's own
 * privilege tables.
 *
 * Failures are answered with 403 and a message that names the failed check.
 * An operator debugging a broken mount needs to know whether a secret was
 * rotated or an assertion replayed; a uniform "forbidden" would cost them an
 * afternoon. Nothing about the internal reason is exposed beyond that, because
 * the endpoint is reachable from the public mount.
 */
class SsoController extends Controller
{
    public function __invoke(Request $request, SsoUserResolver $resolver): JsonResponse
    {
        $validated = $request->validate([
            'assertion' => ['required', 'string'],
            'payload' => ['required', 'array'],
        ]);

        try {
            $assertion = SsoAssertion::verify(
                $validated['payload'],
                $validated['assertion'],
                (string) config('tibadesk_sso.secret'),
                (string) config('tibadesk_sso.audience'),
                (int) config('tibadesk_sso.clock_skew', 60),
            );

            $user = $resolver->resolve($assertion);
        } catch (RuntimeException $exception) {
            // Logged, not shown: the reason is for the operator, and the
            // response says only that the assertion was refused.
            Log::warning('TibaDesk single sign-on refused an assertion.', [
                'reason' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Single sign-on assertion refused.',
            ], Response::HTTP_FORBIDDEN);
        }

        // An ordinary Sanctum token, with the same lifetime and the same
        // revocation as one issued by a local sign-in. The session that follows
        // is not special in any way, which is what keeps the rest of this
        // application unaware that the user arrived from TibaDesk at all.
        $token = $user->createToken('tibadesk', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }
}
