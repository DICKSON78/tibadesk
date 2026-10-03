<?php

namespace App\Pharmacy\Models;

use App\Models\Medicine;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A line on a purchase order, and how much of it has actually arrived.
 */
class PurchaseOrderItem extends Model
{
    use BelongsToFacility;

    protected $fillable = [
        'facility_id',
        'purchase_order_id',
        'medicine_id',
        'quantity_ordered',
        'quantity_received',
        'batch_number',
        'expiry_date',
        'unit_cost',
        'line_total',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity_ordered' => 'integer',
            'quantity_received' => 'integer',
            'expiry_date' => 'date',
            'unit_cost' => 'integer',
            'line_total' => 'integer',
        ];
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function quantityOutstanding(): int
    {
        return max(0, $this->quantity_ordered - $this->quantity_received);
    }
}
