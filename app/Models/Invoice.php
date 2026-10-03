<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property int $encounter_id
 * @property int $total
 * @property int $amount_paid
 */
class Invoice extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'encounter_id',
        'patient_id',
        'invoice_number',
        'status',
        'subtotal',
        'discount',
        'total',
        'amount_paid',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'discount' => 'integer',
            'total' => 'integer',
            'amount_paid' => 'integer',
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

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function balance(): int
    {
        return max(0, $this->total - $this->amount_paid);
    }

    public function isPaid(): bool
    {
        // Must agree with recalculate(): an invoice nothing has been charged to
        // yet is not settled, it is just not ready. Reading 0 >= 0 as paid would
        // freeze every fresh invoice against its own first line item.
        return $this->amount_paid > 0 && $this->amount_paid >= $this->total;
    }

    /**
     * Totals recomputed from the lines on every change.
     *
     * Storing a total that has to be kept in step by hand is how a cashier ends
     * up taking money against an invoice that says it is still unpaid.
     */
    public function recalculate(): void
    {
        $subtotal = (int) $this->items()->sum('line_total');
        // Cast first: an invoice created without an explicit discount has it
        // as null, and min(null, 0) is null, which then fails the NOT NULL
        // column instead of meaning "no discount".
        $discount = min((int) $this->discount, $subtotal);
        $paid = (int) $this->payments()->sum('amount');
        $total = $subtotal - $discount;

        $this->forceFill([
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $total,
            'amount_paid' => $paid,
            // A paid status means money actually came in. A fresh invoice owes
            // nothing yet (0 >= 0), and calling that settled would lock it
            // against the charges that have not been entered.
            'status' => $paid > 0 && $paid >= $total ? 'paid' : ($paid > 0 ? 'part_paid' : 'unpaid'),
        ])->save();
    }
}
