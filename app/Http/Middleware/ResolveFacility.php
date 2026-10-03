<?php

namespace App\Http\Middleware;

use App\Support\Tenancy\CurrentFacility;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveFacility
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * Bind the facility this request is working for.
     *
     * The facility comes from the signed-in user's own row, never from a
     * parameter, so a client cannot ask for another facility's data by
     * editing a URL. Platform staff have no facility and are left unbound,
     * which makes every scoped query return nothing for them.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $this->current->set($user?->facility);

        return $next($request);
    }
}
