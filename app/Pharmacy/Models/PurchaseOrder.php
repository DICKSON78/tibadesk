<?php

namespace App\Pharmacy\Models;

use App\Models\User;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use RuntimeException;

/**
 * An order raised against a supplier, which becomes stock when it is received.
 *
 * Ported from Phermex's PurchaseOrder. Two differences: receiving here creates
 * the batch row rather than overwriting scalars on the medicine, and the whole
 * receive runs in one transaction, which Phermex's does not.
 */
class PurchaseOrder extends Model
{
    use BelongsToFacility;

    public const DRAFT = 'draft';

    public const ORDERED = 'ordered';

    public const PARTIALLY_RECEIVED = 'partially_received';

    public const RECEIVED = 'received';

    public const CANCELLED = 'cancelled';

    protected $fillable = [
        'facility_id',
        'supplier_id',
        'raised_by',
        'received_by',
        'order_number',
        'status',
        'ordered_on',
        'expected_on',
        'received_at',
        'total_value',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ordered_on' => 'date',
            'expected_on' => 'date',
            'received_at' => 'datetime',
            'total_value' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(PharmacySupplier::class, 'supplier_id');
    }

    public function raiser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * @return HasMany<PurchaseOrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function isReceivable(): bool
    {
        return in_array($this->status, [self::DRAFT, self::ORDERED, self::PARTIALLY_RECEIVED], true);
    }

    public function isReceived(): bool
    {
        return $this->status === self::RECEIVED;
    }

    public function markOrdered(): void
    {
        if ($this->status !== self::DRAFT) {
            throw new RuntimeException("Purchase order {$this->order_number} has already been placed.");
        }

        $this->update([
            'status' => self::ORDERED,
            'ordered_on' => now()->toDateString(),
        ]);
    }

    /**
     * Called once every line has been received in full. The service that
     * actually creates the batches is responsible for the transaction, so this
     * only records the outcome.
     */
    public function markReceived(?int $userId = null): void
    {
        $this->update([
            'status' => self::RECEIVED,
            'received_at' => now(),
            'received_by' => $userId,
        ]);
    }

    public function markPartiallyReceived(): void
    {
        $this->update(['status' => self::PARTIALLY_RECEIVED]);
    }
}
