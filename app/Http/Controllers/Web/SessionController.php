<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Session sign-in for the staff application.
 *
 * The page is TibaDesk's own branded sign-in, matching the marketing site
 * exactly, because the website is the front door and proxies here; a tenant
 * who lands directly on the mounted dashboard must not see a different product
 * from the one they signed up on.
 */
class SessionController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user() !== null) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login', [
            'email' => null,
            'contact' => config('tibadesk.support'),
        ]);
    }

    /**
     * A CSRF token for the session, minted whether or not anyone is signed in.
     *
     * The marketing site proxies this application's sign-in form, so it needs
     * a token bound to a session it can then post back here. It used to scrape
     * one out of the rendered login page, which quietly stopped working the
     * moment the visitor already had a session: /login then redirects, there
     * is no form left to read, and the site's login screen broke for anyone
     * whose cookie was still valid. A token is a property of the session, not
     * of a particular page, so it is asked for directly here.
     */
    public function token(Request $request): JsonResponse
    {
        return response()->json([
            'token' => $request->session()->token(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email:filter', 'max:180'],
            'password' => ['required', 'string', 'max:200'],
        ]);

        $user = User::query()
            ->with('facility')
            ->where('email', mb_strtolower(trim($credentials['email'])))
            ->first();

        // The same message either way, so the form cannot be used to find out
        // which addresses are registered.
        if ($user === null || ! Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ], $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        if (! $user->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'This account is disabled. Contact your administrator.',
            ]);
        }

        if ($user->facility !== null && ! $user->canWork()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'This facility is not currently active. Contact TibaDesk support.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
