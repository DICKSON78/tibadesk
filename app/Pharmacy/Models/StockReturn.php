<?php

namespace App\Pharmacy\Models;

use App\Models\User;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use RuntimeException;

/**
 * Stock sent back to a supplier.
 *
 * Phermex has this table and a create() method, but the method only records the
 * header row and the line items and never touches the medicine quantity, so a
 * return is invisible to stock. Here the service that posts a return debits
 * the batch and writes the journal row, so on-hand falls.
 */
class StockReturn extends Model
{
    use BelongsToFacility;

    public const DRAFT = 'draft';

    public const POSTED = 'posted';

    public const CANCELLED = 'cancelled';

    protected $fillable = [
        'facility_id',
        'supplier_id',
        'created_by',
        'return_number',
        'reason',
        'status',
        'returned_on',
        'total_value',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'returned_on' => 'date',
            'total_value' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(PharmacySupplier::class, 'supplier_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<StockReturnItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockReturnItem::class);
    }

    public function post(): void
    {
        if ($this->status !== self::DRAFT) {
            throw new RuntimeException("Return {$this->return_number} has already been posted.");
        }

        $this->update([
            'status' => self::POSTED,
            'returned_on' => now()->toDateString(),
        ]);
    }
}
