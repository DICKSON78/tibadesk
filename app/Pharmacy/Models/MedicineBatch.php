<?php

namespace App\Pharmacy\Models;

use App\Models\Medicine;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One physical delivery of one medicine, identified by its batch number.
 *
 * Phermex keeps a single quantity on the medicine row and overwrites
 * batch_number and expiry_date on every goods receipt, so receiving batch B2
 * erases batch B1's expiry and leaves one blended quantity attributed to
 * whichever arrived last. There is then nothing to dispense first-expiring
 * first. Keeping the batch as its own row fixes both.
 */
class MedicineBatch extends Model
{
    use BelongsToFacility;

    protected $fillable = [
        'facility_id',
        'medicine_id',
        'supplier_id',
        'batch_number',
        'expiry_date',
        'quantity_received',
        'quantity_available',
        'cost_price',
        'received_on',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'quantity_received' => 'integer',
            'quantity_available' => 'integer',
            'cost_price' => 'integer',
            'received_on' => 'date',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(PharmacySupplier::class, 'supplier_id');
    }

    /**
     * @return HasMany<MedicineMovement, $this>
     */
    public function movements(): HasMany
    {
        return $this->hasMany(MedicineMovement::class, 'batch_id');
    }

    /**
     * @return HasMany<MedicineBatchStock, $this>
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(MedicineBatchStock::class, 'medicine_batch_id');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSellable(Builder $query): Builder
    {
        return $query
            ->where('quantity_available', '>', 0)
            ->whereDate('expiry_date', '>=', now()->toDateString());
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeExpiringWithin(Builder $query, int $days): Builder
    {
        return $query->whereBetween('expiry_date', [
            now()->toDateString(),
            now()->addDays($days)->toDateString(),
        ]);
    }

    /**
     * @return HasMany<MedicineRecall, $this>
     */
    public function recalls(): HasMany
    {
        return $this->hasMany(MedicineRecall::class, 'batch_id');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date?->isPast() ?? false;
    }

    public function isRecalled(): bool
    {
        return $this->relationLoaded('recalls')
            ? $this->recalls->contains(fn (MedicineRecall $recall): bool => $recall->isOpen())
            : $this->recalls()->open()->exists();
    }

    /**
     * Stock value held in this batch, for reporting.
     */
    public function stockValue(): int
    {
        return $this->quantity_available * $this->cost_price;
    }
}
