<?php

namespace App\Pharmacy\Models;

use App\Models\User;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use RuntimeException;

/**
 * Moving stock between two stores inside the same facility.
 *
 * Phermex has this model and its ship step decrements the single medicine
 * quantity, but nothing is ever credited at the destination, so an internal
 * transfer permanently destroys inventory. Here the two locations are real
 * rows, shipping debits the source and receiving credits the destination, and
 * both steps write to the stock journal.
 */
class StockTransfer extends Model
{
    use BelongsToFacility;

    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const IN_TRANSIT = 'in_transit';

    public const COMPLETED = 'completed';

    public const CANCELLED = 'cancelled';

    protected $fillable = [
        'facility_id',
        'from_location',
        'to_location',
        'requested_by',
        'approved_by',
        'transfer_number',
        'status',
        'approved_at',
        'shipped_at',
        'received_at',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'shipped_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function origin(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'from_location');
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'to_location');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * @return HasMany<StockTransferItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function approve(?int $userId = null): void
    {
        if ($this->status !== self::PENDING) {
            throw new RuntimeException("Transfer {$this->transfer_number} is not awaiting approval.");
        }

        $this->update(['status' => self::APPROVED, 'approved_at' => now(), 'approved_by' => $userId]);
    }

    public function ship(): void
    {
        if ($this->status !== self::APPROVED) {
            throw new RuntimeException("Transfer {$this->transfer_number} must be approved before it ships.");
        }

        $this->update(['status' => self::IN_TRANSIT, 'shipped_at' => now()]);
    }

    public function receive(): void
    {
        if ($this->status !== self::IN_TRANSIT) {
            throw new RuntimeException("Transfer {$this->transfer_number} is not in transit.");
        }

        $this->update(['status' => self::COMPLETED, 'received_at' => now()]);
    }

    /**
     * Only before the goods have left. Cancelling in transit would have to
     * reverse stock that is physically on a vehicle, so the service refuses it
     * and the transfer has to be received and returned instead.
     */
    public function cancel(): void
    {
        if (in_array($this->status, [self::COMPLETED, self::CANCELLED, self::IN_TRANSIT], true)) {
            throw new RuntimeException("Transfer {$this->transfer_number} can no longer be cancelled.");
        }

        $this->update(['status' => self::CANCELLED]);
    }
}
