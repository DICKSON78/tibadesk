<?php

use App\Http\Middleware\EnsureCapability;
use App\Http\Middleware\EnsureLicenceWritable;
use App\Http\Middleware\EnsureModuleEnabled;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ResolveFacility;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            // Applied inside the authenticated route group rather than
            // prepended to the whole API stack: it reads $request->user(), so
            // it has to run after auth:sanctum has identified the caller.
            // Running it first would bind nothing and every scoped query would
            // quietly return zero rows.
            'facility' => ResolveFacility::class,
            'module' => EnsureModuleEnabled::class,
            'capability' => EnsureCapability::class,
            'licence' => EnsureLicenceWritable::class,
        ]);

        // The tenant has to be bound before a route's {patient} or {encounter}
        // is looked up, and the framework does not do that on its own.
        //
        // SubstituteBindings is in the default priority list, ahead of any route
        // middleware, so it resolved the model while CurrentFacility was still
        // empty. The FacilityScope global scope then filtered on a null facility,
        // matched nothing, and every one of those routes answered 404 for every
        // caller. It looked correct from the outside, because the tenant
        // isolation test asserts that somebody else's patient is a 404 and got
        // one — for the wrong reason, and so did their own.
        //
        // Placed here rather than as a route middleware because a route
        // middleware would be gathered after SubstituteBindings and would still
        // run too late. Auth stays ahead of this in the same list, so the caller
        // is identified before their facility is read.
        $middleware->prependToPriorityList(
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            ResolveFacility::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
