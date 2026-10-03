<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\StaffRecordFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property string $full_name
 */
class StaffRecord extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<StaffRecordFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'user_id',
        'staff_number',
        'full_name',
        'department',
        'designation',
        'employment_type',
        'hired_on',
        'monthly_salary',
        'phone',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hired_on' => 'date',
            'monthly_salary' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasPendingLeave(): bool
    {
        return $this->leaveRequests()->where('status', 'pending')->exists();
    }
}
