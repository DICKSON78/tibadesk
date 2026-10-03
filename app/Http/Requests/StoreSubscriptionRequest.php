<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriptionRequest extends FormRequest
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
        return [
            'edition' => ['required', 'string', Rule::in(array_keys(config('tibadesk.editions')))],
            'licence_term' => [
                'required',
                'string',
                Rule::in(array_column(config('tibadesk.licence_terms'), 'key')),
            ],
            'customer_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'facility_name' => ['required', 'string', 'max:255'],
            'tin' => ['nullable', 'string', 'max:64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'edition.in' => 'That package is not available.',
            'email.email' => 'Enter a valid email address.',
        ];
    }
}
