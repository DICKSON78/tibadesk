<?php

namespace App\Services\Payments;

use App\Models\SubscriptionOrder;
use Illuminate\Support\Str;

/**
 * Local stand-in for ClickPesa so the whole subscribe, pay, download flow can
 * be exercised without merchant credentials. Never used in production.
 */
class FakePaymentGateway implements PaymentGateway
{
    public function checkoutUrlFor(SubscriptionOrder $order): string
    {
        return url("/checkout/{$order->edition}?reference={$order->reference}&simulate=1");
    }

    public function resolveNotification(array $payload): array
    {
        $reference = $payload['reference'] ?? null;

        abort_if($reference === null, 422, 'A reference is required.');

        $order = SubscriptionOrder::query()->where('reference', $reference)->first();

        abort_if($order === null, 404, 'Unknown subscription reference.');

        $status = strtolower((string) ($payload['status'] ?? $payload['state'] ?? ''));

        $paid = array_key_exists('paid', $payload)
            ? (bool) $payload['paid']
            : in_array($status, ['paid', 'completed', 'success', 'succeeded'], true);

        return [
            'order' => $order,
            'payment_reference' => $payload['payment_reference'] ?? (string) Str::uuid(),
            'paid' => $paid,
        ];
    }
}
