<?php

namespace App\Support\TibadeskSso;

use App\Models\Clinic;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Turns a verified TibaDesk assertion into a local user.
 *
 * The link between the two applications is an id, not an email address. Email
 * is editable in both, so a user who changes it would come back as a different
 * person — or as nobody — and a second account would be provisioned for them
 * instead. The id is stable on both sides and is what the assertion carries.
 *
 * A user who has never signed in through TibaDesk is provisioned on first
 * arrival, because making an administrator create the account by hand before a
 * user can reach the application would defeat the point of the mount. What
 * they get is deliberately the narrowest useful account: a local role chosen
 * by mapping, and no privileges. Anything beyond that is granted here, in this
 * application, by someone who works here.
 */
class SsoUserResolver
{
    public function resolve(SsoAssertion $assertion): User
    {
        $user = User::where('tibadesk_id', $assertion->subject())->first();

        if ($user === null) {
            return $this->provision($assertion);
        }

        $this->refresh($user, $assertion);

        $this->ensureBaselinePrivileges($user);

        return $user;
    }

    private function provision(SsoAssertion $assertion): User
    {
        $names = $this->splitName($assertion->name());

        $user = User::create([
            'tibadesk_id' => $assertion->subject(),
            'tibadesk_synced_at' => now(),
            'clinic_id' => $this->clinicId(),
            'first_name' => $names['first'],
            'last_name' => $names['last'],
            'email' => $assertion->email(),
            'username' => $this->uniqueUsername($assertion->email()),
            'role' => $this->localRole($assertion->role()),

            // No usable password, deliberately. This account was created
            // because TibaDesk vouched for it, so there is no secret here that
            // could be guessed, phished or reused from another system. Signing
            // in locally means resetting one first.
            'password' => Str::random(48),
            'status' => 'Active',
        ]);

        $this->ensureBaselinePrivileges($user);

        return $user;
    }

    /**
     * Give a user the modules their role needs, if they hold none at all.
     *
     * Only applied when the account has no privileges. A user who already has
     * some has been set up by somebody here, and re-deriving the set on every
     * sign-in would quietly undo their adjustments — the same reason the role is
     * left alone in refresh(). It also means a user an administrator has
     * deliberately stripped of everything is not quietly handed it all back on
     * their next visit.
     */
    private function ensureBaselinePrivileges(User $user): void
    {
        if (UserPrivilege::where('user_id', $user->id)->exists()) {
            return;
        }

        $privileges = config('tibadesk_sso.privileges', []);

        $baseline = $privileges[$user->role] ?? config('tibadesk_sso.default_privileges', []);

        foreach ($baseline as $privilege) {
            UserPrivilege::create([
                'user_id' => $user->id,
                'privilege' => $privilege,
            ]);
        }
    }

    /**
     * Keep the local copy of a TibaDesk user's details current.
     *
     * Name and email are refreshed because TibaDesk is where they are now
     * authoritative — a user correcting their own name in TibaDesk should not
     * have to remember to correct it in three places. The role is not: it was
     * chosen once from a mapping, and silently re-deriving it on every sign-in
     * would undo an administrator's local adjustment the next time the user
     * opened the application.
     */
    private function refresh(User $user, SsoAssertion $assertion): void
    {
        $names = $this->splitName($assertion->name());

        $user->forceFill([
            'tibadesk_synced_at' => now(),
            'first_name' => $names['first'],
            'last_name' => $names['last'],
            'email' => $assertion->email(),
        ])->save();
    }

    /**
     * The clinic a user arriving from TibaDesk belongs to.
     *
     * This application is scoped to one clinic, so the clinic is configuration
     * rather than something derived from the assertion. If it is named but
     * missing, that is a deployment mistake worth failing on: silently creating
     * a second clinic would split the practice's data in half, which is far
     * worse than refusing the sign-in.
     */
    private function clinicId(): int
    {
        $configured = config('tibadesk_sso.clinic');

        if (filled($configured)) {
            $clinic = Clinic::where('name', $configured)->orWhere('id', $configured)->first();

            if ($clinic === null) {
                throw new RuntimeException(
                    "TibaDesk sign-in is configured for clinic [{$configured}], which does not exist."
                );
            }

            return (int) $clinic->id;
        }

        $clinic = Clinic::query()->orderBy('id')->first();

        if ($clinic === null) {
            throw new RuntimeException(
                'TibaDesk sign-in needs a clinic to place users in, and this application has none.'
            );
        }

        return (int) $clinic->id;
    }

    /**
     * Map a TibaDesk role onto a local one, defaulting to the narrowest.
     */
    private function localRole(string $tibadeskRole): string
    {
        $map = config('tibadesk_sso.role_map', []);

        return $map[$tibadeskRole] ?? config('tibadesk_sso.default_role', 'Receptionist');
    }

    /**
     * Local sign-in names are unique, and an email is not guaranteed to be one
     * a person can type, so a collision gets a suffix rather than an error.
     */
    private function uniqueUsername(string $email): string
    {
        $base = Str::slug(Str::before($email, '@'));

        if ($base === '') {
            $base = 'user';
        }

        $username = $base;
        $suffix = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base.'-'.$suffix++;
        }

        return $username;
    }

    /**
     * @return array{first: string, last: string}
     */
    private function splitName(string $name): array
    {
        $name = trim($name);

        if ($name === '') {
            return ['first' => 'TibaDesk', 'last' => 'User'];
        }

        $parts = preg_split('/\s+/', $name) ?: [$name];
        $first = array_shift($parts);

        return [
            'first' => $first,
            'last' => $parts === [] ? $first : implode(' ', $parts),
        ];
    }
}
