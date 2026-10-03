<?php

namespace App\Pharmacy\Models;

use App\Models\Medicine;
use App\Models\User;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The stock journal: one signed row per movement, append-only.
 *
 * Phermex has this table too, but three of its stock writers (goods receipt,
 * transfer ship, damaged-goods write-off) change the quantity without writing
 * a movement, so the ledger cannot be reconciled against on-hand stock. Here
 * every path that changes a quantity writes a row in the same transaction, so
 * sum(ledger) and the batch table always agree.
 *
 * Positive quantity is stock in, negative is stock out.
 */
class MedicineMovement extends Model
{
    use BelongsToFacility;

    public const PURCHASE = 'purchase';

    public const SALE = 'sale';

    public const ADJUSTMENT = 'adjustment';

    public const RETURN = 'return';

    public const EXPIRY = 'expiry';

    public const TRANSFER_OUT = 'transfer_out';

    public const TRANSFER_IN = 'transfer_in';

    public const WRITEOFF = 'writeoff';

    public const RECALL = 'recall';

    protected $fillable = [
        'facility_id',
        'medicine_id',
        'batch_id',
        'movement_type',
        'quantity',
        'unit_cost',
        'reference_type',
        'reference_number',
        'notes',
        'performed_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_cost' => 'integer',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function isInbound(): bool
    {
        return $this->quantity > 0;
    }
}
