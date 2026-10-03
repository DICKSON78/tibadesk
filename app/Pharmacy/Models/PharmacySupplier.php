<?php

namespace App\Pharmacy\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\Pharmacy\PharmacySupplierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A wholesaler the facility buys stock from.
 *
 * Ported from the Phermex project's Supplier. Phermex keeps running totals
 * (total_orders, total_purchased) on the row and recomputes them with a fresh
 * aggregate on every goods receipt. Those are derived, so they are read here
 * rather than stored, and a receipt that misses the recalculation cannot leave
 * them quietly wrong.
 */
class PharmacySupplier extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<PharmacySupplierFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'facility_id',
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'tax_id',
        'payment_terms',
        'is_active',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<PurchaseOrder, $this>
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'supplier_id');
    }

    /**
     * @return HasMany<MedicineBatch, $this>
     */
    public function batches(): HasMany
    {
        return $this->hasMany(MedicineBatch::class, 'supplier_id');
    }

    public function totalPurchased(): int
    {
        return (int) $this->purchaseOrders()
            ->where('status', 'received')
            ->sum('total_value');
    }
}
