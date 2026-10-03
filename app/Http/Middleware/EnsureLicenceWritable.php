<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Refuse to change anything for a facility whose licence has lapsed.
 *
 * This is the enforcement half of per-licence billing. Without it the expiry
 * date is decoration: `licence_expires_at` is reported on the dashboard and
 * nowhere consulted, so a facility that stopped paying in March would still be
 * creating encounters, dispensing stock and raising invoices in November until
 * somebody noticed the date by hand and changed the status.
 *
 * Only writes are refused. Reads stay open on purpose — a lapsed clinic must
 * still be able to read patient records, both to treat the people in front of
 * it and because a medical record has to remain readable for longer than the
 * subscription that created it. Locking a hospital out of a patient's allergies
 * would be a patient-safety incident, not a collection tactic.
 *
 * Renewing needs no counterpart: the date moves into the future and the very
 * next request is allowed through, so there is no reactivation step to forget.
 */
class EnsureLicenceWritable
{
    /**
     * The methods that change state. Everything else — reading a list, opening
     * a chart, running a report, signing in — is allowed on a lapsed licence.
     *
     * @var list<string>
     */
    private const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        $facility = $request->user()?->facility;

        // A platform account has no facility and so no licence of its own; the
        // facility middleware has already refused it if it had no tenant.
        if ($facility === null) {
            return $next($request);
        }

        if (! in_array($request->method(), self::WRITES, true)) {
            return $next($request);
        }

        abort_if(
            $facility->isReadOnly(),
            402,
            'This facility\'s licence has expired. Existing records remain readable, '
            .'but new entries cannot be saved until the licence is renewed.',
        );

        return $next($request);
    }
}
