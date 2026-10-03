<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards the internal endpoints that record a subscription quote.
 *
 * These endpoints are not user facing, so rather than pull an authentication
 * package into the marketing site they are protected by a single shared secret
 * sent as a bearer token. The comparison is constant time so the token cannot be
 * discovered by timing the response.
 */
class EnsureQuoteAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('tibadesk.quote_token');
        $provided = (string) ($request->bearerToken() ?? $request->header('X-TibaDesk-Quote-Token'));

        abort_if($expected === '', 503, 'Quote access is not configured on this server.');

        abort_unless(
            $provided !== '' && hash_equals($expected, $provided),
            401,
            'A valid quote token is required.'
        );

        return $next($request);
    }
}
