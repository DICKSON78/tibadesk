<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\ConsultationDiagnosisFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $consultation_id
 */
class ConsultationDiagnosis extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<ConsultationDiagnosisFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'consultation_id',
        'description',
        'code',
        'type',
        'notes',
        'recorded_by',
    ];

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function isPrincipal(): bool
    {
        return $this->type === 'principal';
    }
}
