<?php

namespace App\Data;

use App\Enums\Edition;
use DateTimeInterface;

/**
 * Everything needed to turn a paid registration into a working facility.
 *
 * Collected as one object so the provisioning service can be called from the
 * activation endpoint, an artisan command or a test without any of them
 * having to know the order the columns happen to be written in.
 */
final readonly class ProvisionFacility
{
    public function __construct(
        public string $name,
        public Edition $edition,
        public string $ownerName,
        public string $ownerEmail,
        public string $ownerPassword,
        public ?string $ownerPhone = null,
        public ?string $licenceTerm = null,
        public ?int $licenceMonths = null,
        public ?string $registrationReference = null,
        public ?string $facilityType = null,
        public ?string $address = null,
        /**
         * The date the licence runs out, when it is not simply a term of whole
         * months from today.
         *
         * A paid licence is sold in months, so `licenceMonths` covers it. A
         * trial is fourteen days, which is not a number of months and would
         * otherwise have to be rounded to a month and quietly hand out twice
         * the trial it promised. Stating the date outright keeps the one rule —
         * a licence ends when its date says so — true for both.
         */
        public ?DateTimeInterface $licenceExpiresAt = null,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            name: $payload['name'],
            edition: $payload['edition'] instanceof Edition
                ? $payload['edition']
                : Edition::from($payload['edition']),
            ownerName: $payload['ownerName'],
            ownerEmail: mb_strtolower(trim($payload['ownerEmail'])),
            ownerPassword: $payload['ownerPassword'],
            ownerPhone: $payload['ownerPhone'] ?? null,
            licenceTerm: $payload['licenceTerm'] ?? null,
            licenceMonths: isset($payload['licenceMonths']) ? (int) $payload['licenceMonths'] : null,
            registrationReference: $payload['registrationReference'] ?? null,
            facilityType: $payload['facilityType'] ?? null,
            address: $payload['address'] ?? null,
            licenceExpiresAt: $payload['licenceExpiresAt'] ?? null,
        );
    }
}
