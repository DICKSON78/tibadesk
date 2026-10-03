<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        try {
            /*
             * A facility no longer comes into existence through this application.
             * Registering a pharmacy owner here would mint a facility, and with
             * it a subscription the TibaDesk catalogue never sold, without anyone
             * at KADETECH agreeing to it. Facilities register on the TibaDesk
             * public site, which is where the licence is actually issued from.
             *
             * The rejection is explicit rather than a silent 422, because the
             * pharmacy dashboard has an owner registration form that posts here
             * and shows the message it is given.
             */
            if ($request->input('role') === 'owner') {
                return response()->json([
                    'message' => 'Facilities register through TibaDesk, not from here. '
                        .'Please create your TibaDesk account and select your package there.',
                ], 403);
            }

            $rules = [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20',
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'role' => 'required|in:pharmacist,cashier,delivery,customer',
            ];

            $validated = $request->validate($rules);

            $userCode = User::generateUserCode();

            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'role' => $validated['role'],
                'user_code' => $userCode,
                'password' => Hash::make($validated['password']),
                'is_active' => true,
            ]);

            $pharmacy = null;
            $pharmacies = [];

            $token = $user->createToken('auth-token')->plainTextToken;

            DB::commit();

            $user->accessible_pharmacies = $user->accessiblePharmacies();

            return response()->json([
                'message' => 'Registration successful.',
                'user' => $user->load('pharmacy'),
                'pharmacy' => $pharmacy,
                'pharmacies' => $pharmacies,
                'token' => $token,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Registration failed.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'login' => 'required|string',
                'password' => 'required|string',
            ]);

            $login = $request->input('login');
            $password = $request->input('password');

            $query = User::where(function ($q) use ($login) {
                $q->where('email', $login)->orWhere('phone', $login);
            });

            $user = $query->first();

            if (! $user || ! Hash::check($password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            if (! $user->is_active) {
                return response()->json([
                    'message' => 'Your account has been deactivated. Please contact support.',
                ], 403);
            }

            if (! $user->current_pharmacy_id) {
                $user->update(['current_pharmacy_id' => $user->resolveCurrentPharmacyId()]);
                $user->refresh();
            }

            $pharmacyId = $user->resolveCurrentPharmacyId();
            $pharmacy = $pharmacyId ? Pharmacy::find($pharmacyId) : null;
            $appStatus = null;
            $subscriptionInfo = null;

            if ($pharmacy) {
                $appStatus = $pharmacy->application_status;
                $subscriptionPlan = $pharmacy->subscriptions()->latest('id')->value('plan');

                $subscriptionInfo = [
                    'application_status' => $appStatus,
                    'subscription_type' => $pharmacy->subscriptionType(),
                    'days_remaining' => $pharmacy->daysRemaining(),
                    'trial_ends_at' => $pharmacy->trial_ends_at?->toISOString(),
                    'subscription_end_date' => $pharmacy->subscription_end_date?->toISOString(),
                    'payment_status' => $pharmacy->payment_status,
                    'plan' => $subscriptionPlan,
                ];

                if ($appStatus === 'rejected') {
                    return response()->json([
                        'message' => 'Your application has been rejected.',
                        'rejection_reason' => $pharmacy->rejection_reason,
                        'application_status' => 'rejected',
                    ], 403);
                }

                if ($appStatus === 'pending' || $appStatus === 'approved') {
                    if ($pharmacy->payment_status !== 'paid') {
                        $subscriptionInfo['requires_payment'] = true;
                    }
                    if ($appStatus === 'pending') {
                        $subscriptionInfo['pending_approval'] = true;
                    }
                }
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful.',
                'user' => $user->load('pharmacy', 'currentPharmacy'),
                'token' => $token,
                'subscription' => $subscriptionInfo,
                'email_verified' => $user->email_verified_at !== null,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user->current_pharmacy_id) {
                $user->update(['current_pharmacy_id' => $user->resolveCurrentPharmacyId()]);
                $user->refresh();
            }

            $user->load('pharmacy', 'currentPharmacy');
            $user->accessible_pharmacies = $user->accessiblePharmacies();

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve user.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    public function changePassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $user = $request->user();

            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }

            $user->update(['password' => Hash::make($validated['password'])]);

            return response()->json(['message' => 'Password changed successfully.']);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to change password.', 'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.'], 500);
        }
    }

    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'photo' => 'sometimes|nullable|string|max:255',
                'location' => 'sometimes|nullable|string|max:255',
                'street' => 'sometimes|nullable|string|max:255',
                'road' => 'sometimes|nullable|string|max:255',
                'email' => 'sometimes|email|unique:users,email,'.$user->id,
                'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            ]);

            if (isset($validated['password']) && $validated['password']) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'message' => 'Profile updated successfully.',
                'user' => $user->fresh()->load('pharmacy'),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }
}
