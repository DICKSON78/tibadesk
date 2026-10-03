<?php

namespace App\Support\Tenancy;

use App\Models\Facility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Marks a model as belonging to exactly one facility and confines it to that
 * facility's data by default.
 *
 * @property int $facility_id
 */
trait BelongsToFacility
{
    public static function bootBelongsToFacility(): void
    {
        static::addGlobalScope(new FacilityScope);

        static::creating(function (Model $model): void {
            // A caller may name the facility explicitly (provisioning, imports,
            // tests); otherwise it must come from the bound facility or the
            // write is refused rather than filed under nobody.
            if ($model->getAttribute('facility_id') === null) {
                $model->setAttribute('facility_id', app(CurrentFacility::class)->idOrFail());
            }
        });
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    /**
     * Escape hatch for platform staff and reporting, which legitimately read
     * across facilities. It is a method rather than a query string parameter
     * on purpose: a caller has to write it, so it shows up in review.
     */
    public function scopeAcrossFacilities(Builder $query, Facility|int $facility): Builder
    {
        return $query
            ->withoutGlobalScope(FacilityScope::class)
            ->where('facility_id', $facility instanceof Facility ? $facility->getKey() : $facility);
    }
}
