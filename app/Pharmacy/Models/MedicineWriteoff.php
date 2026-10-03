<?php

namespace App\Pharmacy\Models;

use App\Models\Medicine;
use App\Models\User;
use App\Support\Tenancy\BelongsToFacility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Stock removed from the shelf and out of the books: expired, damaged,
 * contaminated, stolen, or pulled by a recall.
 *
 * Phermex has a damaged-goods table whose create() runs three statements with
 * no transaction, so a failure partway through leaves the quantity changed
 * without a write-off row, or a write-off row without the quantity changing.
 * The service that creates these wraps all of it in one transaction.
 */
class MedicineWriteoff extends Model
{
    use BelongsToFacility;

    public const EXPIRED = 'expired';

    public const DAMAGED = 'damaged';

    public const CONTAMINATED = 'contaminated';

    public const STOLEN = 'stolen';

    public const MISLAID = 'mislaid';

    public const RECALLED = 'recalled';

    public const OTHER = 'other';

    /**
     * Every reason stock may leave the shelf, mapped to its label.
     *
     * The list lives on the model rather than in the request that validates it,
     * because a reason is a fact about the write-off, not about the transport.
     * `recalled` is here because a recalled batch handed back by a patient is
     * one of the most common reasons a pharmacy destroys stock, and it is the
     * one loss that must never be filed as a mystery `other`.
     *
     * @return array<string, string>
     */
    public static function reasons(): array
    {
        return [
            self::EXPIRED => 'Expired',
            self::DAMAGED => 'Damaged',
            self::CONTAMINATED => 'Contaminated',
            self::RECALLED => 'Recalled',
            self::STOLEN => 'Stolen',
            self::MISLAID => 'Mislaid',
            self::OTHER => 'Other',
        ];
    }

    /**
     * What happened to the goods, unless the caller says otherwise.
     *
     * Named here because the request may omit it, and writing an explicit null
     * would override the column default rather than fall back to it.
     */
    public const DEFAULT_DISPOSAL_METHOD = 'documented_disposal';

    protected $fillable = [
        'facility_id',
        'medicine_id',
        'batch_id',
        'reported_by',
        'reference_number',
        'reason',
        'quantity',
        'unit_cost',
        'total_loss',
        'disposal_method',
        'written_off_on',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_cost' => 'integer',
            'total_loss' => 'integer',
            'written_off_on' => 'date',
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
}
