<?php

namespace App\Http\Middleware;

use App\Enums\Module;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
    /**
     * Refuse a request unless the facility holds the module behind it.
     *
     * This is what makes an edition mean something at runtime: a dental
     * facility simply has no route into eye records, because the grant does
     * not exist and the request never reaches a controller.
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        abort_unless(Module::tryFrom($module), 500, "Unknown module [{$module}].");

        $facility = $request->user()?->facility;

        abort_if($facility === null, 403, 'This account is not attached to a facility.');

        abort_unless(
            $facility->hasModule(Module::from($module)),
            403,
            "The {$module} module is not part of this facility's edition.",
        );

        return $next($request);
    }
}
