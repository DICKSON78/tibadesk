<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\EyeExamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property int $patient_id
 */
class EyeExam extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<EyeExamFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'consultation_id',
        'od_visual_acuity',
        'os_visual_acuity',
        'od_sphere',
        'od_cylinder',
        'od_axis',
        'os_sphere',
        'os_cylinder',
        'os_axis',
        'od_iop',
        'os_iop',
        'diagnosis',
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
            'od_sphere' => 'decimal:2',
            'od_cylinder' => 'decimal:2',
            'od_axis' => 'decimal:2',
            'os_sphere' => 'decimal:2',
            'os_cylinder' => 'decimal:2',
            'os_axis' => 'decimal:2',
            'od_iop' => 'decimal:2',
            'os_iop' => 'decimal:2',
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

    /**
     * A refraction cannot be read as a pair if one eye is missing, so the two
     * halves are checked together.
     */
    public function hasRefraction(): bool
    {
        return $this->od_sphere !== null && $this->os_sphere !== null;
    }

    /**
     * @return array{sphere: float|null, cylinder: float|null, axis: float|null}
     */
    public function rightEye(): array
    {
        return [
            'sphere' => $this->od_sphere === null ? null : (float) $this->od_sphere,
            'cylinder' => $this->od_cylinder === null ? null : (float) $this->od_cylinder,
            'axis' => $this->od_axis === null ? null : (float) $this->od_axis,
        ];
    }

    /**
     * @return array{sphere: float|null, cylinder: float|null, axis: float|null}
     */
    public function leftEye(): array
    {
        return [
            'sphere' => $this->os_sphere === null ? null : (float) $this->os_sphere,
            'cylinder' => $this->os_cylinder === null ? null : (float) $this->os_cylinder,
            'axis' => $this->os_axis === null ? null : (float) $this->os_axis,
        ];
    }
}
