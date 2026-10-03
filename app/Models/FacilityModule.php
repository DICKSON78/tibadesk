<?php

namespace App\Models;

use App\Enums\Module;
use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\FacilityModuleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One module a facility is entitled to.
 *
 * @property Module $module
 * @property bool $is_revoked
 */
class FacilityModule extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<FacilityModuleFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'module',
        'granted_at',
        'revoked_at',
        'granted_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'module' => Module::class,
            'granted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }
}
