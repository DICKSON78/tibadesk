<?php

namespace App\Services\Payments;

use App\Models\SubscriptionOrder;

interface PaymentGateway
{
    /**
     * Start a payment for the order and return the URL the customer is sent to.
     */
    public function checkoutUrlFor(SubscriptionOrder $order): string;

    /**
     * Resolve an incoming provider notification to its order and payment reference.
     *
     * @return array{order: SubscriptionOrder, payment_reference: ?string, paid: bool}
     */
    public function resolveNotification(array $payload): array;
}
