<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\LabOrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property int $patient_id
 */
class LabOrder extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<LabOrderFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'status',
        'priority',
        'clinical_notes',
        'ordered_by',
        'ordered_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ordered_at' => 'datetime',
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

    public function orderedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(LabOrderItem::class);
    }

    /**
     * @return HasMany<LabOrderItem>
     */
    public function pendingItems(): HasMany
    {
        return $this->items()->where('status', 'pending');
    }

    public function isFullyResulted(): bool
    {
        return $this->items()->where('status', 'pending')->doesntExist();
    }

    /**
     * Recomputed from its items rather than stored, so a result entered by hand
     * cannot leave the header claiming the order is still outstanding.
     */
    public function refreshStatus(): void
    {
        $status = match (true) {
            $this->items()->where('status', 'cancelled')->exists() => 'cancelled',
            $this->isFullyResulted() => 'resulted',
            default => 'ordered',
        };

        if ($status !== $this->status) {
            $this->forceFill(['status' => $status])->save();
        }
    }
}
