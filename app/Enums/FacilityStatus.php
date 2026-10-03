<?php

namespace App\Enums;

enum FacilityStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Suspended = 'suspended';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending activation',
            self::Active => 'Active',
            self::Suspended => 'Suspended',
            self::Expired => 'Expired',
        };
    }

    /**
     * A suspended or expired facility keeps its data but must not be able to
     * work: sign-in is refused and module access is closed.
     */
    public function allowsWork(): bool
    {
        return $this === self::Active;
    }
}
