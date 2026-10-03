<?php

use App\Http\Controllers\Web\SessionController;
use App\Http\Controllers\Web\TrialController;
use Illuminate\Support\Facades\Route;

/*
|-------------------------------------------------------------------------------
| Routes for this origin
|-------------------------------------------------------------------------------
|
| This origin serves two products to two different readers:
|
|   /            the public website — marketing pages, packages, enquiries,
|                 subscription orders and facility registration. Signed-out
|                 visitors only. Its own routes are in routes/web/public.php.
|
|   /tibadesk    the application — sign-in, and the working application for a
|                 member of a facility. Its own routes are in routes/web/app.php,
|                 loaded below inside the prefix.
|
| They share one host, one session and one build so that a person can be reading
| the public site and sign in to the same product without crossing an origin.
| They are not the same product, which is why they are not the same routes.
|
| The two are kept apart by ordering as well as by prefix: everything specific
| is registered before the public site's catch-all, because the catch-all
| matches any single segment and would otherwise answer for /tibadesk/patients.
|
*/

// ---- Reachable without signing in ---------------------------------------------

// A token belongs to the session rather than to the sign-in page. The public
// site's own forms have to be able to ask for one whether or not the visitor
// already holds a valid cookie — behind the guest middleware this would redirect
// and leave a form with no token and a disabled submit button.
Route::get('/csrf-token', [SessionController::class, 'token'])->name('csrf.token');

// Opening a trial: the public site's registration form posts here, which is how a
// facility comes into existence. It is deliberately on the root rather than under
// the application prefix, because the person completing it has no account yet.
// Throttled for the same reason as the API route behind it: each call writes a
// tenant.
Route::middleware('guest')->group(function (): void {
    Route::get('/start-trial', [TrialController::class, 'create'])->name('trial.create');
    Route::post('/start-trial', [TrialController::class, 'store'])->middleware('throttle:5,1');
});

// ---- The application ----------------------------------------------------------

// Path-prefixed only. Route names are unchanged, so every route() call in the
// application, the packages' SSO callbacks and the tests keep resolving without
// being edited.
Route::prefix('tibadesk')->group(function (): void {
    require __DIR__.'/web/app.php';
});

// ---- The public website -------------------------------------------------------

require __DIR__.'/web/public.php';
