<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\InvoiceItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $invoice_id
 * @property int $line_total
 */
class InvoiceItem extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<InvoiceItemFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'invoice_id',
        'code',
        'description',
        'module',
        'quantity',
        'unit_price',
        'line_total',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'line_total' => 'integer',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function computeLineTotal(): int
    {
        return $this->quantity * $this->unit_price;
    }
}
