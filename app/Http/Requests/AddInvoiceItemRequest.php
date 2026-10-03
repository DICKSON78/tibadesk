<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddInvoiceItemRequest extends FormRequest
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
            'service_price_ids' => ['required_without:description', 'array', 'min:1', 'max:50'],
            'service_price_ids.*' => ['integer', 'exists:service_prices,id'],
            'description' => ['required_without:service_price_ids', 'string', 'max:255'],
            'unit_price' => ['required_with:description', 'integer', 'min:0', 'max:1000000000'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'module' => ['nullable', 'string', 'max:40'],
        ];
    }
}
