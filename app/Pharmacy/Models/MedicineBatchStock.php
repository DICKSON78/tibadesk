<?php

namespace App\Pharmacy\Models;

use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * How much of one batch sits in one location.
 *
 * Phermex has a single quantity per medicine with no location at all. This row
 * is what makes a transfer conserve stock: debiting the source and crediting
 * the destination moves a quantity instead of destroying it.
 */
class MedicineBatchStock extends Model
{
    use BelongsToFacility;

    protected $fillable = [
        'facility_id',
        'medicine_batch_id',
        'stock_location_id',
        'quantity_on_hand',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity_on_hand' => 'integer',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(MedicineBatch::class, 'medicine_batch_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'stock_location_id');
    }
}
