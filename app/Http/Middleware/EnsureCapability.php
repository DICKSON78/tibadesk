<?php

namespace App\Http\Middleware;

use App\Enums\Module;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCapability
{
    /**
     * Refuse a request unless the signed-in user's role carries the capability.
     *
     * A module gate proves the facility bought the module; this proves the
     * person in front of it is allowed to act inside that module. Passing one
     * without the other is not enough.
     */
    public function handle(Request $request, Closure $next, string $capability, ?string $module = null): Response
    {
        $user = $request->user();

        abort_if($user === null, 403, 'This account is not attached to a facility.');

        // The module is optional: a capability that belongs to no single module
        // is checked on the role alone.
        $moduleEnum = $module !== null ? Module::tryFrom($module) : null;

        if ($moduleEnum === null) {
            // The message is built with a null-safe fallback on purpose.
            // abort_unless arguments are all evaluated before the call, so
            // interpolating $module->value here would raise a property access
            // error on every module-less check rather than only on the typo
            // it is meant to report.
            abort_if(
                $module !== null,
                500,
                sprintf('Unknown module [%s].', $module ?? ''),
            );
        } else {
            abort_unless(
                array_key_exists($moduleEnum->value, config('tibadesk.modules', [])),
                500,
                sprintf('Unknown module [%s].', $moduleEnum->value),
            );
        }

        abort_unless(
            $user->canPerform($capability, $moduleEnum),
            403,
            "Your role does not allow [{$capability}].",
        );

        return $next($request);
    }
}
