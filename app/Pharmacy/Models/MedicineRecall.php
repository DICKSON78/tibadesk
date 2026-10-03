<?php

namespace App\Pharmacy\Models;

use App\Models\Medicine;
use App\Models\User;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A manufacturer or regulator recall.
 *
 * Phermex records recalls but nothing reads them, so a recalled batch keeps
 * dispensing normally. A recall here is load-bearing: the dispensing service
 * refuses to hand out stock whose batch is under an open recall.
 */
class MedicineRecall extends Model
{
    use BelongsToFacility;

    public const PENDING = 'pending';

    public const IN_PROGRESS = 'in_progress';

    public const CLOSED = 'closed';

    protected $fillable = [
        'facility_id',
        'medicine_id',
        'batch_id',
        'reported_by',
        'reference_number',
        'recall_reason',
        'severity',
        'manufacturer',
        'issued_on',
        'status',
        'affected_quantity',
        'returned_quantity',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_on' => 'date',
            'affected_quantity' => 'integer',
            'returned_quantity' => 'integer',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * @return HasMany<MedicineRecallDisposition, $this>
     */
    public function dispositions(): HasMany
    {
        return $this->hasMany(MedicineRecallDisposition::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', [self::PENDING, self::IN_PROGRESS]);
    }

    public function isOpen(): bool
    {
        return in_array($this->status, [self::PENDING, self::IN_PROGRESS], true);
    }

    public function quantityOutstanding(): int
    {
        return max(0, $this->affected_quantity - $this->returned_quantity);
    }
}
