<?php

use App\Http\Controllers\Web\ConsultationController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EmbeddedAppController;
use App\Http\Controllers\Web\EmbeddedAppProxyController;
use App\Http\Controllers\Web\EmbeddedAppSsoController;
use App\Http\Controllers\Web\EncounterController;
use App\Http\Controllers\Web\PatientController;
use App\Http\Controllers\Web\SessionController;
use App\Pharmacy\Http\Controllers\Web\PharmacyScreenController;
use Illuminate\Support\Facades\Route;

/*
|-------------------------------------------------------------------------------
| The application, under /tibadesk
|-------------------------------------------------------------------------------
|
| This file is loaded from routes/web.php inside a Route::prefix('tibadesk')
| group. It is the signed-in half of TibaDesk: sign-in, and everything a member
| of a facility reaches once signed in. It lives under a prefix because the root
| of this origin is the public website, and the two are different products for
| different readers — a visitor arrives at / and a staff member arrives at
| /tibadesk, from the same host.
|
| The prefix is applied to paths only. Route names are untouched, so every
| route('dashboard'), route('apps.mount') and URL::route() in the application
| and in the three packages' SSO callbacks resolves under the mount without a
| single call site changing.
|
| Two routes deliberately do not live here: /csrf-token and /start-trial. Both
| are reached from the public site's own forms, which are not signed in and are
| not under this prefix, so they stay at the root in routes/web.php.
|
*/

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [SessionController::class, 'create'])->name('login');
    Route::post('/login', [SessionController::class, 'store'])->middleware('throttle:6,1');
});

Route::post('/logout', [SessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// Everything below needs a signed-in member of an active facility. Platform
// staff sign in successfully but hold no facility, so they land on the login
// screen rather than an empty application.
Route::middleware(['auth', 'facility', 'licence'])->group(function (): void {
    Route::get('/', DashboardController::class)->name('dashboard');

    // ---- Patient registration ------------------------------------------------
    Route::middleware(['module:registration', 'capability:patients.view'])->group(function (): void {
        Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
        Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
        Route::get('/patients/{patient}/edit', [PatientController::class, 'edit'])->name('patients.edit');
    });

    Route::middleware(['module:registration', 'capability:patients.register'])->group(function (): void {
        Route::get('/patients/create', [PatientController::class, 'create'])->name('patients.create');
        Route::post('/patients', [PatientController::class, 'store'])->name('patients.store');
    });

    Route::middleware(['module:registration', 'capability:patients.update'])->group(function (): void {
        Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    });

    // ---- OPD encounters ------------------------------------------------------
    Route::middleware(['module:registration', 'capability:encounters.view'])->group(function (): void {
        Route::get('/encounters', [EncounterController::class, 'index'])->name('encounters.index');
        Route::get('/encounters/{encounter}', [EncounterController::class, 'show'])->name('encounters.show');
    });

    Route::middleware(['module:registration', 'capability:encounters.create'])->group(function (): void {
        Route::get('/encounters/create', [EncounterController::class, 'create'])->name('encounters.create');
        Route::post('/encounters', [EncounterController::class, 'store'])->name('encounters.store');
    });

    Route::middleware(['module:consultation', 'capability:encounters.view'])->group(function (): void {
        Route::post('/encounters/{encounter}/start', [EncounterController::class, 'start'])
            ->name('encounters.start');
        Route::get('/encounters/{encounter}/consultation', [ConsultationController::class, 'show'])
            ->name('consultations.show');
    });

    // ---- Consultation --------------------------------------------------------
    Route::middleware(['module:consultation', 'capability:consultations.create'])->group(function (): void {
        Route::post('/encounters/{encounter}/consultation', [ConsultationController::class, 'store'])
            ->name('consultations.store');
    });

    // ---- Pharmacy ------------------------------------------------------------
    // Every screen is read-only behind pharmacy.view. The writes that change
    // stock live in the API under pharmacy.manage, so the same rule applies
    // whether the request arrives from a form or from a script.
    Route::middleware(['module:pharmacy', 'capability:pharmacy.view'])->group(function (): void {
        Route::get('/pharmacy', [PharmacyScreenController::class, 'index'])->name('pharmacy.index');
        Route::get('/pharmacy/stock', [PharmacyScreenController::class, 'stock'])->name('pharmacy.stock');
        Route::get('/pharmacy/movements', [PharmacyScreenController::class, 'movements'])->name('pharmacy.movements');
        Route::get('/pharmacy/purchases', [PharmacyScreenController::class, 'purchases'])->name('pharmacy.purchases');
        Route::get('/pharmacy/transfers', [PharmacyScreenController::class, 'transfers'])->name('pharmacy.transfers');
        Route::get('/pharmacy/suppliers', [PharmacyScreenController::class, 'suppliers'])->name('pharmacy.suppliers');
    });

    // ---- Imported applications ----------------------------------------------
    // The pharmacy, dental and eye packages are separate applications mounted
    // under this origin. The module they need differs per app, so the check
    // lives in the controller rather than in a static middleware pair — see
    // EmbeddedAppController, which resolves the module from config and refuses
    // a facility that does not hold it.
    Route::get('/apps', [EmbeddedAppController::class, 'index'])->name('apps.index');

    // The shell frame, and the mount itself, both want /apps/{app}. They are
    // given distinct paths on purpose: the mount owns the bare path, so a user
    // can open an application full-page by URL, and the framed view sits one
    // segment in. Declaring the frame first is what makes that work — a route
    // this specific always wins over the catch-all below it.
    Route::get('/apps/{app}/open', [EmbeddedAppController::class, 'show'])->name('apps.show');

    // Minted per frame load so the package boots already signed in. Declared
    // before the mount for the same reason: the mount matches any sub-path,
    // including this one, and would forward the token request to the package.
    Route::get('/apps/{app}/sso-token', EmbeddedAppSsoController::class)->name('apps.sso');

    // The mount itself: every path under an application is that application's
    // own route, forwarded to it with the prefix stripped. The path is optional
    // so the bare /apps/dental is the package's own root rather than a 404.
    //
    // Matching any method is deliberate: a package's own forms post, put and
    // delete to its own URLs, and a mount that only forwarded GET would turn
    // half its interface into a dead link. The catch-all also means this
    // application does not have to model another application's routing — the
    // package still decides what is real, including its SPA history fallback
    // and its own 404s.
    Route::match(
        ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        '/apps/{app}/{path?}',
        EmbeddedAppProxyController::class,
    )->where('path', '.*')->name('apps.mount');

    Route::middleware(['module:consultation', 'capability:consultations.complete'])->group(function (): void {
        Route::post('/encounters/{encounter}/consultation/complete', [ConsultationController::class, 'complete'])
            ->name('consultations.complete');
    });
});
