<?php

namespace App\Support\Tenancy;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Confines every query on a tenant-owned model to the current facility.
 *
 * A null facility matches nothing rather than everything. That is the whole
 * point: a controller that forgets to bind a facility returns an empty set,
 * where the alternative would be handing over one customer's patients to
 * another.
 */
class FacilityScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where(
            $model->qualifyColumn('facility_id'),
            app(CurrentFacility::class)->id(),
        );
    }
}
