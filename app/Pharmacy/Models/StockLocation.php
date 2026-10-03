<?php

namespace App\Pharmacy\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\Pharmacy\StockLocationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A physical store or shelf holding stock within the facility.
 */
class StockLocation extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<StockLocationFactory> */
    use HasFactory;

    protected $fillable = [
        'facility_id',
        'name',
        'code',
        'kind',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<MedicineBatchStock, $this>
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(MedicineBatchStock::class, 'stock_location_id');
    }
}
