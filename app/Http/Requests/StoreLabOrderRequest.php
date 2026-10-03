<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabOrderRequest extends FormRequest
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
            'lab_test_ids' => ['required', 'array', 'min:1', 'max:50'],
            'lab_test_ids.*' => ['integer', 'exists:lab_tests,id'],
            'priority' => ['nullable', 'string', 'in:routine,urgent,stat'],
            'clinical_notes' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
