<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\MedicineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property string $name
 */
class Medicine extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<MedicineFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'code',
        'name',
        'generic_name',
        'form',
        'strength',
        'unit',
        'unit_price',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * @return HasMany<MedicineStock>
     */
    public function stock(): HasMany
    {
        return $this->hasMany(MedicineStock::class);
    }

    public function quantityOnHand(): int
    {
        return (int) ($this->stock()->value('quantity_on_hand') ?? 0);
    }

    public function isLowOnStock(): bool
    {
        $stock = $this->stock()->first();

        if ($stock === null) {
            return true;
        }

        return $stock->quantity_on_hand <= $stock->reorder_level;
    }
}
