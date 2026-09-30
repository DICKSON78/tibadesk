<?php

return [

    /*
    |--------------------------------------------------------------------------
    | TibaDesk single sign-on
    |--------------------------------------------------------------------------
    |
    | TibaDesk mounts this application rather than running it side by side, and
    | the whole point of the mount is that signing in to TibaDesk is signing in
    | here. TibaDesk sends a short-lived signed assertion; this application
    | verifies it against the shared secret, resolves a local user from it, and
    | answers with an ordinary Sanctum token. Nothing about the session that
    | follows is special — it is the same token, with the same expiry and the
    | same revocation, that a local sign-in produces.
    |
    | The secret is shared with the TibaDesk application and is separate from
    | this application's own APP_KEY. Rotating a session key should not
    | invalidate every sign-in assertion, and a leaked application key should
    | not be able to forge one.
    |
    */

    'secret' => env('TIBADESK_SSO_SECRET'),

    // The application this instance answers for. The assertion carries the
    // same value as its audience, and a mismatch is refused: a token minted for
    // pharmacy must not be replayed against eye, even though the two share a
    // secret in a development checkout.
    'audience' => env('TIBADESK_SSO_AUDIENCE', 'pharmacy'),

    // Tolerance for clock difference between this host and TibaDesk. Small,
    // because the assertion is meant to be used within seconds of being issued.
    'clock_skew' => (int) env('TIBADESK_SSO_CLOCK_SKEW', 60),

    /*
    |--------------------------------------------------------------------------
    | How a TibaDesk user becomes a local user
    |--------------------------------------------------------------------------
    |
    | This application is scoped to a single pharmacy, while TibaDesk is
    | multi-facility, so an incoming assertion has to be placed somewhere. The
    | pharmacy is named rather than guessed at, and the role is taken from a
    | mapping with a conservative default, because a TibaDesk role is a much
    | coarser thing than the permissions here and guessing upwards would hand a
    | receptionist the ability to issue and dispense.
    |
    | A TibaDesk facility_admin is the person who owns the facility, so they
    | arrive here as this pharmacy's owner rather than as a pharmacist. That is
    | the role the owner experience hangs off: stock, pricing, staff, payroll,
    | ledgers and reports. A TibaDesk pharmacist stays a pharmacist.
    |
    | The mapping is only consulted the first time a user arrives. After that the
    | local role is the application's to decide, so changing this map does not
    | retroactively promote anyone who already has an account.
    |
    */
    'pharmacy' => env('TIBADESK_SSO_PHARMACY'),

    'role_map' => [
        'facility_admin' => 'owner',
        'pharmacist' => 'pharmacist',
        'cashier' => 'cashier',
        'receptionist' => 'cashier',
    ],

    'default_role' => env('TIBADESK_SSO_DEFAULT_ROLE', 'cashier'),

    /*
    |--------------------------------------------------------------------------
    | Mount
    |--------------------------------------------------------------------------
    |
    | The public path this application is served at on the TibaDesk origin. The
    | front end needs it to resolve its own routes, assets and API calls, and
    | this application needs it to build absolute URLs, so both read it from
    | here rather than each hardcoding a path that would then differ.
    |
    */
    'mount' => env('TIBADESK_MOUNT', '/apps/pharmacy'),

    'storage_key' => env('TIBADESK_TOKEN_STORAGE_KEY', 'tibadesk.pharmacy.token'),

];
