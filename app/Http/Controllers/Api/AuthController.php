<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Sign-in for facility staff.
 *
 * The email is the login name and it is globally unique, so one sign-in
 * resolves to exactly one facility. The password is never returned in any
 * payload, and a suspended or expired facility is refused at the door rather
 * than after the user is already inside.
 */
class AuthController extends Controller
{
    public function __construct(private readonly CurrentFacility $current) {}

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email:filter', 'max:180'],
            'password' => ['required', 'string', 'max:200'],
        ]);

        $user = User::query()
            ->with('facility')
            ->where('email', mb_strtolower(trim($credentials['email'])))
            ->first();

        // One message for "no such account" and "wrong password" alike, so the
        // form cannot be used to discover which addresses are registered.
        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('These credentials do not match our records.'),
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => __('This account is disabled. Contact your administrator.'),
            ]);
        }

        if ($user->facility !== null && ! $user->canWork()) {
            throw ValidationException::withMessages([
                'email' => __('This facility is not currently active. Contact TibaDesk support.'),
            ]);
        }

        // Rebind the request to the tenant this account belongs to, so the
        // global scope has a facility for the rest of the request.
        $this->current->set($user->facility);

        return response()->json([
            'token' => $user->createToken($request->userAgent() ?: 'tibadesk')->plainTextToken,
            'user' => $this->payload($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('facility');

        return response()->json(['user' => $this->payload($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Revoking only the token the caller presented keeps one signed-out
        // browser from logging every other device out of the same account.
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'capabilities' => $user->role->capabilities(),
            'is_platform_staff' => $user->isPlatformStaff(),
            'facility' => $user->facility === null ? null : [
                'id' => $user->facility->id,
                'name' => $user->facility->name,
                'edition' => $user->facility->edition->value,
                'status' => $user->facility->status->value,
                'modules' => $user->facility->enabledModuleValues(),
                'licence_expires_at' => $user->facility->licence_expires_at?->toDateString(),
                // Carried here so the interface can say why a save is being
                // refused, rather than letting the user discover it by
                // watching buttons come back with a 402.
                'read_only' => $user->facility->isReadOnly(),
            ],
        ];
    }
}
