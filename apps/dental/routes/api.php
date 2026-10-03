<?php

use App\Http\Controllers\Auth\SsoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DentalSurgeryRecordsController;
use App\Http\Controllers\ClinicsController;
use App\Http\Controllers\ConsultationDiagnosesController;
use App\Http\Controllers\ConsultationsController;
use App\Http\Controllers\ConsultationTypesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\DentalAppointmentsController;
use App\Http\Controllers\DentalChartingController;
use App\Http\Controllers\DentalLabOrdersController;
use App\Http\Controllers\DentalOptionsController;
use App\Http\Controllers\OptionsController;
use App\Http\Controllers\DentalOralExaminationsController;
use App\Http\Controllers\DentalRadiographsController;
use App\Http\Controllers\DentalTreatmentRecordsController;
use App\Http\Controllers\DiseasesController;
use App\Http\Controllers\DistrictsController;
use App\Http\Controllers\ExpenseCategoriesController;
use App\Http\Controllers\ExpensePaymentsController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\ItemPricesController;
use App\Http\Controllers\ItemsController;
use App\Http\Controllers\ItemTypesController;
use App\Http\Controllers\JobTitlesController;

use App\Http\Controllers\Marketing\CommunicationLogsController;
use App\Http\Controllers\Marketing\DailyActivitiesController;
use App\Http\Controllers\Marketing\EventsController;
use App\Http\Controllers\Marketing\IdeasController;
use App\Http\Controllers\Marketing\InformationSourcesController;
use App\Http\Controllers\Marketing\MarketingDashboardController;
use App\Http\Controllers\Marketing\MarketingStrategiesController;
use App\Http\Controllers\Marketing\ResearchPlansController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\CollaboratorsController;
use App\Http\Controllers\PatientAttachmentsController;
use App\Http\Controllers\PatientCheckInsController;
use App\Http\Controllers\PatientItemBillPaymentsController;
use App\Http\Controllers\PatientItemBillsController;
use App\Http\Controllers\PatientItemPaymentsController;
use App\Http\Controllers\PatientPaymentCacheController;
use App\Http\Controllers\PatientPaymentCacheItemsController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\PatientWaitingTimesController;
use App\Http\Controllers\PaymentChannelsController;
use App\Http\Controllers\PaymentModesController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\RegionsController;
use App\Http\Controllers\Reports\InventoryManagementReportsController;
use App\Http\Controllers\Reports\PaymentCenterReportsController;
use App\Http\Controllers\StocktakesController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\StockMovementsController;
use App\Http\Controllers\SurgeryRecordReportsController;
use App\Http\Controllers\NhifClaimsController;
use App\Http\Controllers\CancerRecordsController;
use App\Http\Controllers\UnitsOfMeasureController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WardsController;
use App\Http\Controllers\StockAlertsController;
use App\Http\Controllers\MedicineTakingController;
use App\Http\Controllers\MedicinesController;
use App\Http\Controllers\PrescriptionsController;
use App\Http\Controllers\PatientNotificationsController;
use App\Http\Controllers\MedicineCenterDashboardController;
use App\Http\Controllers\OtherDispensingDashboardController;
use App\Http\Controllers\DispensingDashboardController;
use App\Http\Controllers\InventoryManagementDashboardController;
use App\Http\Controllers\FinancialManagementDashboardController;
use App\Http\Controllers\ProcedureRoomDashboardController;
use App\Http\Controllers\ConsultationRoomDashboardController;
use App\Http\Controllers\DentalLabDashboardController;
use App\Http\Controllers\PatientAllergiesController;
use App\Http\Controllers\PatientMedicalHistoriesController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public routes ────────────────────────────────────────────────────────────

  Route::group(['prefix' => 'auth'], function ($router) {
      $router->post('/login', [AuthController::class, 'login']);
  
      // TibaDesk mounts this application and signs users in from its own
      // session, so a user who has already signed in there should not meet a
      // second login here. The assertion is verified against a shared secret
      // and refused before any user is looked up, which is what makes this
      // route safe to leave public.
      $router->post('/sso', SsoController::class);
  });

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => now()->toISOString()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'database' => 'disconnected',
            'error' => $e->getMessage(),
            'timestamp' => now()->toISOString()
        ], 500);
    }
});

