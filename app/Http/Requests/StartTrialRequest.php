<?php

namespace App\Http\Requests;

use App\Enums\Edition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * The public door into a trial, and the only unauthenticated request in the
 * system that creates a tenant of its own accord.
 *
 * Everything here is a guard rather than a nicety. The route is open to anyone
 * on the internet, so an endpoint that writes a database row, a user with a
 * password, and a set of module grants is an endpoint that will be found and
 * used to make rubbish. The rules are therefore split into two kinds: what has
 * to be true for the request to make sense, and what keeps one person from
 * opening a hundred facilities.
 */
class StartTrialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $minimum = (int) config('tibadesk.trial.password_min_length');

        return [
            'facility_name' => [
                'required', 'string', 'min:2', 'max:120',
                // Becomes the tenant's URL slug, so it has to survive being
                // slugified; a name of only punctuation would produce nothing.
                'regex:/[\p{L}\p{N}]/u',
            ],

            'edition' => [
                'required', 'string',
                // Only the editions the catalogue offers for trial. Written out
                // as a closure over the config rather than a Rule so that
                // removing an edition from the trial list takes it off the shop
                // floor without touching this file.
                Rule::in(self::triallableEditions()),
            ],

            'owner_name' => ['required', 'string', 'min:2', 'max:120'],

            'owner_email' => [
                'required', 'string', 'email:rfc', 'max:190',
                Rule::unique('users', 'email'),
            ],

            'password' => [
                'required', 'string',
                Password::min($minimum)->letters()->numbers(),
            ],

            'owner_phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'facility_type' => ['nullable', 'string', 'max:80'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'edition.in' => 'That edition is not available to try. Please choose one of the listed options.',
            'owner_email.unique' => 'There is already an account with that email address. Sign in instead, or use a different address.',
        ];
    }

    /**
     * The password is named exactly `password` so that Laravel's own dontFlash
     * list catches it.
     *
     * A validation failure redirects back with the submitted input flashed to
     * the session, and that input is what repopulates the form. Anything not on
     * that list is written to the session and handed to the browser — so a
     * field called `owner_password` sits in the session, plainly readable, every
     * time somebody types a password too short. The name is the protection.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'facility_name' => 'facility name',
            'owner_name' => 'your name',
            'owner_email' => 'email address',
            'password' => 'password',
        ];
    }

    /**
     * The editions a visitor may try, taken from the configuration that the
     * catalogue endpoint also publishes so the two can never disagree about
     * what is on offer.
     *
     * @return list<string>
     */
    public static function triallableEditions(): array
    {
        return array_values(array_filter(
            (array) config('tibadesk.trial.editions', []),
            fn (string $edition): bool => Edition::tryFrom($edition) !== null,
        ));
    }
}
