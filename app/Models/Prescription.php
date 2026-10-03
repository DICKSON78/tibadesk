<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\PrescriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $consultation_id
 * @property int $patient_id
 */
class Prescription extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<PrescriptionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'consultation_id',
        'patient_id',
        'medicine',
        'dose',
        'route',
        'frequency',
        'duration',
        'instructions',
        'quantity',
        'status',
        'prescribed_by',
        'dispensed_by',
        'dispensed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'dispensed_at' => 'datetime',
        ];
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function prescribedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prescribed_by');
    }

    public function isDispensed(): bool
    {
        return $this->status === 'dispensed';
    }
}
