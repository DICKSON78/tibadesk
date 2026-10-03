<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\WardFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property string $name
 */
class Ward extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<WardFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'code',
        'name',
        'specialty',
        'description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
        ];
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    public function availableBeds(): int
    {
        return $this->beds()->where('status', 'available')->count();
    }

    public function totalBeds(): int
    {
        return $this->beds()->count();
    }
}
