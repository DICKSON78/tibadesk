<?php

namespace App\Pharmacy\Http\Requests;

use App\Pharmacy\Models\MedicineWriteoff;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Taking stock off the books without it leaving the building: expired,
 * damaged, contaminated, stolen or mislaid.
 */
class StoreWriteoffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'medicine_batch_id' => ['required', 'integer'],
            'location_id' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            // The reason is a property of the write-off, so the list comes from
            // the model that owns it rather than being restated here.
            'reason' => ['required', Rule::in(array_keys(MedicineWriteoff::reasons()))],
            'disposal_method' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'medicine_batch_id' => 'batch',
            'location_id' => 'stock location',
        ];
    }
}
