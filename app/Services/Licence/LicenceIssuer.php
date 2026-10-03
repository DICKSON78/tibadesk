<?php

namespace App\Services\Licence;

use App\Models\SubscriptionOrder;
use Illuminate\Support\Facades\File;
use RuntimeException;

/**
 * Issues the signed licence file a customer downloads and uploads into their
 * own TibaDesk install. The signature is Ed25519 over the canonical JSON
 * payload, so the installed copy can verify it offline with the public key and
 * never has to phone home.
 */
class LicenceIssuer
{
    public function __construct(
        private readonly string $privateKeyPath,
        private readonly string $publicKeyPath,
    ) {}

    public function issue(SubscriptionOrder $order): string
    {
        $payload = $this->payloadFor($order);
        $encoded = $this->encode($payload);
        $signature = base64_encode(sodium_crypto_sign_detached($encoded, $this->privateKey()));

        return $this->encode([
            'payload' => $payload,
            'signature' => $signature,
            'algorithm' => 'ed25519',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function payloadFor(SubscriptionOrder $order): array
    {
        $edition = config("tibadesk.editions.{$order->edition}");
        $catalogue = config('tibadesk.modules');
        $moduleKeys = $edition['modules'] ?? [];

        return [
            'licence_id' => 'TIB-'.strtoupper(substr(hash('sha256', $order->reference), 0, 16)),
            'reference' => $order->reference,
            'edition' => $order->edition,
            'edition_name' => $edition['name'] ?? $order->edition,
            'licensed_to' => [
                'name' => $order->customer_name,
                'email' => $order->email,
                'phone' => $order->phone,
                'facility' => $order->facility_name,
                'tin' => $order->tin,
            ],
            'limits' => $edition['limits'] ?? [],
            'issued_at' => $order->paid_at?->toIso8601String() ?? now()->toIso8601String(),
            'valid_from' => $order->period_start?->toIso8601String() ?? now()->toIso8601String(),
            'expires_at' => $order->period_end?->toIso8601String() ?? now()->addMonths($order->licence_months)->toIso8601String(),
            'licence_term' => $order->licence_term,
            'licence_term_label' => $order->licenceTermLabel(),
            'licence_months' => $order->licence_months,
            'modules' => $moduleKeys,
            'module_names' => array_values(array_filter(array_map(
                fn (string $key): ?string => $catalogue[$key]['name'] ?? null,
                $moduleKeys,
            ))),
        ];
    }

    public function publicKey(): string
    {
        if (! is_file($this->publicKeyPath)) {
            throw new RuntimeException('The licence public key is missing. Run: php artisan tibadesk:licence-key');
        }

        return trim(File::get($this->publicKeyPath));
    }

    private function privateKey(): string
    {
        if (! is_file($this->privateKeyPath)) {
            throw new RuntimeException('The licence private key is missing. Run: php artisan tibadesk:licence-key');
        }

        $key = File::get($this->privateKeyPath);

        if (! str_starts_with(trim($key), 'base64:')) {
            throw new RuntimeException('The licence private key is not in the expected base64 format.');
        }

        return base64_decode(substr(trim($key), 7), true) ?: throw new RuntimeException('The licence private key could not be decoded.');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function encode(array $data): string
    {
        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }
}
