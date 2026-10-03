<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\AdmissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property int $patient_id
 */
class Admission extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<AdmissionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'bed_id',
        'status',
        'admission_diagnosis',
        'admitted_by',
        'admitted_at',
        'discharged_by',
        'discharged_at',
        'discharge_summary',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'admitted_at' => 'datetime',
            'discharged_at' => 'datetime',
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

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function admittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    public function dischargedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'discharged_by');
    }

    public function isAdmitted(): bool
    {
        return $this->status === 'admitted';
    }

    /**
     * Nights in the bed, counted between whole days.
     *
     * Carbon returns a float here, and truncating it towards zero would bill
     * a patient who came in at 23:00 and left at 01:00 a full day, so the
     * difference is taken on the start of each day instead.
     */
    public function lengthOfStayDays(): ?int
    {
        if ($this->admitted_at === null) {
            return null;
        }

        $discharged = $this->discharged_at ?? now();

        return (int) $this->admitted_at->copy()
            ->startOfDay()
            ->diffInDays($discharged->copy()->startOfDay());
    }
}
