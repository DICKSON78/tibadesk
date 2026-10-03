<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Clinic;
use App\Models\Department;
use App\Models\Preference;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; // Added DB facade
use App\Models\User; // Added User model

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        // Set very aggressive timeout to prevent hanging
        set_time_limit(15);
        ini_set('max_execution_time', 15);

        try {
            // Quick database connection test with timeout
            $pdo = null;
            try {
                $pdo = DB::connection()->getPdo();
                if (!$pdo) {
                    throw new \Exception('Database connection failed');
                }
            } catch (\Exception $e) {
                return $this->sendResponse(
                    null,
                    Response::HTTP_SERVICE_UNAVAILABLE,
                    'Database connection failed. Please check your database configuration.'
                );
            }

            $credentials = $request->only('username', 'password');

            // Use a more direct approach to check user
            $user = User::where('username', $credentials['username'])
                       ->where('status', 'Active')
                       ->first();

            if (!$user) {
                return $this->sendResponse(
                    null,
                    Response::HTTP_UNAUTHORIZED,
                    'User not found or inactive.'
                );
            }

            // Check password manually
            if (!Hash::check($credentials['password'], $user->password)) {
                return $this->sendResponse(
                    null,
                    Response::HTTP_UNAUTHORIZED,
                    'Incorrect password.'
                );
            }

            // Login the user
            Auth::login($user);

            // Create token
            $token = $user->createToken('MyApp', ['*'], now()->addDays(7))->plainTextToken;

            // Eager-load relations commonly needed on the client
            $user->load(['department', 'job_title', 'clinic']);

            // Attach clinic preferences if clinic exists
            if ($user->clinic) {
                $user->clinic->preferences = Preference::where('clinic_id', $user->clinic->id)
                    ->get(['id', 'clinic_id', 'key', 'value']);
            } else {
                $user->clinic = new \stdClass();
                $user->clinic->preferences = collect();
            }

            // Build normalized privileges object: { key: true }
            $privilegeKeys = UserPrivilege::where('user_id', $user->id)
                ->pluck('privilege')
                ->toArray();
            $normalized = new \stdClass();
            foreach ($privilegeKeys as $key) {
                // Only set truthy flags; frontend treats true/1/"1" equivalently
                $normalized->$key = true;
            }
            $user->privileges = $normalized;

            return $this->sendResponse([
                'token' => $token,
                'user' => $user
            ], Response::HTTP_OK, 'Logged in successfully.');

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error during login: ' . $e->getMessage());
            return $this->sendResponse(
                null,
                Response::HTTP_SERVICE_UNAVAILABLE,
                'Database error. Please try again.'
            );
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return $this->sendResponse(
                null,
                Response::HTTP_INTERNAL_SERVER_ERROR,
                'An error occurred during login. Please try again.'
            );
        }
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required',
        ]);

        $user = $request->user();

        if (Hash::check($request->current_password, $user->password)) {
            $user->password = Hash::make($request->new_password);
            $user->save();

            return $this->sendResponse($user, Response::HTTP_OK, 'Password changed successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Incorrect current password.'
        );
    }

    public function getAuthUser(Request $request)
    {
        $user = $request->user();
        
        // Use eager loading to reduce database queries
        $user->load(['department', 'job_title', 'clinic']);
        
        // Load clinic preferences only if clinic exists
        if ($user->clinic) {
            $user->clinic->preferences = Preference::where('clinic_id', $user->clinic->id)
                ->get(['id', 'clinic_id', 'key', 'value']);
        } else {
            $user->clinic = new \stdClass();
            $user->clinic->preferences = collect();
        }
        
        // Optimize user privileges query
        $user_privileges = UserPrivilege::where('user_id', $user->id)
            ->pluck('privilege')
            ->toArray();

        $user->privileges = new \stdClass();
        foreach ($user_privileges as $privilege) {
            $user->privileges->$privilege = true;
        }

        return $this->sendResponse($user, Response::HTTP_OK, 'Success.');
    }
}
