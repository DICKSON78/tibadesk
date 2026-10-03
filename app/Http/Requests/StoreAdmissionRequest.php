<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmissionRequest extends FormRequest
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
            'bed_id' => ['nullable', 'integer', 'exists:beds,id'],
            'admission_diagnosis' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
