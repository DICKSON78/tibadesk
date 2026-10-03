<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\LabTestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property string $name
 */
class LabTest extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<LabTestFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'code',
        'name',
        'category',
        'unit',
        'unit_price',
        'turnaround_hours',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'integer',
            'turnaround_hours' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<LabOrderItem>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(LabOrderItem::class);
    }
}
