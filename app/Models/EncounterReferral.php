<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\EncounterReferralFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property string $reason
 */
class EncounterReferral extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<EncounterReferralFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'from_department_id',
        'to_department_id',
        'reason',
        'status',
        'referred_by',
        'referred_at',
        'accepted_by',
        'accepted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'referred_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    public function fromDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * A referral back to the department it came from is not a referral.
     */
    public function isWithinSameDepartment(): bool
    {
        return $this->from_department_id === $this->to_department_id;
    }
}
