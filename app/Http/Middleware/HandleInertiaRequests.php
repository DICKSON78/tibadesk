<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root view that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Data available to every page.
     *
     * The facility and its modules are sent once here rather than asked for on
     * each screen, because the navigation itself is built from them: a clinic
     * without the pharmacy module must not be shown a pharmacy link that will
     * only 403 when it is clicked.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $facility = $user?->facility;

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'initials' => $this->initials($user->name),
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                    'capabilities' => $user->role->capabilities(),
                ],
                'facility' => $facility === null ? null : [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'edition' => $facility->edition->value,
                    'edition_label' => $facility->edition->label(),
                    'status' => $facility->status->value,
                    'licence_expires_at' => $facility->licence_expires_at?->toDateString(),
                    'modules' => $facility->enabledModuleValues(),
                ],
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            // Handy in every screen, and cheap to compute here once.
            'today' => now()->toDateString(),
        ];
    }

    private function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return implode('', array_map(
            static fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)),
            array_slice($parts, 0, 2),
        ));
    }
}
