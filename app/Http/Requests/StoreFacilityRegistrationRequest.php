<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFacilityRegistrationRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'facility_name' => ['required', 'string', 'max:160'],
            'facility_type' => ['required', 'string', Rule::in(self::facilityTypes())],
            'edition' => ['required', 'string', Rule::in(array_keys(config('tibadesk.editions')))],
            'licence_term' => ['required', 'string', Rule::in(self::licenceTermKeys())],
            'contact_name' => ['required', 'string', 'max:120'],
            'contact_email' => ['required', 'string', 'email:filter', 'max:180'],
            'contact_phone' => ['required', 'string', 'max:40'],
            'username' => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('facility_registrations', 'username')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'facility_name.required' => 'Enter the name your facility trades under.',
            'facility_type.in' => 'Choose the kind of facility you run.',
            'edition.in' => 'Choose one of the TibaDesk editions.',
            'licence_term.in' => 'Choose how long you need the licence for.',
            'contact_email.email' => 'Enter a valid email address so we can reply to you.',
            'contact_phone.required' => 'Enter a phone number we can reach you on.',
            'username.alpha_dash' => 'Use letters, numbers, dots, dashes and underscores only.',
            'username.unique' => 'That username is already taken. Try another one.',
            'password.min' => 'Use at least 8 characters for the password.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_map(
            static fn (mixed $value): mixed => is_string($value) ? trim($value) : $value,
            $this->only([
                'facility_name',
                'facility_type',
                'edition',
                'licence_term',
                'contact_name',
                'contact_email',
                'contact_phone',
                'username',
            ]),
        ));
    }

    /**
     * A bot that fills the hidden field is answered as though it succeeded, so
     * it learns nothing, but nothing is stored and no mail is sent.
     */
    public function looksAutomated(): bool
    {
        return $this->filled('website');
    }

    /**
     * The catalogue keeps licence terms as a list, so the selectable value is
     * the `key` inside each entry, not the array index.
     *
     * @return list<string>
     */
    public static function licenceTermKeys(): array
    {
        return array_column(config('tibadesk.licence_terms'), 'key');
    }

    /**
     * The facility kinds a health ERP applicant can pick. Deliberately a plain
     * list rather than a model: this describes the applicant, not a facility we
     * have onboarded, and the team may need to add one without a release.
     *
     * @return list<string>
     */
    public static function facilityTypes(): array
    {
        return [
            'single_specialist',
            'clinic',
            'polyclinic',
            'hospital',
            'diagnostic_centre',
            'dental',
            'eye',
            'pharmacy',
        ];
    }
}
