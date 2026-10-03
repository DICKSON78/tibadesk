<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabResultRequest extends FormRequest
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
            'result_value' => ['nullable', 'numeric'],
            'result_text' => ['nullable', 'string', 'max:4000'],
            'result_flag' => ['nullable', 'string', 'in:normal,low,high,critical'],
            'result_notes' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
