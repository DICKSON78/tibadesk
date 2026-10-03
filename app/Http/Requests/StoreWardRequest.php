<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWardRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:40'],
            'name' => ['required', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:2000'],
            'beds' => ['nullable', 'array', 'max:200'],
            'beds.*.bed_number' => ['required', 'string', 'max:20'],
            'beds.*.daily_rate' => ['nullable', 'integer', 'min:0', 'max:100000000'],
        ];
    }
}
