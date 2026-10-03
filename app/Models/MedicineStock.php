<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\MedicineStockFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

/**
 * @property int $facility_id
 * @property int $medicine_id
 * @property int $quantity_on_hand
 */
class MedicineStock extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<MedicineStockFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'medicine_id',
        'quantity_on_hand',
        'reorder_level',
        'last_counted_on',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity_on_hand' => 'integer',
            'reorder_level' => 'integer',
            'last_counted_on' => 'date',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Move stock by a signed amount.
     *
     * The quantity is written back with a comparison in the same statement, so
     * two dispensers selling the last tablet cannot both succeed and leave the
     * shelf negative.
     */
    public function adjustBy(int $delta): bool
    {
        return $this->newQuery()
            ->whereKey($this->getKey())
            ->where('facility_id', $this->facility_id)
            ->whereRaw('quantity_on_hand + ? >= 0', [$delta])
            ->update(['quantity_on_hand' => DB::raw('quantity_on_hand + '.(int) $delta)]) === 1;
    }

    public function isLow(): bool
    {
        return $this->quantity_on_hand <= $this->reorder_level;
    }
}
