<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\DentalController;
use App\Http\Controllers\Api\EncounterController;
use App\Http\Controllers\Api\EyeController;
use App\Http\Controllers\Api\FacilityActivationController;
use App\Http\Controllers\Api\HrController;
use App\Http\Controllers\Api\IpdController;
use App\Http\Controllers\Api\LaboratoryController;
use App\Http\Controllers\Api\LicensingController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PharmacyController;
use App\Http\Controllers\Api\PolyclinicController;
use App\Http\Controllers\Api\ReportingController;
use App\Http\Controllers\Api\TrialController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\FacilityRegistrationController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Middleware\EnsureQuoteAccess;
use App\Pharmacy\Http\Controllers\RecallController;
use App\Pharmacy\Http\Controllers\StockController;
use App\Pharmacy\Http\Controllers\SupplyController;
use App\Pharmacy\Http\Controllers\TransferController;
use Illuminate\Support\Facades\Route;

/*
|-------------------------------------------------------------------------------
| TibaDesk ERP API
|-------------------------------------------------------------------------------
|
| Every clinical route is authenticated and then gated twice: once on the
| facility holding the module (EnsureModuleEnabled) and once on the caller's
| role holding the capability (EnsureCapability). ResolveFacility binds the
| tenant from the token, so no route ever reads a facility from the request
| and no query can be aimed at another facility.
|
*/

// The self-service trial: what is on offer, and opening one without anyone
// having to approve it. Throttled for the same reason as activations and more
// so, because this one is open to anybody rather than to the website holding
// a secret, and each call writes a facility, a user and a set of grants.
Route::get('/catalogue', [TrialController::class, 'catalogue'])->name('api.catalogue');
Route::post('/trials', [TrialController::class, 'store'])
    ->name('api.trials.store')
    ->middleware('throttle:5,1');

// The one unauthenticated write: the website activates a paid registration
// with a shared secret rather than a user token, because the customer has no
// account yet. Throttled because it is a bearer credential.
Route::post('/activations', [FacilityActivationController::class, 'store'])
    ->name('api.activations.store')
    ->middleware('throttle:10,1');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->name('api.auth.login')
    ->middleware('throttle:6,1');

