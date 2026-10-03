<?php

namespace App\Pharmacy\Models;

use App\Models\Medicine;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A line on a transfer, and how much of it arrived.
 */
class StockTransferItem extends Model
{
    use BelongsToFacility;

    protected $fillable = [
        'facility_id',
        'stock_transfer_id',
        'medicine_id',
        'medicine_batch_id',
        'quantity_sent',
        'quantity_received',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity_sent' => 'integer',
            'quantity_received' => 'integer',
        ];
    }

    public function transfer(): BelongsTo
    {
        return $this->belongsTo(StockTransfer::class, 'stock_transfer_id');
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(MedicineBatch::class, 'medicine_batch_id');
    }

    public function quantityOutstanding(): int
    {
        return max(0, $this->quantity_sent - $this->quantity_received);
    }
}
