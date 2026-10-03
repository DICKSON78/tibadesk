<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDentalProcedureRequest extends FormRequest
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
            'procedures' => ['required', 'array', 'min:1', 'max:32'],
            'procedures.*.code' => ['nullable', 'string', 'max:40'],
            'procedures.*.name' => ['required', 'string', 'max:255'],
            'procedures.*.tooth_number' => ['nullable', 'integer', 'between:11,48'],
            'procedures.*.surfaces' => ['nullable', 'array', 'max:6'],
            'procedures.*.quoted_price' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'procedures.*.notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
