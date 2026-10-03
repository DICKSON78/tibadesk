<?php

namespace App\Support\TibadeskSso;

use App\Models\Pharmacy;
use App\Models\User;
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
 * by mapping, and a password nobody knows. Anything beyond that is granted
 * here, in this application, by someone who works here.
 */
class SsoUserResolver
{
    public function resolve(SsoAssertion $assertion): User
    {
        $user = User::where('tibadesk_id', $assertion->subject())->first();

        if ($user === null) {
            return $this->provision($assertion);
        }

        // Suspension is this application's decision, and it is the one that
        // matters here. TibaDesk governs which of its staff may open this
        // package; whether an account inside this package has been deactivated
        // is a fact only this application holds. The local sign-in already
        // refuses a deactivated account, so letting an assertion past would
        // leave deactivation as something a suspended user simply walks around
        // by arriving through the front door instead of the usual one.
        if (! $user->is_active) {
            throw new RuntimeException(
                'The account is deactivated in this application and cannot be signed in through TibaDesk.',
            );
        }

        $this->refresh($user, $assertion);

        return $user;
    }

    private function provision(SsoAssertion $assertion): User
    {
        $user = User::create([
            'tibadesk_id' => $assertion->subject(),
            'tibadesk_synced_at' => now(),
            'current_pharmacy_id' => $pharmacyId = $this->pharmacyId(),
            'name' => $assertion->name() ?: 'TibaDesk User',
            'email' => $assertion->email(),
            'phone' => $this->placeholderPhone(),
            'role' => $this->localRole($assertion->role()),

            // The employee code staff are identified by on the floor and in
            // dispensing records. It is required by the users table, and the
            // model's own generator is the right one to use here so a code
            // minted for a TibaDesk user is indistinguishable from a local one.
            'user_code' => User::generateUserCode(),

            // Active and verified, because TibaDesk has already established
            // both. This is not a self-service registration that has skipped
            // the checks — it is an account the organisation already vouched
            // for, arriving from the system that vouched for it.
            'is_active' => true,
            'is_verified' => true,

            // No usable password, deliberately. This account exists because
            // TibaDesk vouched for it, so there is no secret here that could be
            // guessed, phished, or reused from another system. Signing in
            // locally means resetting one first.
            'password' => Str::random(48),
        ]);

        // Membership is what every scoped screen asks about, and it is a
        // separate fact from the selected pharmacy. Setting current_pharmacy_id
        // alone left the account able to sign in and then be refused by every
        // route behind the pharmacy scope — the pivot row is what those routes
        // read, and without it a TibaDesk user landed in an application that
        // rendered and then refused to show them anything.
        $user->pharmacy()->syncWithoutDetaching([$pharmacyId]);

        return $user;
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
     *
     * Pharmacy membership is repaired rather than refreshed, because it is the
     * one field an account can reach a sign-in without and still be refused
     * everywhere afterwards for. Anyone provisioned before membership was
     * recorded is corrected on their next arrival instead of being left
     * permanently unable to use the application they just signed into.
     */
    private function refresh(User $user, SsoAssertion $assertion): void
    {
        $user->forceFill([
            'tibadesk_synced_at' => now(),
            'name' => $assertion->name() ?: $user->name,
            'email' => $assertion->email(),
        ])->save();

        $pharmacyId = $user->resolveCurrentPharmacyId() ?? $this->pharmacyId();

        if ($user->pharmacy()->where('pharmacies.id', $pharmacyId)->doesntExist()) {
            $user->pharmacy()->syncWithoutDetaching([$pharmacyId]);
        }
    }

    /**
     * The pharmacy a user arriving from TibaDesk belongs to.
     *
     * This application is scoped to a single pharmacy, so which one is
     * configuration rather than something derived from the assertion. If it is
     * named but missing, that is a deployment mistake worth failing on:
     * silently creating a second pharmacy would split the business's stock and
     * sales data in half, which is far worse than refusing the sign-in.
     */
    private function pharmacyId(): int
    {
        $configured = config('tibadesk_sso.pharmacy');

        if (filled($configured)) {
            $pharmacy = Pharmacy::where('pharmacy_name', $configured)
                ->orWhere('pharmacy_code', $configured)
                ->orWhere('id', $configured)
                ->first();

            if ($pharmacy === null) {
                throw new RuntimeException(
                    "TibaDesk sign-in is configured for pharmacy [{$configured}], which does not exist."
                );
            }

            return (int) $pharmacy->id;
        }

        $pharmacy = Pharmacy::query()->orderBy('id')->first();

        if ($pharmacy === null) {
            throw new RuntimeException(
                'TibaDesk sign-in needs a pharmacy to place users in, and this application has none.'
            );
        }

        return (int) $pharmacy->id;
    }

    /**
     * Map a TibaDesk role onto a local one, defaulting to the narrowest.
     */
    private function localRole(string $tibadeskRole): string
    {
        $map = config('tibadesk_sso.role_map', []);

        return $map[$tibadeskRole] ?? config('tibadesk_sso.default_role', 'cashier');
    }

    /**
     * The registration form requires a phone number, and this application's
     * user table does too. TibaDesk does not send one, so a unique stand-in is
     * generated rather than leaving a required field empty or inventing a
     * number that might belong to somebody.
     */
    private function placeholderPhone(): string
    {
        do {
            $phone = '0'.fake()->unique()->numerify('#########');
        } while (User::where('phone', $phone)->exists());

        return $phone;
    }
}
