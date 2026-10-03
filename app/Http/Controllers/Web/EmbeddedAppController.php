<?php

namespace App\Http\Controllers\Web;

use App\Enums\Module;
use App\Http\Controllers\Controller;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Frames the imported applications inside the TibaDesk shell.
 *
 * The pharmacy, dental and eye packages are separate Laravel applications.
 * Rather than absorbing their routes and models into this one, they are
 * embedded: the shell renders this application's chrome and the package's own
 * screens load inside a frame, so a user never loses the ERP navigation and
 * never meets a second, differently-styled shell.
 *
 * Because the packages are mounted on this application's own origin rather
 * than behind a port, the frame is same-origin with the shell. That is what
 * makes single sign-on possible at all: a frame on a foreign origin cannot be
 * handed a token without a postMessage handshake and a matching cookie domain,
 * whereas a same-origin frame shares this browser's storage outright. So
 * signing a user in here really does mean signing them in over there.
 *
 * Authorisation inside the frame is deliberately *not* restated here. The
 * module and capability checks below decide whether a user may *open* an
 * application. What they may then do inside it is that application's own
 * concern, and restating its policies here would create two answers to the
 * same question.
 */
class EmbeddedAppController extends Controller
{
    /**
     * The applications the signed-in facility actually holds, for the shell
     * navigation.
     */
    public function index(Request $request, CurrentFacility $current): Response
    {
        $apps = $this->availableTo($request, $current);

        return Inertia::render('Apps/Index', ['apps' => $apps]);
    }

    /**
     * Frame a single application.
     *
     * The capability check is repeated here rather than trusted from the nav:
     * hiding a link is a courtesy, and is not access control. It is also
     * repeated by the mount route itself, because the frame is only how a user
     * arrives at an application, not the way into it.
     */
    public function show(Request $request, CurrentFacility $current, string $app): Response
    {
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

        return Inertia::render('Apps/Show', [
            'app' => $this->present($app, $definition),
            'sso_endpoint' => route('apps.sso', $app),
        ]);
    }

    /**
     * Every configured application this user may open, in configuration order.
     *
     * @return array<int, array<string, mixed>>
     */
    private function availableTo(Request $request, CurrentFacility $current): array
    {
        $user = $request->user();
        $facility = $current->get();

        return collect(config('embedded_apps'))
            ->map(fn (array $app, string $key): array => [$key, $app])
            ->filter(function (array $pair) use ($user, $facility): bool {
                [$key, $app] = $pair;
                $module = Module::tryFrom($app['module']);

                return $module !== null
                    && $facility?->hasModule($module) === true
                    && $user?->canPerform("{$module->value}.view", $module) === true;
            })
            ->map(fn (array $pair): array => $this->present($pair[0], $pair[1]))
            ->values()
            ->all();
    }

    /**
     * The view model for one application card or frame.
     *
     * The URL given to the browser is the mount, never the origin. The origin
     * is an internal address that may be a loopback port the browser can
     * reach on a developer's machine but cannot reach in production, and
     * sending it would quietly turn a correct deployment into a broken frame
     * everywhere except the machine that built it.
     *
     * @return array{key: string, label: string, module: string, icon: string, summary: string, url: string, entry: string, frame_url: string, configured: bool}
     */
    private function present(string $key, array $app): array
    {
        $url = Arr::get($app, 'mount');
        $entry = Arr::get($app, 'entry', '/');

        return [
            'key' => $key,
            'label' => $app['label'],
            'module' => $app['module'],
            'icon' => $app['icon'],
            'summary' => $app['summary'],
            'url' => $url ?: null,
            'entry' => $entry,

            // Where the frame is pointed. Resolved here rather than in the
            // front end so that a package with a public face at its root — eye
            // serves its marketing site there — cannot be framed onto the wrong
            // page by a client that assumed the root was the application.
            'frame_url' => $this->frameUrl($url, $entry),

            // A half-finished deployment lists the application without framing
            // it, so it reads as "not set up" rather than as a broken page.
            'configured' => filled($url),
        ];
    }

    /**
     * Join a mount and an entry path into the one address the frame loads.
     */
    private function frameUrl(?string $mount, string $entry): ?string
    {
        if (blank($mount)) {
            return null;
        }

        $base = rtrim($mount, '/');
        $path = '/'.ltrim($entry, '/');

        return $path === '/' ? $base : $base.$path;
    }
}
