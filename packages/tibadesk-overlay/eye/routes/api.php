<?php

use App\Http\Controllers\Auth\SsoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CataractSurgeryRecordsController;
use App\Http\Controllers\ClinicsController;
use App\Http\Controllers\ConsultationDiagnosesController;
use App\Http\Controllers\ConsultationsController;
use App\Http\Controllers\ConsultationTypesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\DiseasesController;
use App\Http\Controllers\DistrictsController;
use App\Http\Controllers\ExpenseCategoriesController;
use App\Http\Controllers\ExpensePaymentsController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\ItemPricesController;
use App\Http\Controllers\ItemsController;
use App\Http\Controllers\ItemTypesController;
use App\Http\Controllers\JobTitlesController;
use App\Http\Controllers\LensTypesController;
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
use App\Http\Controllers\DoctorTasksController;
use App\Http\Controllers\PaymentChannelsController;
use App\Http\Controllers\PaymentModesController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\RegionsController;
use App\Http\Controllers\Reports\InventoryManagementReportsController;
use App\Http\Controllers\Reports\PaymentCenterReportsController;
use App\Http\Controllers\StocktakesController;
use App\Http\Controllers\SurgeryRecordReportsController;
use App\Http\Controllers\UnitsOfMeasureController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WardsController;
use App\Http\Controllers\StockAlertsController;
use App\Http\Controllers\MedicineTakingController;
use App\Http\Controllers\MedicinesController;
use App\Http\Controllers\PatientNotificationsController;
use App\Http\Controllers\MedicineCenterDashboardController;
use App\Http\Controllers\OtherDispensingDashboardController;
use App\Http\Controllers\DispensingDashboardController;
use App\Http\Controllers\InventoryManagementDashboardController;
use App\Http\Controllers\FinancialManagementDashboardController;
use App\Http\Controllers\ProcedureRoomDashboardController;
use App\Http\Controllers\ConsultationRoomDashboardController;
use App\Http\Controllers\OpticianCenterDashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix' => 'auth'], function ($router) {
    $router->post('/login', [AuthController::class, 'login']);

    // TibaDesk mounts this application and signs users in from its own
    // session, so a user who has already signed in there should not meet a
    // second login here. The assertion is verified against a shared secret
    // and refused before any user is looked up, which is what makes this
    // route safe to leave public.
    $router->post('/sso', SsoController::class);
});

// Public routes - accessible without authentication
Route::get('/units-of-measure', [UnitsOfMeasureController::class, 'index']);

// Public blog routes
Route::get('/blog', [\App\Http\Controllers\PublicBlogController::class, 'index']);
Route::get('/blog/top-stories', [\App\Http\Controllers\PublicBlogController::class, 'topStories']);
Route::get('/blog/{slug}', [\App\Http\Controllers\PublicBlogController::class, 'show']);

// Public announcements routes
Route::get('/announcements', [\App\Http\Controllers\PublicAnnouncementController::class, 'index']);

// Public appointment booking
Route::post('/appointments', [\App\Http\Controllers\PublicAppointmentsController::class, 'store']);

// Public newsletter subscription
Route::post('/newsletter/subscribe', [\App\Http\Controllers\NewsletterController::class, 'subscribe']);

// Temporary public dispensing dashboard for testing
Route::get('/dispensing-dashboard-public', [\App\Http\Controllers\DispensingDashboardController::class, '__invoke']);

// Health check endpoint
Route::get('/health', function () {
    try {
        // Test database connection
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

// Test authentication endpoint
Route::get('/test-auth', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user() ? auth()->user()->id : null,
        'headers' => $request->headers->all()
    ]);
})->middleware('auth:api');

