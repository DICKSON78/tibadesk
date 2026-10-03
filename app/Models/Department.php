<?php

namespace App\Models;

use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\DepartmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $facility_id
 * @property string $name
 */
class Department extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<DepartmentFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'code',
        'name',
        'description',
        'specialty',
        'is_active',
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

    public function referralsFrom(): HasMany
    {
        return $this->hasMany(EncounterReferral::class, 'from_department_id');
    }

    public function referralsTo(): HasMany
    {
        return $this->hasMany(EncounterReferral::class, 'to_department_id');
    }
}
