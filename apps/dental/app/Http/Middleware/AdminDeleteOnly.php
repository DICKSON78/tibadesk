<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminDeleteOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethod('DELETE')) {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], Response::HTTP_UNAUTHORIZED);
            }

            if (!$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only administrators are allowed to delete data.'
                ], Response::HTTP_FORBIDDEN);
            }
        }

        return $next($request);
    }
}
