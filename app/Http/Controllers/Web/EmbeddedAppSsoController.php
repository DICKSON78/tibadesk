<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\EmbeddedApps\SsoBroker;
use App\Enums\Module;
use App\Http\Controllers\Controller;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Mints a session token for an embedded application on behalf of the signed-in
 * TibaDesk user.
 *
 * The shell calls this before it boots a package's frame, then writes the token
 * into the browser's shared storage — which the same-origin mount lets it do
 * without a postMessage handshake. The package picks the token up as it boots
 * and is already signed in, so the user never sees a second login.
 *
 * This endpoint issues tokens and nothing else. It names a user, not a
 * privilege: whether that user may open the application at all was already
 * decided by the same module and capability check the frame and the mount
 * apply, and what they may do inside the package is the package's own answer.
 */
class EmbeddedAppSsoController extends Controller
{
    public function __invoke(
        Request $request,
        CurrentFacility $current,
        SsoBroker $broker,
        string $app,
    ): JsonResponse {
        $definition = config("embedded_apps.{$app}");

        if ($definition === null) {
            throw new NotFoundHttpException;
        }

        $module = Module::tryFrom($definition['module']);

        abort_if(
            $module === null
                || ! $request->user()?->canPerform("{$module->value}.view", $module)
                || $current->get()?->hasModule($module) !== true,
            403,
        );

        try {
            $token = $broker->issueToken($app, $request->user());
        } catch (RuntimeException $exception) {
            // The package is down or has not finished being configured. The
            // shell shows this in place of the frame, which is more useful than
            // an empty panel, and the detail stays in the log rather than on
            // screen.
            report($exception);

            return response()->json([
                'message' => $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'token' => $token,
            'mount' => $definition['mount'],
            'storage_key' => $definition['storage_key'] ?? 'tibadesk.token',
        ]);
    }
}
