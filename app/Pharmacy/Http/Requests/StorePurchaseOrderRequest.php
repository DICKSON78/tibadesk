<?php

namespace App\Pharmacy\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Raising a purchase order, optionally booking the delivery in the same call.
 *
 * A pharmacy that is handed a box of stock in one action should not have to
 * raise an order and then immediately receive it, so `receive_now` is a flag
 * on the same request rather than a second round trip.
 */
class StorePurchaseOrderRequest extends FormRequest
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
            'supplier_id' => ['required', 'integer', 'exists:pharmacy_suppliers,id'],
            'expected_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'receive_now' => ['boolean'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['required', 'integer', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'items.*.unit_cost' => ['nullable', 'integer', 'min:0', 'max:100000000'],

            // Only required when the delivery is being booked in now, since a
            // draft order has no batch to name yet.
            'items.*.batch_number' => ['required_if:receive_now,true', 'nullable', 'string', 'max:60'],
            'items.*.expiry_date' => ['required_if:receive_now,true', 'nullable', 'date', 'after:today'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.*.batch_number.required_if' => 'A batch number is required when receiving a delivery.',
            'items.*.expiry_date.required_if' => 'An expiry date is required when receiving a delivery.',
            'items.*.expiry_date.after' => 'A received batch cannot already be expired.',
        ];
    }

    public function wantsToReceiveGoods(): bool
    {
        return $this->boolean('receive_now');
    }

    /**
     * @return array<string, mixed>
     */
    public function orderAttributes(): array
    {
        return [
            'supplier_id' => (int) $this->validated('supplier_id'),
            'expected_on' => $this->validated('expected_on'),
            'notes' => $this->validated('notes'),
            'items' => collect($this->validated('items'))
                ->map(fn (array $item): array => [
                    'medicine_id' => (int) $item['medicine_id'],
                    'quantity' => (int) $item['quantity'],
                    'unit_cost' => (int) ($item['unit_cost'] ?? 0),
                    'batch_number' => $item['batch_number'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null,
                ])
                ->all(),
        ];
    }
}
