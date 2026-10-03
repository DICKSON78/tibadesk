<?php

namespace App\Providers;

use App\Services\Licence\LicenceIssuer;
use App\Services\Payments\ClickPesaGateway;
use App\Services\Payments\FakePaymentGateway;
use App\Services\Payments\PaymentGateway;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Source projects mounted as apps inside this one. Each keeps its models
     * under its own namespace and its factories beside them, rather than being
     * flattened into App\Models.
     *
     * @var list<string>
     */
    private const MOUNTED_APPS = ['Pharmacy', 'Dental', 'Eye'];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One holder per request, so every model reading the scope sees the
        // same facility. It is never shared between requests.
        $this->app->singleton(CurrentFacility::class);

        $this->bindPaymentGateway();

        $this->app->singleton(LicenceIssuer::class, fn (): LicenceIssuer => new LicenceIssuer(
            privateKeyPath: config('tibadesk.licence.private_key_path'),
            publicKeyPath: config('tibadesk.licence.public_key_path'),
        ));

        $this->resolveMountedAppFactories();
    }

    /**
     * Choose the payment gateway the checkout charges through.
     *
     * This arrived with the public website, which now lives inside this
     * application. The fake driver stands in for ClickPesa while it is being
     * built, and refuses to run in production rather than quietly taking money
     * and never calling back.
     */
    private function bindPaymentGateway(): void
    {
        $this->app->singleton(PaymentGateway::class, function (): PaymentGateway {
            if (config('clickpesa.driver') === 'clickpesa') {
                $apiKey = config('clickpesa.api_key');

                if (blank($apiKey)) {
                    throw new RuntimeException('CLICKPESA_API_KEY must be set when the ClickPesa driver is enabled.');
                }

                return new ClickPesaGateway(
                    baseUrl: config('clickpesa.base_url'),
                    apiKey: $apiKey,
                    returnUrl: config('clickpesa.return_url'),
                    callbackUrl: config('clickpesa.callback_url'),
                );
            }

            if (app()->environment('production')) {
                throw new RuntimeException('The fake payment driver cannot be used in production. Set CLICKPESA_DRIVER=clickpesa.');
            }

            return new FakePaymentGateway;
        });
    }

    /**
     * Teach HasFactory where the mounted apps keep their factories.
     *
     * The default guesser maps a model at App\Pharmacy\Models\X onto
     * Database\Factories\Pharmacy\Models\XFactory, which is not where the
     * mounted apps put theirs. Rather than override newFactory() on every model
     * as those apps grow, the extra namespace segment is collapsed here.
     */
    private function resolveMountedAppFactories(): void
    {
        Factory::guessFactoryNamesUsing(function (string $modelName): string {
            foreach (self::MOUNTED_APPS as $app) {
                if (str_starts_with($modelName, "App\\{$app}\\Models\\")) {
                    return 'Database\\Factories\\'.$app.'\\'.class_basename($modelName).'Factory';
                }
            }

            return 'Database\\Factories\\'.class_basename($modelName).'Factory';
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Accessing an unloaded relation in production is nearly always a
        // missing eager load that would otherwise be a slow query in
        // development and a row-count bug in production.
        Model::preventLazyLoading(! $this->app->isProduction());

        Model::unguard(false);

        // Every bound record is a bigint id. Without this, /patients/create
        // matches the /patients/{patient} route registered above it, the
        // binding looks for a patient literally named "create", and the create
        // screen 404s behind a route that looks correct in route:list.
        // Constraining the parameter means the literal route wins on its own
        // merits, and ordering stops mattering.
        foreach (['patient', 'encounter', 'invoice', 'medicine', 'dispense', 'labTest', 'labOrder', 'ward', 'bed', 'admission', 'staffRecord', 'leaveRequest', 'referral', 'department', 'servicePrice', 'purchaseOrder', 'stockTransfer', 'recall'] as $parameter) {
            Route::pattern($parameter, '[0-9]+');
        }
    }
}
