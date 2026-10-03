<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\BedFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $facility_id
 * @property int $ward_id
 * @property string $bed_number
 */
class Bed extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<BedFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'ward_id',
        'bed_number',
        'status',
        'daily_rate',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'daily_rate' => 'integer',
        ];
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function currentAdmission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function label(): string
    {
        return "{$this->ward?->name} / bed {$this->bed_number}";
    }
}
