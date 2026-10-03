<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPrivilege
{
    public function handle(Request $request, Closure $next, ...$privileges)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->is_admin) {
            return $next($request);
        }

        $requiredPrivileges = array_map('trim', $privileges);

        $hasPrivilege = $user->privileges()
            ->whereIn('privilege', $requiredPrivileges)
            ->exists();

        if ($hasPrivilege) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized. Required: ' . implode(' or ', $requiredPrivileges),
        ], 403);
    }
}
