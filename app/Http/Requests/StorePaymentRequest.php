<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
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
            'amount' => ['required', 'integer', 'min:1', 'max:1000000000'],
            'method' => ['required', 'string', 'in:cash,mobile_money,card,bank_transfer,insurance'],
            'reference' => ['nullable', 'string', 'max:120'],
        ];
    }
}
