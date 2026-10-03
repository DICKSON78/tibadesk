<?php

namespace App\Services\Payments;

use App\Models\SubscriptionOrder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Live ClickPesa integration.
 *
 * The request and response field names below are the single mapping point for
 * the provider: once the ClickPesa API keys and docs are available, only this
 * class needs to change. Everything else in the subscription flow talks to the
 * PaymentGateway interface.
 */
class ClickPesaGateway implements PaymentGateway
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $apiKey,
        private readonly string $returnUrl,
        private readonly string $callbackUrl,
    ) {}

    public function checkoutUrlFor(SubscriptionOrder $order): string
    {
        if ($order->amount === null) {
            throw new RuntimeException(
                'The amount for this order has not been quoted yet, so no payment link can be created.'
            );
        }

        $response = Http::withToken($this->apiKey)
            ->withHeaders(['Idempotency-Key' => $order->reference])
            ->acceptJson()
            ->asJson()
            ->post($this->baseUrl.'/api/v1/payments', [
                'amount' => $order->amount,
                'currency' => $order->currency,
                'description' => "TibaDesk {$order->edition} subscription",
                'redirect_url' => $this->returnUrl,
                'callback_url' => $this->callbackUrl,
                'customer' => [
                    'name' => $order->customer_name,
                    'email' => $order->email,
                    'phone' => $order->phone,
                ],
                'meta' => [
                    'reference' => $order->reference,
                    'edition' => $order->edition,
                ],
            ])
            ->throw()
            ->json();

        $url = $response['checkout_url'] ?? $response['redirect_url'] ?? $response['url'] ?? null;

        if ($url === null) {
            throw new RuntimeException('ClickPesa did not return a checkout URL.');
        }

        return $url;
    }

    public function resolveNotification(array $payload): array
    {
        $reference = $payload['meta']['reference'] ?? $payload['reference'] ?? null;

        abort_if($reference === null, 422, 'A reference is required.');

        $order = SubscriptionOrder::query()->where('reference', $reference)->first();

        abort_if($order === null, 404, 'Unknown subscription reference.');

        $status = strtolower((string) ($payload['status'] ?? $payload['state'] ?? ''));

        return [
            'order' => $order,
            'payment_reference' => $payload['id'] ?? $payload['payment_id'] ?? null,
            'paid' => in_array($status, ['paid', 'completed', 'success', 'succeeded'], true),
        ];
    }

    /**
     * Confirm a payment with the provider before trusting a notification.
     *
     * @throws ConnectionException
     */
    public function verify(string $paymentReference): bool
    {
        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->get($this->baseUrl.'/api/v1/payments/'.$paymentReference)
            ->throw()
            ->json();

        $status = strtolower((string) ($response['status'] ?? $response['state'] ?? ''));

        return in_array($status, ['paid', 'completed', 'success', 'succeeded'], true);
    }
}
