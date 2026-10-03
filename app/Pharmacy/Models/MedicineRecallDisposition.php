<?php

namespace App\Pharmacy\Models;

use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * What actually happened to recalled stock: returned to the supplier, destroyed
 * on site, or held. Closes out the recall with a number behind it.
 */
class MedicineRecallDisposition extends Model
{
    use BelongsToFacility;

    public const RETURNED_TO_SUPPLIER = 'returned_to_supplier';

    public const DESTROYED = 'destroyed';

    public const HELD = 'held';

    public const RELEASED_FOR_USE = 'released_for_use';

    protected $fillable = [
        'facility_id',
        'medicine_recall_id',
        'disposition',
        'quantity',
        'unit_cost',
        'disposed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_cost' => 'integer',
            'disposed_at' => 'datetime',
        ];
    }

    public function recall(): BelongsTo
    {
        return $this->belongsTo(MedicineRecall::class, 'medicine_recall_id');
    }
}
