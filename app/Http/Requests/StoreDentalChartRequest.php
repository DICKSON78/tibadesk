<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDentalChartRequest extends FormRequest
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
            'teeth' => ['required', 'array', 'min:1', 'max:32'],
            // FDI notation: quadrant 1-4 (upper right, upper left, lower left, lower
            // right) then tooth 1-8, so permanent adult teeth run 11 to 48 and
            // decimals (51+) are a different numbering, not a bigger tooth.
            'teeth.*.tooth_number' => ['required', 'integer', 'between:11,48'],
            'teeth.*.surfaces' => ['nullable', 'array', 'max:6'],
            'teeth.*.surfaces.*' => ['string', 'in:m,o,i,d,b,f,p'],
            'teeth.*.condition' => ['nullable', 'string', 'in:healthy,caries,filling,crown,missing,extracted,root_canal,impacted,trauma'],
            'teeth.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