// ─── Authenticated routes (no privilege required) ─────────────────────────────

Route::group(['middleware' => 'auth:api'], function ($router) {

    $router->controller(AuthController::class)->prefix('auth')->group(function ($router) {
        $router->post('/change-password', 'changePassword');
        $router->get('/user', 'getAuthUser');
    });

    $router->get('/dashboard', [DashboardController::class, '__invoke'])->middleware('privilege:dashboard');
    $router->get('/notifications', [NotificationsController::class, '__invoke']);
    $router->get('/notifications/dynamic', [NotificationsController::class, 'getDynamicNotifications']);
    $router->get('/messages', [MessagesController::class, '__invoke']);

    $router->controller(OptionsController::class)->prefix('options')->group(function ($router) {
        $router->get('/', 'index');
    });

    $router->controller(DentalOptionsController::class)->prefix('dental-options')->group(function ($router) {
        $router->get('/', 'index');
    });

    // ─── Reception ────────────────────────────────────────────────────────────

    // Patient record read access is shared with the Payment Center (cashier)
    // so patient details can be shown on cashier/collection screens.
    $router->group(['middleware' => 'privilege:reception,consultation_room,payment_center'], function ($router) {
        $router->get('/patients/{id}', [PatientsController::class, 'show']);
    });

    $router->group(['middleware' => 'privilege:reception,consultation_room'], function ($router) {
        $router->get('/patients/test', [PatientsController::class, 'test']);
        $router->get('/patients/vip', [PatientsController::class, 'vipPatients']);
        $router->apiResource('/patients', PatientsController::class);
        $router->apiResource('/patient-check-ins', PatientCheckInsController::class);
        $router->apiResource('/patient-attachments', PatientAttachmentsController::class);
    });

    $router->group(['middleware' => 'privilege:reception'], function ($router) {
        $router->prefix('patient-waiting-times')->group(function ($router) {
            $router->get('/', [PatientWaitingTimesController::class, 'index']);
            $router->get('/statistics', [PatientWaitingTimesController::class, 'statistics']);
            $router->post('/{id}/start-treatment', [PatientWaitingTimesController::class, 'startTreatment']);
            $router->post('/{id}/end-treatment', [PatientWaitingTimesController::class, 'endTreatment']);
            $router->post('/{id}/force-complete-treatment', [PatientWaitingTimesController::class, 'forceCompleteTreatment']);
            $router->post('/{id}/send-to-cashier', [PatientWaitingTimesController::class, 'sendToCashier']);
            $router->post('/{id}/send-to-consultation', [PatientWaitingTimesController::class, 'sendToConsultation']);
            $router->post('/{id}/send-to-dispensing', [PatientWaitingTimesController::class, 'sendToDispensing']);
            $router->post('/{id}/send-to-procedure-room', [PatientWaitingTimesController::class, 'sendToProcedureRoom']);
            $router->post('/{id}/move-to-department', [PatientWaitingTimesController::class, 'moveToDepartment']);
        });

        $router->prefix('patient-notifications')->group(function ($router) {
            $router->get('/', [PatientNotificationsController::class, 'index']);
            $router->get('/unread-count', [PatientNotificationsController::class, 'unreadCount']);
            $router->post('/{id}/mark-as-read', [PatientNotificationsController::class, 'markAsRead']);
            $router->post('/mark-all-as-read', [PatientNotificationsController::class, 'markAllAsRead']);
            $router->delete('/{id}', [PatientNotificationsController::class, 'destroy']);
        });

        $router->prefix('reception')->group(function ($router) {
            $router->get('/dashboard', [\App\Http\Controllers\ReceptionDashboardController::class, '__invoke']);
        });
    });

    // ─── Payment Center ───────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:payment_center'], function ($router) {
        $router->apiResource('/patient-payment-cache', PatientPaymentCacheController::class);
        $router->apiResource('/patient-payment-cache-items', PatientPaymentCacheItemsController::class);
        $router->controller(PatientPaymentCacheItemsController::class)->prefix('patient-payment-cache-items')->group(function ($router) {
            $router->post('/make-cash-payment', 'makeCashPayment');
            $router->post('/approve-credit-payment', 'approveCreditPayment');
            $router->post('/create-bill', 'createBill');
            $router->post('/complete', 'complete');
        });
        $router->apiResource('/patient-item-payments', PatientItemPaymentsController::class);

        $router->get('/patient-item-bills-summary', [PatientItemBillsController::class, 'summary']);
        $router->apiResource('/patient-item-bills', PatientItemBillsController::class);
        $router->patch('/patient-item-bills/{id}/clear', [PatientItemBillsController::class, 'clear']);
        $router->apiResource('/patient-item-bill-payments', PatientItemBillPaymentsController::class);

        $router->apiResource('/nhif-claims', NhifClaimsController::class);

        $router->prefix('payment-center')->group(function ($router) {
            $router->get('/dashboard', [\App\Http\Controllers\PaymentCenterDashboardController::class, '__invoke']);
        });

        $router->prefix('installment-management')->group(function ($router) {
            $router->get('/partial-payments', [\App\Http\Controllers\InstallmentManagementController::class, 'partialPayments']);
        });

        $router->prefix('reports')->group(function ($router) {
            $router->controller(PaymentCenterReportsController::class)->prefix('payment-center')->group(function ($router) {
                $router->get('/cash-collection', 'getCashCollectionReport');
                $router->get('/partner-frame-payments', 'getPartnerFramePaymentsReport');
            });
        });
    });

    // Shared: dispense endpoint accessible by both payment_center and dispensing
    $router->group(['middleware' => 'privilege:payment_center,dispensing'], function ($router) {
        $router->post('/patient-payment-cache-items/dispense', [PatientPaymentCacheItemsController::class, 'dispense']);
    });

    // ─── Consultation Room ────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:consultation_room'], function ($router) {
        $router->apiResource('/consultations', ConsultationsController::class);
        $router->controller(ConsultationsController::class)->prefix('consultations')->group(function ($router) {
            $router->post('/add-item', 'addItem');
            $router->patch('/{id}/auto-save-clinical-notes', 'autoSaveClinicalNotes');
            $router->patch('/{id}/complete-clinical-notes', 'completeClinicalNotes');
            $router->post('/{id}/discharge', 'discharge');
        });
        $router->apiResource('/consultation-diagnoses', ConsultationDiagnosesController::class);
        $router->apiResource('/dental-oral-examinations', DentalOralExaminationsController::class);
        $router->controller(DentalChartingController::class)->prefix('dental-charting')->group(function ($router) {
            $router->get('/', 'index');
            $router->get('/{id}', 'show');
            $router->post('/', 'store');
            $router->post('/bulk', 'bulkStore');
            $router->put('/{id}', 'update');
            $router->delete('/{id}', 'destroy');
            $router->get('/consultation/{consultationId}', 'getByConsultation');
        });
        $router->apiResource('/dental-treatment-records', DentalTreatmentRecordsController::class);
        $router->apiResource('/prescriptions', PrescriptionsController::class);
        $router->apiResource('/dental-radiographs', DentalRadiographsController::class);
        $router->apiResource('/dental-surgery-records', DentalSurgeryRecordsController::class);
        $router->apiResource('/surgery-record-reports', SurgeryRecordReportsController::class);
        $router->apiResource('/patient-allergies', PatientAllergiesController::class);
        $router->apiResource('/patient-medical-histories', PatientMedicalHistoriesController::class);
        $router->apiResource('/cancer-records', CancerRecordsController::class);

        $router->controller(DentalAppointmentsController::class)->prefix('dental-appointments')->group(function ($router) {
            $router->get('/', 'index');
            $router->get('/today', 'getToday');
            $router->get('/by-date-range', 'getByDateRange');
            $router->get('/{id}', 'show');
            $router->post('/', 'store');
            $router->put('/{id}', 'update');
            $router->post('/{id}/mark-status', 'markStatus');
            $router->delete('/{id}', 'destroy');
        });

        $router->prefix('consultation-room')->group(function ($router) {
            $router->get('/dashboard', [ConsultationRoomDashboardController::class, '__invoke']);
        });

        $router->prefix('reports')->group(function ($router) {
            $router->controller(\App\Http\Controllers\Reports\DentalReportsController::class)->prefix('dental')->group(function ($router) {
                $router->get('/morbidity', 'morbidityReport');
                $router->get('/procedure-summary', 'procedureSummary');
                $router->get('/dhis2-summary', 'dhis2Summary');
            });
            $router->controller(\App\Http\Controllers\Reports\MoHReportsController::class)->prefix('moh')->group(function ($router) {
                $router->get('/monthly-opd', 'monthlyOpd');
                $router->get('/pharmaceutical-consumption', 'pharmaceuticalConsumption');
                $router->get('/revenue-summary', 'revenueSummary');
                $router->get('/ipd-report', 'ipdReport');
                $router->get('/cancer-report', 'cancerReport');
                $router->get('/birth-death-notification', 'birthDeathNotification');
            });
        });
    });

    // ─── Dental Lab ───────────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:dental_lab'], function ($router) {
        $router->controller(DentalLabOrdersController::class)->prefix('dental-lab-orders')->group(function ($router) {
            $router->get('/', 'index');
            $router->get('/{id}', 'show');
            $router->post('/', 'store');
            $router->match(['put', 'patch'], '/{id}', 'update');
            $router->post('/{id}/mark-ready', 'markReady');
            $router->post('/{id}/mark-delivered', 'markDelivered');
            $router->delete('/{id}', 'destroy');
        });

        $router->prefix('dental-lab')->group(function ($router) {
            $router->get('/dashboard', [DentalLabDashboardController::class, '__invoke']);
        });
    });

    // ─── Medicine Center ──────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:medicine_center'], function ($router) {
        $router->get('/medicines/selection', [MedicinesController::class, 'getForSelection']);
        $router->apiResource('/medicines', MedicinesController::class);
        $router->post('/medicines/bulk-create', [MedicinesController::class, 'bulkCreate']);

        $router->group(['prefix' => 'medicine-taking'], function () use ($router) {
            $router->get('/', [MedicineTakingController::class, 'index']);
            $router->post('/', [MedicineTakingController::class, 'store']);
            $router->get('/{id}', [MedicineTakingController::class, 'show']);
            $router->put('/{id}', [MedicineTakingController::class, 'update']);
            $router->delete('/{id}', [MedicineTakingController::class, 'destroy']);
            $router->post('/{id}/mark-taken', [MedicineTakingController::class, 'markAsTaken']);
        });

        $router->prefix('medicine-center')->group(function ($router) {
            $router->get('/dashboard', [MedicineCenterDashboardController::class, '__invoke']);
        });
    });

    // Shared: stock-alerts accessible by both medicine_center and inventory_management
    $router->group(['middleware' => 'privilege:medicine_center,inventory_management'], function ($router) {
        $router->prefix('stock-alerts')->group(function ($router) {
            $router->get('/out-of-stock', [StockAlertsController::class, 'getOutOfStockItems']);
            $router->get('/expired', [StockAlertsController::class, 'getExpiredItems']);
            $router->get('/expiring-soon', [StockAlertsController::class, 'getExpiringSoonItems']);
            $router->get('/summary', [StockAlertsController::class, 'getStockAlertsSummary']);
            $router->get('/medicine', [StockAlertsController::class, 'getMedicineAlerts']);
            $router->get('/medicine-summary', [StockAlertsController::class, 'getMedicineAlertsSummary']);
        });
    });

    // ─── Dispensing ───────────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:dispensing'], function ($router) {
        $router->prefix('dispensing')->group(function ($router) {
            $router->get('/dashboard', [DispensingDashboardController::class, '__invoke']);
        });
    });

    // ─── Other Dispensing ─────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:other_dispensing'], function ($router) {
        $router->prefix('other-dispensing')->group(function ($router) {
            $router->get('/dashboard', [OtherDispensingDashboardController::class, '__invoke']);
        });
    });

    // ─── Procedure Room ───────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:procedure_room'], function ($router) {
        $router->prefix('procedure-room')->group(function ($router) {
            $router->get('/dashboard', [ProcedureRoomDashboardController::class, '__invoke']);
        });
    });

    // ─── Inventory Management ─────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:inventory_management'], function ($router) {
        // Mutating item routes stay gated; read (index/show) moved below so other
        // roles (clinical, dispensing, billing) can use items in selection dropdowns.
        $router->post('/items', [ItemsController::class, 'store']);
        $router->put('/items/{id}', [ItemsController::class, 'update']);
        $router->patch('/items/{id}', [ItemsController::class, 'update']);
        $router->delete('/items/{id}', [ItemsController::class, 'destroy']);
        $router->apiResource('/item-prices', ItemPricesController::class);
        $router->apiResource('/stocktakes', StocktakesController::class);
        $router->post('/stocktakes/{id}/apply', [StocktakesController::class, 'apply']);
        $router->post('/stock-out', [StockOutController::class, 'store']);
        $router->get('/stock-out/reasons', [StockOutController::class, 'reasons']);
        $router->get('/stock-movements', [StockMovementsController::class, 'index']);
        $router->get('/stock-movements/summary', [StockMovementsController::class, 'summary']);
        $router->post('/units-of-measure', [UnitsOfMeasureController::class, 'store']);
        $router->get('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'show']);
        $router->put('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'update']);
        $router->delete('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'destroy']);

        $router->prefix('inventory-management')->group(function ($router) {
            $router->get('/dashboard', [InventoryManagementDashboardController::class, '__invoke']);
        });

        $router->prefix('reports')->group(function ($router) {
            $router->controller(InventoryManagementReportsController::class)->prefix('inventory-management')->group(function ($router) {
                $router->get('/item-quantity-dispensed', 'getItemQuantityDispensedReport');
                $router->get('/item-balance', 'getItemBalanceReport');
            });
        });
    });

    // Public index for units-of-measure (used by selection dropdowns)
    $router->get('/units-of-measure', [UnitsOfMeasureController::class, 'index']);

    // Reference catalogs used in selection dropdowns (items, payment modes,
    // staff/consultants). Read-only access for all authenticated roles; write
    // operations (store/update/destroy) remain gated under their own privilege
    // groups above.
    $router->get('/items', [ItemsController::class, 'index']);
    $router->get('/items/{id}', [ItemsController::class, 'show']);
    $router->get('/payment-modes', [PaymentModesController::class, 'index']);
    $router->get('/payment-modes/{id}', [PaymentModesController::class, 'show']);
    $router->get('/payment-channels', [PaymentChannelsController::class, 'index']);
    $router->get('/payment-channels/{id}', [PaymentChannelsController::class, 'show']);
    $router->get('/users', [UsersController::class, 'index']);
    $router->get('/users/{id}', [UsersController::class, 'show']);
    $router->get('/collaborators', [CollaboratorsController::class, 'index']);
    $router->get('/collaborators/{id}', [CollaboratorsController::class, 'show']);

    // ─── Marketing ────────────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:marketing'], function ($router) {
        $router->prefix('marketing')->group(function ($router) {
            $router->get('/dashboard', [MarketingDashboardController::class, '__invoke']);

            $router->controller(\App\Http\Controllers\Marketing\MarketingReportsController::class)->group(function ($router) {
                $router->get('/campaign-performance', 'campaignPerformance');
                $router->get('/communication-analytics', 'communicationAnalytics');
                $router->get('/lead-generation', 'leadGeneration');
            });

            $router->apiResource('/daily-activities', DailyActivitiesController::class);
            $router->apiResource('/ideas', IdeasController::class);
            $router->apiResource('/events', EventsController::class);
            $router->apiResource('/research-plans', ResearchPlansController::class);
            $router->apiResource('/marketing-strategies', MarketingStrategiesController::class);
            $router->apiResource('/information-sources', InformationSourcesController::class);
            $router->apiResource('/communication-logs', CommunicationLogsController::class);
        });
    });

    // ─── Financial Management ─────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:financial_management'], function ($router) {
        $router->apiResource('/expense-categories', ExpenseCategoriesController::class);
        $router->apiResource('/expenses', ExpensesController::class);
        $router->apiResource('/expense-payments', ExpensePaymentsController::class);

        $router->prefix('financial-management')->group(function ($router) {
            $router->get('/dashboard', [FinancialManagementDashboardController::class, '__invoke']);
        });
    });

    // ─── User Management ──────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:user_management'], function ($router) {
        $router->get('/users/roles', [UsersController::class, 'roles']);
        // GET index/show for /users are registered publicly above (for
        // consultant selection). User management mutating routes stay gated.
        $router->post('/users', [UsersController::class, 'store']);
        $router->put('/users/{id}', [UsersController::class, 'update']);
        $router->patch('/users/{id}', [UsersController::class, 'update']);
        $router->delete('/users/{id}', [UsersController::class, 'destroy']);
    });

    // ─── Settings ─────────────────────────────────────────────────────────────

    $router->group(['middleware' => 'privilege:settings'], function ($router) {
        $router->apiResource('/clinics', ClinicsController::class);
        $router->apiResource('/departments', DepartmentsController::class);
        $router->apiResource('/job-titles', JobTitlesController::class);
        // GET index/show for /payment-modes are registered publicly above (for
        // selection dropdowns). Mutating routes stay gated.
        $router->post('/payment-modes', [PaymentModesController::class, 'store']);
        $router->put('/payment-modes/{id}', [PaymentModesController::class, 'update']);
        $router->patch('/payment-modes/{id}', [PaymentModesController::class, 'update']);
        $router->delete('/payment-modes/{id}', [PaymentModesController::class, 'destroy']);

        // GET index/show for /payment-channels are registered above (for
        // payment center selection dropdowns). Mutating routes stay gated.
        $router->post('/payment-channels', [PaymentChannelsController::class, 'store']);
        $router->put('/payment-channels/{id}', [PaymentChannelsController::class, 'update']);
        $router->patch('/payment-channels/{id}', [PaymentChannelsController::class, 'update']);
        $router->delete('/payment-channels/{id}', [PaymentChannelsController::class, 'destroy']);
        $router->apiResource('/regions', RegionsController::class);
        $router->apiResource('/districts', DistrictsController::class);
        $router->apiResource('/wards', WardsController::class);
        $router->apiResource('/diseases', DiseasesController::class);
        $router->apiResource('/consultation-types', ConsultationTypesController::class);
        $router->apiResource('/preferences', PreferencesController::class);
        // GET index/show for /collaborators are registered publicly above (for
        // partner-lab selection). Mutating routes stay gated.
        $router->post('/collaborators', [CollaboratorsController::class, 'store']);
        $router->put('/collaborators/{id}', [CollaboratorsController::class, 'update']);
        $router->patch('/collaborators/{id}', [CollaboratorsController::class, 'update']);
        $router->delete('/collaborators/{id}', [CollaboratorsController::class, 'destroy']);
    });

    // Shared: item-types accessible by both settings and inventory_management
    $router->group(['middleware' => 'privilege:settings,inventory_management'], function ($router) {
        $router->apiResource('/item-types', ItemTypesController::class);
    });

    // ─── Test endpoint ────────────────────────────────────────────────────────

    Route::get('/test-auth', function (\Illuminate\Http\Request $request) {
        return response()->json([
            'authenticated' => auth()->check(),
            'user' => auth()->user() ? auth()->user()->id : null,
            'headers' => $request->headers->all()
        ]);
    })->middleware('auth:api');
});
