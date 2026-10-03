<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\ConsultationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The clinical record of an encounter.
 *
 * @property int $facility_id
 * @property int $encounter_id
 */
class Consultation extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<ConsultationFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'consultation_number',
        'status',
        'chief_complaint',
        'history_present_illness',
        'past_medical_history',
        'drug_history',
        'family_history',
        'allergy_history',
        'general_health',
        'examination',
        'clinical_notes',
        'plan',
        'remarks',
        'clinician_id',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    public function diagnoses(): HasMany
    {
        return $this->hasMany(ConsultationDiagnosis::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * A completed consultation is part of the patient's legal record, so it is
     * read-only from that point on. Facility admins may still reopen it, which
     * is the only way a signed consultation is ever edited again.
     */
    public function isLocked(): bool
    {
        return ! $this->isDraft();
    }

    /**
     * Sign the consultation off, stamping the clinician and the time rather
     * than accepting either from the request.
     */
    public function complete(User $clinician, ?\DateTimeInterface $at = null): void
    {
        $this->forceFill([
            'status' => 'completed',
            'clinician_id' => $clinician->getKey(),
            'completed_at' => $at ?? now(),
        ])->save();
    }

    public function principalDiagnosis(): ?ConsultationDiagnosis
    {
        return $this->diagnoses->firstWhere('type', 'principal');
    }
}
