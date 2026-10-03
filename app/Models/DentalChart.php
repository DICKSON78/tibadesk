<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\DentalChartFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property int $tooth_number
 */
class DentalChart extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<DentalChartFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'tooth_number',
        'surfaces',
        'condition',
        'notes',
        'recorded_by',
        'recorded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tooth_number' => 'integer',
            'surfaces' => 'array',
            'recorded_at' => 'datetime',
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

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function isAffected(): bool
    {
        return $this->condition !== 'healthy';
    }
}
