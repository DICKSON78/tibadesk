<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\ServicePriceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property string $module
 * @property int $price
 */
class ServicePrice extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<ServicePriceFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'code',
        'name',
        'module',
        'price',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<InvoiceItem>
     */
    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
