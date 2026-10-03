<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Database\Factories\SubscriptionOrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionOrder extends Model
{
    /** @use HasFactory<SubscriptionOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'reference',
        'edition',
        'licence_term',
        'licence_months',
        'amount',
        'currency',
        'quoted_at',
        'quoted_by',
        'quote_note',
        'status',
        'customer_name',
        'email',
        'phone',
        'facility_name',
        'tin',
        'payment_reference',
        'checkout_url',
        'paid_at',
        'period_start',
        'period_end',
        'licence_issued_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'licence_months' => 'integer',
            'amount' => 'integer',
            'quoted_at' => 'datetime',
            'paid_at' => 'datetime',
            'period_start' => 'datetime',
            'period_end' => 'datetime',
            'licence_issued_at' => 'datetime',
        ];
    }

    /**
     * The human label for the chosen term, taken from the catalogue.
     */
    public function licenceTermLabel(): string
    {
        $term = collect(config('tibadesk.licence_terms'))
            ->firstWhere('key', $this->licence_term);

        return $term['label'] ?? "{$this->licence_months} months";
    }

    /**
     * The term configured for a licence, resolved from a term key.
     *
     * @return array{key: string, months: int, label: string}
     */
    public static function resolveTerm(string $key): array
    {
        $term = collect(config('tibadesk.licence_terms'))->firstWhere('key', $key);

        return $term ?? config('tibadesk.licence_term');
    }

    public function isPaid(): bool
    {
        return $this->status->hasBeenPaid();
    }

    public function isLicenceIssued(): bool
    {
        return $this->status === SubscriptionStatus::LicenceIssued;
    }
}
