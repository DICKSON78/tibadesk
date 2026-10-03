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
    'audience' => env('TIBADESK_SSO_AUDIENCE', 'eye'),

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
    | Every value below is one the users.role column can actually store. That
    | constraint is not a preference. The column is an enum of Admin and Client,
    | and a value outside an enum is not rejected by MySQL — it is written as an
    | empty string — and the User model reads an empty role as an administrator.
    | Mapping a doctor or a receptionist onto a role the column has never heard
    | of therefore does not downgrade anyone; it promotes every one of them.
    | Widening the enum to hold the clinical roles is the better answer, and
    | until then the distinction is carried by the privilege baseline below,
    | which is what the interface is actually built from.
    |
    */
    'clinic' => env('TIBADESK_SSO_CLINIC'),

    'role_map' => [
        'facility_admin' => 'Admin',

        'clinician' => 'Client',
        'ophthalmologist' => 'Client',
        'optician' => 'Client',
        'nurse' => 'Client',
        'receptionist' => 'Client',
        'cashier' => 'Client',
    ],

    'default_role' => env('TIBADESK_SSO_DEFAULT_ROLE', 'Client'),

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
    | Client is the only baseline currently reached, because it is the only
    | non-administrative role the users.role column can store. The clinical
    | lists below it are kept so that widening the enum re-grants the right
    | modules without this file having to be rewritten from memory.
    |
    */
    'privileges' => [
        'Client' => [
            'dashboard',
            'reception',
        ],

        'Doctor' => [
            'dashboard',
            'reception',
            'consultation_room',
            'procedure_room',
            'optician_center',
        ],

        'Optician' => [
            'dashboard',
            'reception',
            'optician_center',
            'inventory_management',
        ],

        'Nurse' => [
            'dashboard',
            'reception',
            'consultation_room',
            'procedure_room',
        ],

        'Receptionist' => [
            'dashboard',
            'reception',
        ],

        'Cashier' => [
            'dashboard',
            'payment_center',
        ],

        'Admin' => [
            'dashboard',
            'reception',
            'consultation_room',
            'procedure_room',
            'optician_center',
            'inventory_management',
            'dispensing',
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
    'mount' => env('TIBADESK_MOUNT', '/apps/eye'),

    'storage_key' => env('TIBADESK_TOKEN_STORAGE_KEY', 'tibadesk.eye.token'),

];
