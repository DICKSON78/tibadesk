<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\DentalProcedureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property string $name
 */
class DentalProcedure extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<DentalProcedureFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'consultation_id',
        'code',
        'name',
        'tooth_number',
        'surfaces',
        'status',
        'quoted_price',
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
            'quoted_price' => 'integer',
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

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
