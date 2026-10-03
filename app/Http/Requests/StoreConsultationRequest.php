<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultationRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Whether this submit should also sign the consultation off.
     */
    public function completesTheConsultation(): bool
    {
        return $this->boolean('complete');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'chief_complaint' => ['nullable', 'string', 'max:255'],
            'history_present_illness' => ['nullable', 'string', 'max:8000'],
            'past_medical_history' => ['nullable', 'string', 'max:8000'],
            'drug_history' => ['nullable', 'string', 'max:8000'],
            'family_history' => ['nullable', 'string', 'max:8000'],
            'allergy_history' => ['nullable', 'string', 'max:8000'],
            'general_health' => ['nullable', 'string', 'max:8000'],
            'examination' => ['nullable', 'string', 'max:8000'],
            'clinical_notes' => ['nullable', 'string', 'max:8000'],
            'plan' => ['nullable', 'string', 'max:8000'],
            'remarks' => ['nullable', 'string', 'max:8000'],
            // One submit either saves or saves-and-signs, so a clinician
            // cannot lose what they typed by picking the wrong button.
            'complete' => ['sometimes', 'boolean'],
            'diagnoses' => ['sometimes', 'array', 'max:20'],
            'diagnoses.*.description' => ['required', 'string', 'max:255'],
            'diagnoses.*.code' => ['nullable', 'string', 'max:32'],
            'diagnoses.*.type' => ['nullable', Rule::in(['preliminary', 'principal', 'additional'])],
            'prescriptions' => ['sometimes', 'array', 'max:50'],
            'prescriptions.*.medicine' => ['required', 'string', 'max:255'],
            'prescriptions.*.dose' => ['nullable', 'string', 'max:80'],
            'prescriptions.*.route' => ['nullable', 'string', 'max:40'],
            'prescriptions.*.frequency' => ['nullable', 'string', 'max:80'],
            'prescriptions.*.duration' => ['nullable', 'string', 'max:80'],
            'prescriptions.*.instructions' => ['nullable', 'string', 'max:2000'],
            'prescriptions.*.quantity' => ['nullable', 'integer', 'min:1', 'max:10000'],
        ];
    }
}
