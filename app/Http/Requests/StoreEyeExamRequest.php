<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEyeExamRequest extends FormRequest
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
            'od_visual_acuity' => ['nullable', 'string', 'max:20'],
            'os_visual_acuity' => ['nullable', 'string', 'max:20'],
            'od_sphere' => ['nullable', 'numeric', 'between:-30,30'],
            'od_cylinder' => ['nullable', 'numeric', 'between:-10,10'],
            'od_axis' => ['nullable', 'numeric', 'between:0,180'],
            'os_sphere' => ['nullable', 'numeric', 'between:-30,30'],
            'os_cylinder' => ['nullable', 'numeric', 'between:-10,10'],
            'os_axis' => ['nullable', 'numeric', 'between:0,180'],
            'od_iop' => ['nullable', 'numeric', 'between:0,100'],
            'os_iop' => ['nullable', 'numeric', 'between:0,100'],
            'diagnosis' => ['nullable', 'string', 'max:4000'],
            'notes' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
