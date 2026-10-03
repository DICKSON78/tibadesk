<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\DispenseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property int $patient_id
 */
class Dispense extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<DispenseFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'status',
        'notes',
        'dispensed_by',
        'dispensed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dispensed_at' => 'datetime',
        ];
    }

    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dispensedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(DispenseItem::class);
    }
}
