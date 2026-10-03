<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\DispenseItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $dispense_id
 * @property int $medicine_id
 * @property int $line_total
 */
class DispenseItem extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<DispenseItemFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'dispense_id',
        'medicine_id',
        'prescription_id',
        'quantity',
        'unit_price',
        'line_total',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'line_total' => 'integer',
        ];
    }

    public function dispense(): BelongsTo
    {
        return $this->belongsTo(Dispense::class);
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }
}
