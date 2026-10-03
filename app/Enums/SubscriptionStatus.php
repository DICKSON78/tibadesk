<?php

namespace App\Enums;

enum SubscriptionStatus: string
{
    case AwaitingQuote = 'awaiting_quote';
    case AwaitingPayment = 'awaiting_payment';
    case Paid = 'paid';
    case LicenceIssued = 'licence_issued';
    case Failed = 'failed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function hasBeenPaid(): bool
    {
        return in_array($this, [self::Paid, self::LicenceIssued], true);
    }

    public function isQuoted(): bool
    {
        return $this !== self::AwaitingQuote;
    }

    public function isFinished(): bool
    {
        return in_array($this, [self::LicenceIssued, self::Failed, self::Cancelled], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::AwaitingQuote => 'Awaiting quote',
            self::AwaitingPayment => 'Awaiting payment',
            self::Paid => 'Paid',
            self::LicenceIssued => 'Licence issued',
            self::Failed => 'Payment failed',
            self::Expired => 'Expired',
            self::Cancelled => 'Cancelled',
        };
    }
}
