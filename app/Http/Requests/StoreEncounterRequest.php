<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEncounterRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'type' => ['nullable', Rule::in(['opd', 'inpatient', 'emergency', 'day_case', 'home_visit'])],
            'payment_mode' => ['nullable', Rule::in(['cash', 'insurance', 'credit', 'mobile_money', 'bank_transfer', 'card'])],
            'reason_for_visit' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:120'],
            'referred_by' => ['nullable', 'string', 'max:160'],
            'clinician_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'patient_id.exists' => 'That patient is not registered at this facility.',
        ];
    }
}
