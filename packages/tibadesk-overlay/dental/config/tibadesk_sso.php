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
    // dental must not be replayed against eye, even though the two share a
    // secret in a development checkout.
    'audience' => env('TIBADESK_SSO_AUDIENCE', 'dental'),

    // Tolerance for clock difference between this host and TibaDesk. Small,
    // because the assertion is meant to be used within seconds of being issued.
    'clock_skew' => (int) env('TIBADESK_SSO_CLOCK_SKEW', 60),

    /*
    |--------------------------------------------------------------------------
    | How a TibaDesk user becomes a local user
    |--------------------------------------------------------------------------
    |
    | This application is scoped to a single clinic, while TibaDesk is
    | multi-facility, so an incoming assertion has to be placed somewhere. The
    | clinic is named rather than guessed at, and the role is taken from a
    | mapping with a conservative default, because a TibaDesk role is a much
    | coarser thing than a privilege list here and guessing upwards would hand
    | a receptionist the keys to the clinical record.
    |
    */
    'clinic' => env('TIBADESK_SSO_CLINIC'),

    'role_map' => [
        'facility_admin' => 'Admin',
        'receptionist' => 'Receptionist',
        'clinician' => 'Dental Surgeon',
        'dentist' => 'Dental Surgeon',
    ],

    'default_role' => env('TIBADESK_SSO_DEFAULT_ROLE', 'Receptionist'),

    /*
    |--------------------------------------------------------------------------
    | Modules granted on arrival
    |--------------------------------------------------------------------------
    |
    | A TibaDesk role says roughly what somebody does; it says nothing about
    | which of this application's modules they should open. A user who signs in
    | and is then shown nothing at all is indistinguishable, from where they sit,
    | from a broken mount — so a baseline is granted rather than leaving every
    | new arrival to be set up by hand.
    |
    | It is deliberately clinical only. Administration — user_management,
    | settings, marketing, and financial_management, which moves money — is
    | absent from every list, because a TibaDesk role is a coarser signal than
    | this application needs to trust with any of it. Those are granted here by
    | someone who works here.
    |
    | The baseline applies only to a user who holds nothing at all. Anyone who
    | already has modules has been set up locally, and is left as they are.
    |
    */
    'privileges' => [
        'Dental Surgeon' => [
            'dashboard',
            'reception',
            'consultation_room',
            'procedure_room',
            'dental_lab',
        ],

        'Receptionist' => [
            'dashboard',
            'reception',
        ],

        'Admin' => [
            'dashboard',
            'reception',
            'consultation_room',
            'procedure_room',
            'dental_lab',
            'medicine_center',
            'dispensing',
            'other_dispensing',
            'inventory_management',
            'payment_center',
        ],
    ],

    'default_privileges' => [
        'dashboard',
        'reception',
    ],

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
    'mount' => env('TIBADESK_MOUNT', '/apps/dental'),

    'storage_key' => env('TIBADESK_TOKEN_STORAGE_KEY', 'tibadesk.dental.token'),

];
