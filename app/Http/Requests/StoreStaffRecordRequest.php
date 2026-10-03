<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRecordRequest extends FormRequest
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
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'staff_number' => ['required', 'string', 'max:40'],
            'full_name' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:80'],
            'designation' => ['nullable', 'string', 'max:80'],
            'employment_type' => ['nullable', 'string', 'in:full_time,part_time,contract,locum'],
            'hired_on' => ['nullable', 'date'],
            'monthly_salary' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'phone' => ['nullable', 'string', 'max:40'],
            'is_active' => ['boolean'],
        ];
    }
}
