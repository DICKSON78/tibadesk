<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\LabOrderItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $lab_order_id
 * @property int $lab_test_id
 * @property string|null $result_flag
 */
class LabOrderItem extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<LabOrderItemFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'lab_order_id',
        'lab_test_id',
        'status',
        'result_value',
        'result_text',
        'result_flag',
        'result_notes',
        'resulted_by',
        'resulted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'result_value' => 'decimal:2',
            'resulted_at' => 'datetime',
        ];
    }

    public function labOrder(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class);
    }

    public function resultedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resulted_by');
    }

    public function hasResult(): bool
    {
        return $this->status === 'resulted'
            && ($this->result_value !== null || $this->result_text !== null);
    }

    public function isCritical(): bool
    {
        return $this->result_flag === 'critical';
    }
}
