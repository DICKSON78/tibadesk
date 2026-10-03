<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicineRequest extends FormRequest
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
            'generic_name' => ['nullable', 'string', 'max:255'],
            'form' => ['nullable', 'string', 'max:60'],
            'strength' => ['nullable', 'string', 'max:60'],
            'unit' => ['nullable', 'string', 'max:40'],
            'unit_price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'is_active' => ['boolean'],
        ];
    }
}
