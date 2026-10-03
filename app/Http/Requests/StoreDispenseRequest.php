<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDispenseRequest extends FormRequest
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
            'prescription' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required_without:prescription', 'array', 'min:1', 'max:100'],
            'items.*.medicine_id' => ['required', 'integer', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }
}
