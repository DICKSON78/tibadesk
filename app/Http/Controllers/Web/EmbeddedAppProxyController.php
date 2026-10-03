<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\EmbeddedApps\ReverseProxy;
use App\Enums\Module;
use App\Http\Controllers\Controller;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Serves an embedded application's own routes under /apps/{key}/… on this
 * application's origin.
 *
 * The three packages are separate applications. Rather than give each one a port
 * of its own, they are mounted here: a request to
 * /tibadesk/apps/dental/reception/dashboard is forwarded to the dental process
 * with the prefix stripped, and the answer is rewritten so every URL it
 * contains points back under the mount. A user therefore moves between the ERP
 * and its packages without ever leaving one origin, one port, or one product.
 *
 * The authorisation check is the same one the launcher frame applies, and it is
 * applied here rather than trusted from the navigation: hiding a link is a
 * courtesy, not access control. Opening an application requires the facility
 * to hold its module and the user to carry its view capability; what they may
 * then do inside is that application's own decision.
 */
class EmbeddedAppProxyController extends Controller
{
    public function __construct(private readonly ReverseProxy $proxy) {}

    /**
     * Forward one mounted request to the package that owns it.
     *
     * The path is matched loosely on purpose. A package's own router decides
     * what is real — including its SPA history fallback and its 404s — so this
     * route claims every sub-path and forwards it, rather than trying to model
     * another application's routing in this one.
     */
    public function __invoke(
        Request $request,
        CurrentFacility $current,
        string $app,
        string $path = '',
    ): SymfonyResponse {
        $definition = config("embedded_apps.{$app}");

        abort_if($definition === null, 404);

        $module = Module::tryFrom($definition['module']);

        abort_if(
            $module === null
                || ! $request->user()?->canPerform("{$module->value}.view", $module)
                || $current->get()?->hasModule($module) !== true,
            403,
        );

        try {
            return $this->proxy->forward($request, $app, $definition['mount'], $path);
        } catch (ConnectionException $exception) {
            // The package is down or was never started. A frame showing a
            // browser-level network error tells the user nothing, so this says
            // what is actually wrong in the same visual language as the rest
            // of the launcher.
            Log::error('Embedded application could not be reached.', [
                'app' => $app,
                'error' => $exception->getMessage(),
            ]);

            return response()->view('errors.embedded-app-unreachable', [
                'app' => $app,
                'label' => $definition['label'],
            ], 502);
        }
    }
}
