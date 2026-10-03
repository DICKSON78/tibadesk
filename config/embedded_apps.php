<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Embedded applications
|--------------------------------------------------------------------------
|
| The pharmacy, dental and eye packages are separate Laravel applications
| that TibaDesk mounts rather than absorbs. Each one owns its own models,
| migrations, queue workers and deployment cadence; collapsing them into this
| application's autoloader and route table would mean three releases frozen
| into one, and three sets of migrations racing for the same connection.
|
| They are mounted under this application's own origin, at /apps/{key}, so a
| user never leaves the TibaDesk chrome and never meets a second, differently
| styled shell. The mount is a reverse proxy: a request to
| /apps/dental/reception/dashboard is forwarded to that package's process with
| the prefix stripped, and the browser only ever sees :8000.
|
| Each package therefore has two addresses, and the distinction matters:
|
|   origin  — where the package process actually listens. Only the ERP's proxy
|             ever talks to this, so it may be a loopback port or a private
|             network address that is never exposed to a browser.
|
|   mount   — the path the package is published at on the TibaDesk origin.
|             This is what the frame loads and what the package uses to build
|             its own URLs, so it must be the public path, never the origin.
|
| `sso_secret` is the shared HMAC key the ERP and the package use to sign the
| assertion that carries a signed-in ERP user into the package, so that a user
| signs in to TibaDesk once. See App\EmbeddedApps\SsoBroker and the matching
| /api/auth/sso endpoint in each package. It is deliberately separate from the
| application key: rotating a session key should not invalidate every
| inter-package assertion, and a leaked package key should not forge one.
|
| `entry` is the path within the package that the frame should actually open.
| A package root is not always the start of the thing a signed-in user wants:
| eye serves its public marketing site at the root, so a frame pointed there
| would greet a TibaDesk user with a sales page. Where a package has a public
| face, the entry names the application behind it.
|
| The alternative — porting each package feature by feature into this monolith
| — is what produced the pharmacy module in app/Pharmacy, and remains the right
| answer for anything that genuinely needs to share this application's
| database. The two are deliberately both present.
|
| Every key must be a module that exists in config/tibadesk.php, or a facility
| holding that module would still be refused at the route. See
| App\Http\Controllers\Web\EmbeddedAppController, which enforces that.
|
*/

return [
    'pharmacy' => [
        'label' => 'Pharmacy',
        'module' => 'pharmacy',
        'icon' => 'beaker',
        'summary' => 'Dispensing, stock, purchasing and transfers.',
        'origin' => env('EMBEDDED_PHARMACY_ORIGIN', 'http://127.0.0.1:8011'),
        'mount' => '/tibadesk/apps/pharmacy',

        // Trailing slash included, and not incidentally. The dashboard's HTML
        // refers to its icons and manifest relatively, and a browser resolves
        // those against the current directory — without the slash they resolve
        // one level too high and the application loads without its icons.
        'entry' => '/dashboard/',
        'sso_secret' => env('EMBEDDED_PHARMACY_SSO_SECRET'),
        'sso_endpoint' => '/api/auth/sso',

        // The mounted packages share one browser origin, so they share one
        // localStorage. Each is given its own keyspace; without this, signing
        // in to one application silently invalidates the session in another.
        'storage_key' => 'tibadesk.pharmacy.token',
    ],

    'dental' => [
        'label' => 'Dental',
        'module' => 'dental',
        'icon' => 'tooth',
        'summary' => 'Chair-side charting, appointments and treatment plans.',
        'origin' => env('EMBEDDED_DENTAL_ORIGIN', 'http://127.0.0.1:8012'),
        'mount' => '/tibadesk/apps/dental',

        // Dental's root is a gate that decides between the sign-in page and the
        // application, so the mount root is already the right place to open.
        'entry' => '/',
        'sso_secret' => env('EMBEDDED_DENTAL_SSO_SECRET'),
        'storage_key' => 'tibadesk.dental.token',
    ],

    'eye' => [
        'label' => 'Eye clinic',
        'module' => 'eye',
        'icon' => 'eye',
        'summary' => 'Optometry, refraction and optical dispensing.',
        'origin' => env('EMBEDDED_EYE_ORIGIN', 'http://127.0.0.1:8013'),
        'mount' => '/tibadesk/apps/eye',

        // Eye's root is its public marketing site, which is correct for a
        // visitor and wrong for somebody who has just signed in to TibaDesk to
        // work. The frame therefore opens the application proper.
        'entry' => '/dashboard',
        'sso_secret' => env('EMBEDDED_EYE_SSO_SECRET'),
        'storage_key' => 'tibadesk.eye.token',
    ],
];