Route::middleware(['auth:sanctum', 'facility', 'licence'])->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');

    // ---- Patient registration ------------------------------------------------
    Route::middleware(['module:registration', 'capability:patients.view'])->group(function (): void {
        Route::get('/patients', [PatientController::class, 'index'])->name('api.patients.index');
        Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('api.patients.show');
    });

    Route::middleware(['module:registration', 'capability:patients.register'])->group(function (): void {
        Route::post('/patients', [PatientController::class, 'store'])->name('api.patients.store');
        Route::match(['put', 'patch'], '/patients/{patient}', [PatientController::class, 'update'])
            ->name('api.patients.update');
        Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('api.patients.destroy');
    });

    // ---- OPD encounters ------------------------------------------------------
    Route::middleware(['module:registration', 'capability:encounters.view'])->group(function (): void {
        Route::get('/encounters', [EncounterController::class, 'index'])->name('api.encounters.index');
        Route::get('/encounters/{encounter}', [EncounterController::class, 'show'])->name('api.encounters.show');
    });

    Route::middleware(['module:registration', 'capability:encounters.create'])->group(function (): void {
        Route::post('/encounters', [EncounterController::class, 'store'])->name('api.encounters.store');
    });

    Route::middleware(['module:consultation', 'capability:encounters.view'])->group(function (): void {
        Route::post('/encounters/{encounter}/start', [EncounterController::class, 'start'])
            ->name('api.encounters.start');
        Route::post('/encounters/{encounter}/complete', [EncounterController::class, 'complete'])
            ->name('api.encounters.complete');
    });

    Route::middleware(['module:consultation', 'capability:consultations.view'])->group(function (): void {
        Route::get('/encounters/{encounter}/consultation', [ConsultationController::class, 'show'])
            ->name('api.consultations.show');
    });

    // ---- Consultation --------------------------------------------------------
    Route::middleware(['module:consultation', 'capability:consultations.create'])->group(function (): void {
        Route::post('/encounters/{encounter}/consultation', [ConsultationController::class, 'store'])
            ->name('api.consultations.store');
    });

    Route::middleware(['module:consultation', 'capability:consultations.complete'])->group(function (): void {
        Route::post('/encounters/{encounter}/consultation/complete', [ConsultationController::class, 'complete'])
            ->name('api.consultations.complete');
    });

    // ---- Pharmacy ------------------------------------------------------------
    Route::middleware(['module:pharmacy', 'capability:pharmacy.view'])->group(function (): void {
        Route::get('/pharmacy/medicines', [PharmacyController::class, 'index'])->name('api.pharmacy.medicines.index');
        Route::get('/pharmacy/queue', [PharmacyController::class, 'queue'])->name('api.pharmacy.queue');
        Route::get('/pharmacy/dispenses', [PharmacyController::class, 'dispenses'])->name('api.pharmacy.dispenses.index');
    });

    // The supply chain ported from the Phermex project: suppliers, purchase
    // orders, the stock journal, transfers and recalls.
    Route::middleware(['module:pharmacy', 'capability:pharmacy.view'])->group(function (): void {
        Route::get('/pharmacy/stock/batches', [StockController::class, 'batches'])->name('api.pharmacy.batches.index');
        Route::get('/pharmacy/stock/movements', [StockController::class, 'movements'])->name('api.pharmacy.movements.index');
        Route::get('/pharmacy/stock/alerts', [StockController::class, 'alerts'])->name('api.pharmacy.stock.alerts');
        Route::get('/pharmacy/stock/locations', [StockController::class, 'locations'])->name('api.pharmacy.locations.index');
        Route::get('/pharmacy/suppliers', [SupplyController::class, 'suppliers'])->name('api.pharmacy.suppliers.index');
        Route::get('/pharmacy/purchase-orders', [SupplyController::class, 'purchaseOrders'])->name('api.pharmacy.purchase-orders.index');
        Route::get('/pharmacy/transfers', [TransferController::class, 'index'])->name('api.pharmacy.transfers.index');
        Route::get('/pharmacy/recalls', [RecallController::class, 'index'])->name('api.pharmacy.recalls.index');
    });

    Route::middleware(['module:pharmacy', 'capability:pharmacy.manage'])->group(function (): void {
        Route::post('/pharmacy/medicines', [PharmacyController::class, 'store'])->name('api.pharmacy.medicines.store');

        Route::post('/pharmacy/suppliers', [SupplyController::class, 'storeSupplier'])->name('api.pharmacy.suppliers.store');
        Route::post('/pharmacy/purchase-orders', [SupplyController::class, 'storePurchaseOrder'])->name('api.pharmacy.purchase-orders.store');
        Route::post('/pharmacy/purchase-orders/{purchaseOrder}/receive', [SupplyController::class, 'receivePurchaseOrder'])
            ->name('api.pharmacy.purchase-orders.receive');

        Route::post('/pharmacy/write-offs', [StockController::class, 'storeWriteoff'])->name('api.pharmacy.write-offs.store');

        Route::post('/pharmacy/transfers', [TransferController::class, 'store'])->name('api.pharmacy.transfers.store');
        Route::post('/pharmacy/transfers/{stockTransfer}/ship', [TransferController::class, 'ship'])->name('api.pharmacy.transfers.ship');
        Route::post('/pharmacy/transfers/{stockTransfer}/receive', [TransferController::class, 'receive'])->name('api.pharmacy.transfers.receive');

        Route::post('/pharmacy/recalls', [RecallController::class, 'store'])->name('api.pharmacy.recalls.store');
        Route::post('/pharmacy/recalls/{recall}/dispose', [RecallController::class, 'dispose'])->name('api.pharmacy.recalls.dispose');
    });

    Route::middleware(['module:pharmacy', 'capability:pharmacy.dispense'])->group(function (): void {
        Route::post('/pharmacy/encounters/{encounter}/dispense', [PharmacyController::class, 'dispense'])
            ->name('api.pharmacy.dispense');
    });

    // ---- Laboratory ----------------------------------------------------------
    Route::middleware(['module:laboratory', 'capability:laboratory.view'])->group(function (): void {
        Route::get('/laboratory/tests', [LaboratoryController::class, 'index'])->name('api.laboratory.tests.index');
        Route::get('/laboratory/orders', [LaboratoryController::class, 'worklist'])->name('api.laboratory.orders.index');
        Route::get('/laboratory/orders/{order}', [LaboratoryController::class, 'show'])->name('api.laboratory.orders.show');
    });

    Route::middleware(['module:laboratory', 'capability:laboratory.manage'])->group(function (): void {
        Route::post('/laboratory/tests', [LaboratoryController::class, 'store'])->name('api.laboratory.tests.store');
    });

    Route::middleware(['module:laboratory', 'capability:encounters.create'])->group(function (): void {
        Route::post('/laboratory/encounters/{encounter}/orders', [LaboratoryController::class, 'order'])
            ->name('api.laboratory.orders.store');
    });

    Route::middleware(['module:laboratory', 'capability:laboratory.record-results'])->group(function (): void {
        Route::post('/laboratory/items/{item}/result', [LaboratoryController::class, 'result'])
            ->name('api.laboratory.results.store');
    });

    // ---- Billing -------------------------------------------------------------
    Route::middleware(['module:billing', 'capability:billing.view'])->group(function (): void {
        Route::get('/billing/invoices', [BillingController::class, 'invoices'])->name('api.billing.invoices.index');
        Route::get('/billing/invoices/{invoice}', [BillingController::class, 'show'])->name('api.billing.invoices.show');
        Route::get('/billing/encounters/{encounter}/invoice', [BillingController::class, 'forEncounter'])
            ->name('api.billing.encounters.invoice');
        Route::get('/billing/price-list', [BillingController::class, 'priceList'])->name('api.billing.price-list');
    });

    Route::middleware(['module:billing', 'capability:billing.manage'])->group(function (): void {
        Route::post('/billing/price-list', [BillingController::class, 'storePrice'])->name('api.billing.price-list.store');
        Route::post('/billing/invoices/{invoice}/items', [BillingController::class, 'addItem'])
            ->name('api.billing.invoices.items.store');
        Route::post('/billing/invoices/{invoice}/discount', [BillingController::class, 'discount'])
            ->name('api.billing.invoices.discount');
    });

    Route::middleware(['module:billing', 'capability:billing.charge'])->group(function (): void {
        Route::post('/billing/invoices/{invoice}/payments', [BillingController::class, 'payment'])
            ->name('api.billing.payments.store');
    });

    // ---- Dental --------------------------------------------------------------
    Route::middleware(['module:dental', 'capability:dental.view'])->group(function (): void {
        Route::get('/dental/encounters/{encounter}/chart', [DentalController::class, 'chart'])->name('api.dental.chart');
        Route::get('/dental/encounters/{encounter}/procedures', [DentalController::class, 'procedures'])
            ->name('api.dental.procedures.index');
    });

    Route::middleware(['module:dental', 'capability:dental.record'])->group(function (): void {
        Route::post('/dental/encounters/{encounter}/chart', [DentalController::class, 'storeChart'])
            ->name('api.dental.chart.store');
        Route::post('/dental/encounters/{encounter}/procedures', [DentalController::class, 'storeProcedures'])
            ->name('api.dental.procedures.store');
    });

    // ---- Eye -----------------------------------------------------------------
    Route::middleware(['module:eye', 'capability:eye.view'])->group(function (): void {
        Route::get('/eye/encounters/{encounter}/exams', [EyeController::class, 'index'])->name('api.eye.exams.index');
    });

    Route::middleware(['module:eye', 'capability:eye.record'])->group(function (): void {
        Route::post('/eye/encounters/{encounter}/exams', [EyeController::class, 'store'])
            ->name('api.eye.exams.store');
    });

    // ---- Polyclinic ----------------------------------------------------------
    Route::middleware(['module:polyclinic', 'capability:polyclinic.view'])->group(function (): void {
        Route::get('/polyclinic/departments', [PolyclinicController::class, 'departments'])
            ->name('api.polyclinic.departments.index');
        Route::get('/polyclinic/encounters/{encounter}/referrals', [PolyclinicController::class, 'referrals'])
            ->name('api.polyclinic.referrals.index');
    });

    Route::middleware(['module:polyclinic', 'capability:polyclinic.view'])->group(function (): void {
        Route::post('/polyclinic/departments', [PolyclinicController::class, 'storeDepartment'])
            ->name('api.polyclinic.departments.store');
    });

    Route::middleware(['module:polyclinic', 'capability:polyclinic.refer'])->group(function (): void {
        Route::post('/polyclinic/encounters/{encounter}/referrals', [PolyclinicController::class, 'refer'])
            ->name('api.polyclinic.referrals.store');
        Route::post('/polyclinic/referrals/{referral}/accept', [PolyclinicController::class, 'accept'])
            ->name('api.polyclinic.referrals.accept');
    });

    // ---- IPD -----------------------------------------------------------------
    Route::middleware(['module:ipd', 'capability:ipd.view'])->group(function (): void {
        Route::get('/ipd/overview', [IpdController::class, 'overview'])->name('api.ipd.overview');
        Route::get('/ipd/wards', [IpdController::class, 'wards'])->name('api.ipd.wards.index');
        Route::get('/ipd/beds', [IpdController::class, 'beds'])->name('api.ipd.beds.index');
        Route::get('/ipd/admissions', [IpdController::class, 'admissions'])->name('api.ipd.admissions.index');
    });

    Route::middleware(['module:ipd', 'capability:ipd.manage'])->group(function (): void {
        Route::post('/ipd/wards', [IpdController::class, 'storeWard'])->name('api.ipd.wards.store');
    });

    Route::middleware(['module:ipd', 'capability:ipd.admit'])->group(function (): void {
        Route::post('/ipd/encounters/{encounter}/admissions', [IpdController::class, 'admit'])
            ->name('api.ipd.admissions.store');
    });

    Route::middleware(['module:ipd', 'capability:ipd.discharge'])->group(function (): void {
        Route::post('/ipd/admissions/{admission}/discharge', [IpdController::class, 'discharge'])
            ->name('api.ipd.admissions.discharge');
    });

    // ---- HR ------------------------------------------------------------------
    Route::middleware(['module:hr', 'capability:hr.view'])->group(function (): void {
        Route::get('/hr/staff', [HrController::class, 'staff'])->name('api.hr.staff.index');
        Route::get('/hr/leave', [HrController::class, 'leaveRequests'])->name('api.hr.leave.index');
    });

    Route::middleware(['module:hr', 'capability:hr.manage'])->group(function (): void {
        Route::post('/hr/staff', [HrController::class, 'storeStaff'])->name('api.hr.staff.store');
        Route::post('/hr/staff/{staffRecord}/leave', [HrController::class, 'requestLeave'])
            ->name('api.hr.leave.store');
        Route::post('/hr/leave/{leaveRequest}/review', [HrController::class, 'review'])
            ->name('api.hr.leave.review');
    });

    // ---- Reporting -----------------------------------------------------------
    Route::middleware(['module:reporting', 'capability:reporting.view'])->group(function (): void {
        Route::get('/reports/summary', [ReportingController::class, 'summary'])->name('api.reports.summary');
        Route::get('/reports/top-diagnoses', [ReportingController::class, 'topDiagnoses'])
            ->name('api.reports.top-diagnoses');
        Route::get('/reports/revenue-by-day', [ReportingController::class, 'revenueByDay'])
            ->name('api.reports.revenue-by-day');
    });

    // ---- Licensing -----------------------------------------------------------
    // Readable by anyone signed in, so a receptionist can answer "what are we
    // licensed for?" without needing the administrator's capabilities.
    Route::middleware('module:licensing')->group(function (): void {
        Route::get('/licence', [LicensingController::class, 'show'])->name('api.licence.show');
        Route::get('/licence/catalogue', [LicensingController::class, 'catalogue'])
            ->name('api.licence.catalogue');
    });
});

