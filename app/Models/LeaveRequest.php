<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\LeaveRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $staff_record_id
 */
class LeaveRequest extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<LeaveRequestFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'staff_record_id',
        'leave_type',
        'from_date',
        'to_date',
        'days',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'from_date' => 'date',
            'to_date' => 'date',
            'days' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function staffRecord(): BelongsTo
    {
        return $this->belongsTo(StaffRecord::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Inclusive of both ends, because a leave from Monday to Wednesday is
     * three days of cover to arrange, not two.
     */
    public static function countDays($from, $to): int
    {
        return (int) $from->copy()->startOfDay()->diffInDays($to->copy()->startOfDay()) + 1;
    }
}
