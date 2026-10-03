<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DischargeAdmissionRequest extends FormRequest
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
            'discharge_summary' => ['nullable', 'string', 'max:8000'],
        ];
    }
}