/*
|-------------------------------------------------------------------------------
| The public website's API
|-------------------------------------------------------------------------------
|
| These belong to the marketing site at the root, not to the console under
| /tibadesk, and they were brought across from the application that used to
| serve it. They sit outside the authenticated group above deliberately: a
| visitor reads the package catalogue, sends an enquiry and pays for a
| subscription before they have any account at all.
|
| The names are unchanged, so the site's own JavaScript needed no editing.
|
*/

Route::get('/packages', [PackageController::class, 'index'])->name('api.packages');

Route::post('/contact', [ContactMessageController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('api.contact.store');

Route::post('/registrations', [FacilityRegistrationController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('api.registrations.store');

Route::post('/subscriptions', [SubscriptionController::class, 'store'])->name('api.subscriptions.store');
Route::get('/subscriptions/{reference}', [SubscriptionController::class, 'show'])->name('api.subscriptions.show');
Route::get('/subscriptions/{reference}/download', [SubscriptionController::class, 'download'])->name('api.subscriptions.download');
Route::post('/subscriptions/{reference}/simulate-payment', [SubscriptionController::class, 'simulatePayment'])
    ->name('api.subscriptions.simulate');
Route::post('/clickpesa/callback', [SubscriptionController::class, 'notification'])->name('api.clickpesa.callback');

/*
 * Internal endpoints for the KADETECH team. These are the only place a quoted
 * amount can be read or written, and they are closed unless a quote token is
 * configured and presented.
 */
Route::middleware(EnsureQuoteAccess::class)->prefix('internal')->name('api.internal.')->group(function (): void {
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions/{reference}/quote', [SubscriptionController::class, 'quote'])->name('subscriptions.quote');
});
