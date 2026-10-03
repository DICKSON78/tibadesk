<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email:filter', 'max:180'],
            'phone' => ['required', 'string', 'max:40'],
            'facility' => ['nullable', 'string', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:4000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.email' => 'Enter a valid email address so we can reply to you.',
            'phone.required' => 'Enter a phone number we can reach you on.',
            'message.min' => 'Please add a little more detail to your message.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_map(
            static fn (mixed $value): mixed => is_string($value) ? trim($value) : $value,
            $this->only(['name', 'email', 'phone', 'facility', 'message']),
        ));
    }

    /**
     * A bot that fills the hidden field is answered as though it succeeded, so
     * it learns nothing, but nothing is stored and no mail is sent.
     */
    public function looksAutomated(): bool
    {
        return $this->filled('website');
    }
}
