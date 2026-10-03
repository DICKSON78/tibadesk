<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function authorize(): bool
    {
        // Authorisation is the route's middleware: it already proved this
        // facility holds the registration module and this role may register.
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:120'],
            'middle_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'string', 'email:filter', 'max:180'],
            'address' => ['nullable', 'string', 'max:255'],
            'next_of_kin_name' => ['nullable', 'string', 'max:160'],
            'next_of_kin_phone' => ['nullable', 'string', 'max:40'],
            'next_of_kin_relationship' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:4000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'Enter the patient’s first name.',
            'date_of_birth.before' => 'A date of birth cannot be in the future.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_map(
            static fn (mixed $value): mixed => is_string($value) ? trim($value) : $value,
            $this->only([
                'first_name',
                'middle_name',
                'last_name',
                'gender',
                'phone',
                'email',
                'address',
                'next_of_kin_name',
                'next_of_kin_phone',
                'next_of_kin_relationship',
            ]),
        ));
    }
}