Route::group(['middleware' => 'auth:api'], function ($router) {
    $router->controller(AuthController::class)->prefix('auth')->group(function ($router) {
        $router->post('/change-password', 'changePassword');
        $router->get('/user', 'getAuthUser');
    });

     // VIP Patients - move this inside the main auth group
    $router->get('/patients/vip', [PatientsController::class, 'vipPatients']);
    
    // Patient Waiting Times
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
    
    // Doctor Tasks
    $router->prefix('doctor-tasks')->group(function ($router) {
        $router->get('/', [DoctorTasksController::class, 'index']);
        $router->get('/statistics', [DoctorTasksController::class, 'statistics']);
        $router->get('/doctor/{doctorId}', [DoctorTasksController::class, 'doctorTasks']);
        $router->post('/', [DoctorTasksController::class, 'store']);
        $router->post('/{id}/start', [DoctorTasksController::class, 'startTask']);
        $router->post('/{id}/complete', [DoctorTasksController::class, 'completeTask']);
    });
    
    $router->get('/dashboard', [DashboardController::class, '__invoke']);
    $router->get('/notifications', [NotificationsController::class, '__invoke']);
    $router->get('/notifications/dynamic', [NotificationsController::class, 'getDynamicNotifications']);
    
    // Patient Notifications
    $router->prefix('patient-notifications')->group(function ($router) {
        $router->get('/', [PatientNotificationsController::class, 'index']);
        $router->get('/unread-count', [PatientNotificationsController::class, 'unreadCount']);
        $router->post('/{id}/mark-as-read', [PatientNotificationsController::class, 'markAsRead']);
        $router->post('/mark-all-as-read', [PatientNotificationsController::class, 'markAllAsRead']);
        $router->delete('/{id}', [PatientNotificationsController::class, 'destroy']);
    });
    $router->apiResource('/clinics', ClinicsController::class);
    $router->apiResource('/departments', DepartmentsController::class);
    $router->apiResource('/job-titles', JobTitlesController::class);
    $router->apiResource('/users', UsersController::class);
    $router->apiResource('/payment-modes', PaymentModesController::class);
    $router->apiResource('/payment-channels', PaymentChannelsController::class);
    // Units of measure - only CRUD operations (index is public)
    $router->post('/units-of-measure', [UnitsOfMeasureController::class, 'store']);
    $router->get('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'show']);
    $router->put('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'update']);
    $router->delete('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'destroy']);
    $router->apiResource('/lens-types', LensTypesController::class);
    $router->apiResource('/item-types', ItemTypesController::class);
    $router->apiResource('/consultation-types', ConsultationTypesController::class);
    $router->apiResource('/items', ItemsController::class);
    $router->apiResource('/item-prices', ItemPricesController::class);
    $router->apiResource('/regions', RegionsController::class);
    $router->apiResource('/districts', DistrictsController::class);
    $router->apiResource('/wards', WardsController::class);
    $router->apiResource('/diseases', DiseasesController::class);

    $router->get('/patients/test', [PatientsController::class, 'test']);
    $router->apiResource('/patients', PatientsController::class);
    $router->apiResource('/patient-check-ins', PatientCheckInsController::class);
    $router->apiResource('/patient-attachments', PatientAttachmentsController::class);

    $router->apiResource('/patient-payment-cache', PatientPaymentCacheController::class);
    $router->apiResource('/patient-payment-cache-items', PatientPaymentCacheItemsController::class);
    $router->controller(PatientPaymentCacheItemsController::class)->prefix('patient-payment-cache-items')->group(function ($router) {
        $router->post('/make-cash-payment', 'makeCashPayment');
        $router->post('/approve-credit-payment', 'approveCreditPayment');
        $router->post('/create-bill', 'createBill');
        $router->post('/dispense', 'dispense');
        $router->post('/complete', 'complete');
    });
    $router->apiResource('/patient-item-payments', PatientItemPaymentsController::class);

    $router->get('/patient-item-bills-summary', [PatientItemBillsController::class, 'summary']);
    $router->apiResource('/patient-item-bills', PatientItemBillsController::class);
    $router->patch('/patient-item-bills/{id}/clear', [PatientItemBillsController::class, 'clear']);
    $router->apiResource('/patient-item-bill-payments', PatientItemBillPaymentsController::class);

    $router->apiResource('/consultations', ConsultationsController::class);
    $router->controller(ConsultationsController::class)->prefix('consultations')->group(function ($router) {
        $router->post('/add-item', 'addItem');
        $router->patch('/{id}/auto-save-clinical-notes', 'autoSaveClinicalNotes');
        $router->patch('/{id}/complete-clinical-notes', 'completeClinicalNotes');
    });
    $router->apiResource('/surgery-record-reports', SurgeryRecordReportsController::class);
    $router->apiResource('/cataract-surgery-records', CataractSurgeryRecordsController::class);

    $router->apiResource('/consultation-diagnoses', ConsultationDiagnosesController::class);
    $router->apiResource('/stocktakes', StocktakesController::class);
    $router->post('/stocktakes/{id}/apply', [StocktakesController::class, 'apply']);
    
    // Stock Alerts
    $router->prefix('stock-alerts')->group(function ($router) {
        $router->get('/out-of-stock', [StockAlertsController::class, 'getOutOfStockItems']);
        $router->get('/expired', [StockAlertsController::class, 'getExpiredItems']);
        $router->get('/expiring-soon', [StockAlertsController::class, 'getExpiringSoonItems']);
        $router->get('/summary', [StockAlertsController::class, 'getStockAlertsSummary']);
        $router->get('/medicine', [StockAlertsController::class, 'getMedicineAlerts']);
        $router->get('/medicine-summary', [StockAlertsController::class, 'getMedicineAlertsSummary']);
    });

    // Medicine Taking routes
    $router->group(['prefix' => 'medicine-taking'], function () use ($router) {
        $router->get('/', [MedicineTakingController::class, 'index']);
        $router->post('/', [MedicineTakingController::class, 'store']);
        $router->get('/{id}', [MedicineTakingController::class, 'show']);
        $router->put('/{id}', [MedicineTakingController::class, 'update']);
        $router->delete('/{id}', [MedicineTakingController::class, 'destroy']);
        $router->post('/{id}/mark-taken', [MedicineTakingController::class, 'markAsTaken']);
    });

    // Medicines routes
    $router->apiResource('/medicines', MedicinesController::class);
    $router->post('/medicines/bulk-create', [MedicinesController::class, 'bulkCreate']);
    $router->get('/medicines/selection', [MedicinesController::class, 'getForSelection']);

    $router->apiResource('/expense-categories', ExpenseCategoriesController::class);
    $router->apiResource('/expenses', ExpensesController::class);
    $router->apiResource('/expense-payments', ExpensePaymentsController::class);
    $router->apiResource('/preferences', PreferencesController::class);
    $router->apiResource('/collaborators', CollaboratorsController::class);

    $router->get('/messages', [MessagesController::class, '__invoke']);

    $router->prefix('marketing')->group(function ($router) {
        $router->get('/dashboard', [MarketingDashboardController::class, '__invoke']);
        $router->apiResource('/daily-activities', DailyActivitiesController::class);
        $router->apiResource('/ideas', IdeasController::class);
        $router->apiResource('/events', EventsController::class);
        $router->apiResource('/research-plans', ResearchPlansController::class);
        $router->apiResource('/marketing-strategies', MarketingStrategiesController::class);
        $router->apiResource('/information-sources', InformationSourcesController::class);
        $router->apiResource('/communication-logs', CommunicationLogsController::class);
        $router->apiResource('/blog-posts', \App\Http\Controllers\Marketing\BlogPostsController::class);
        $router->post('/blog-posts/upload-image', [\App\Http\Controllers\Marketing\BlogPostsController::class, 'uploadImage']);
        $router->post('/blog-posts/upload-video', [\App\Http\Controllers\Marketing\BlogPostsController::class, 'uploadVideo']);
        $router->post('/blog-posts/{id}/share', [\App\Http\Controllers\Marketing\BlogPostsController::class, 'share']);
        $router->post('/blog-posts/{id}/unshare/{platform}', [\App\Http\Controllers\Marketing\BlogPostsController::class, 'unshare']);
        $router->apiResource('/announcements', \App\Http\Controllers\Marketing\AnnouncementsController::class);
        $router->apiResource('/categories', \App\Http\Controllers\Marketing\CategoriesController::class)->only(['index', 'store', 'destroy']);
    });
    
    $router->prefix('consultation-room')->group(function ($router) {
        $router->get('/dashboard', [ConsultationRoomDashboardController::class, '__invoke']);
    });
    
    $router->prefix('optician-center')->group(function ($router) {
        $router->get('/dashboard', [OpticianCenterDashboardController::class, '__invoke']);
    });
    
    $router->prefix('medicine-center')->group(function ($router) {
        $router->get('/dashboard', [MedicineCenterDashboardController::class, '__invoke']);
    });

    $router->prefix('other-dispensing')->group(function ($router) {
        $router->get('/dashboard', [OtherDispensingDashboardController::class, '__invoke']);
    });

    $router->prefix('dispensing')->group(function ($router) {
        $router->get('/dashboard', [DispensingDashboardController::class, '__invoke']);
    });

    $router->prefix('inventory-management')->group(function ($router) {
        $router->get('/dashboard', [InventoryManagementDashboardController::class, '__invoke']);
    });

    $router->prefix('financial-management')->group(function ($router) {
        $router->get('/dashboard', [FinancialManagementDashboardController::class, '__invoke']);
    });

    $router->prefix('procedure-room')->group(function ($router) {
        $router->get('/dashboard', [ProcedureRoomDashboardController::class, '__invoke']);
    });

    $router->prefix('reception')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\ReceptionDashboardController::class, '__invoke']);
        $router->apiResource('/appointments', \App\Http\Controllers\AdminAppointmentsController::class)->only(['index', 'show', 'update', 'destroy']);
    });

    $router->prefix('payment-center')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\PaymentCenterDashboardController::class, '__invoke']);
    });

    $router->prefix('reports')->group(function ($router) {
        $router->controller(PaymentCenterReportsController::class)->prefix('payment-center')->group(function ($router) {
            $router->get('/cash-collection', 'getCashCollectionReport');
            $router->get('/cash-collection/{type}/{id}', 'getCashCollectionRecord');
            $router->put('/cash-collection/{type}/{id}', 'updateCashCollectionRecord');
            $router->delete('/cash-collection/{type}/{id}', 'deleteCashCollectionRecord');
            $router->get('/partner-frame-payments', 'getPartnerFramePaymentsReport');
        });
        $router->controller(InventoryManagementReportsController::class)->prefix('inventory-management')->group(function ($router) {
            $router->get('/item-quantity-dispensed', 'getItemQuantityDispensedReport');
            $router->get('/item-balance', 'getItemBalanceReport');
        });
    });
});

Route::get('/restore', function (\Illuminate\Http\Request $request) {
    $items = \Illuminate\Support\Facades\DB::select('select message, phone, patient_id from messages group by patient_id');

    foreach ($items as &$item) {
        $pattern = '/Habari\s+(.+?)\./';
        if (preg_match($pattern, $item->message, $matches)) {
            $first_name = trim($matches[1]);
            \App\Models\Patient::where('id', $item->patient_id)->where('first_name', '')->update(['first_name' => $first_name, 'phone' => $item->phone]);
        }
    }
});
