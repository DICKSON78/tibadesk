<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\EncounterFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * One visit to the facility. A consultation is the clinical record of an
 * encounter, so the two are one-to-one and both carry the facility key.
 *
 * @property int $facility_id
 * @property int $patient_id
 */
class Encounter extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<EncounterFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'patient_id',
        'encounter_number',
        'type',
        'status',
        'payment_mode',
        'reason_for_visit',
        'department',
        'referred_by',
        'clinician_id',
        'registered_by',
        'registered_at',
        'started_at',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): HasOne
    {
        return $this->hasOne(Consultation::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function isOpen(): bool
    {
        return in_array($this->status, ['registered', 'in_progress'], true);
    }

    /**
     * Whether a clinical record may be written against this visit.
     *
     * A record written against a visit nobody attended is worse than no record
     * at all, so the visit has to have been picked up first. This lives on the
     * model rather than in each controller, or the API and the screens would
     * drift into disagreeing about when a consultation is allowed.
     */
    public function isConsultable(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Refuse the write with the reason, for the caller to abort on.
     */
    public function consultableRefusal(): ?string
    {
        if ($this->isConsultable()) {
            return null;
        }

        if ($this->status === 'cancelled') {
            return 'A cancelled encounter cannot be consulted.';
        }

        return 'Start the encounter before writing a consultation for it.';
    }

    /**
     * Opening a visit is what moves it from the reception queue into clinical
     * work, so it stamps the start rather than trusting the caller for a time.
     */
    public function start(?\DateTimeInterface $at = null): void
    {
        if (! $this->isOpen()) {
            return;
        }

        $this->forceFill([
            'status' => 'in_progress',
            'started_at' => $at ?? now(),
        ])->save();
    }

    public function complete(?\DateTimeInterface $at = null): void
    {
        $this->forceFill([
            'status' => 'completed',
            'completed_at' => $at ?? now(),
        ])->save();
    }
}
