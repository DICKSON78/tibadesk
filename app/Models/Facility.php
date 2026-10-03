<?php

namespace App\Models;

use App\Enums\Edition;
use App\Enums\FacilityStatus;
use App\Enums\Module;
use App\Pharmacy\Models\StockLocation;
use App\Support\Tenancy\FacilityScope;
use Database\Factories\FacilityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A customer facility. This is the tenant: every patient, encounter and
 * consultation belongs to exactly one of these, and the row carries what was
 * sold plus where the licence runs to.
 *
 * @property int $id
 * @property Edition $edition
 * @property FacilityStatus $status
 */
class Facility extends Model
{
    /** @use HasFactory<FacilityFactory> */
    use HasFactory;

    /**
     * Facilities are the tenant itself, so they are deliberately not scoped:
     * a request must be able to look one up before anything is bound.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'edition',
        'licence_term',
        'licence_months',
        'licence_expires_at',
        'status',
        'registration_reference',
        'facility_type',
        'contact_name',
        'contact_email',
        'contact_phone',
        'address',
        'logo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'edition' => Edition::class,
            'status' => FacilityStatus::class,
            'licence_months' => 'integer',
            'licence_expires_at' => 'datetime',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function encounters(): HasMany
    {
        return $this->hasMany(Encounter::class);
    }

    public function moduleGrants(): HasMany
    {
        return $this->hasMany(FacilityModule::class);
    }

    /**
     * Whether the licence has run past the date it was sold to.
     *
     * Read off the date rather than off `status`, because status only says
     * whether somebody has decided this facility is finished. A licence lapses
     * on its own every midnight, without anyone deciding anything, and a status
     * that has to be flipped by hand is a status that will eventually be missed.
     * A null expiry is treated as not lapsed: a facility provisioned without a
     * term is not one this method gets to refuse.
     */
    public function isLicenceLapsed(): bool
    {
        if (! $this->status->allowsWork()) {
            return false;
        }

        return $this->licence_expires_at !== null
            && $this->licence_expires_at->isPast();
    }

    /**
     * Whether this facility may still add to its records.
     *
     * A lapsed facility is read-only rather than switched off. It is a
     * healthcare system: a clinician part-way through a consultation has to be
     * able to read the patient's chart, their history and their allergies when
     * an invoice has gone unpaid, and a licence is a commercial matter that
     * should not be able to withhold a patient's own record from the people
     * treating them. It also has to keep serving reads for the legal and audit
     * reasons a medical record has to outlive the software holding it.
     *
     * Self-healing is the other reason: renewing moves `licence_expires_at` into
     * the future and full access returns on the next request, with no
     * reactivation step that somebody can forget or that can fail halfway and
     * leave a paying customer locked out. Flipping status to Expired would need
     * a nightly job and would need that job to be right.
     */
    public function isReadOnly(): bool
    {
        return $this->isLicenceLapsed();
    }

    /**
     * Whether this facility may use a module right now.
     *
     * The grant must exist and not be revoked; a suspended or expired facility
     * holds no usable modules at all, which is what makes suspending a facility
     * actually stop work rather than merely warn about it.
     */
    public function hasModule(Module $module): bool
    {
        if (! $this->status->allowsWork()) {
            return false;
        }

        return $this->ownModuleGrants()
            ->where('module', $module->value)
            ->whereNull('revoked_at')
            ->exists();
    }

    /**
     * The modules this facility may actually use right now.
     *
     * Agrees with hasModule() by construction: a facility that cannot work
     * holds no usable modules, so the API never advertises an entitlement that
     * a request would then refuse.
     *
     * @return list<Module>
     */
    public function modules(): array
    {
        if (! $this->status->allowsWork()) {
            return [];
        }

        // FacilityModule casts `module` to the enum already, so the grant is
        // handed back as-is rather than run back through Module::from().
        return $this->ownModuleGrants()
            ->whereNull('revoked_at')
            ->get()
            ->map(fn (FacilityModule $grant): Module => $grant->module)
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    public function enabledModuleValues(): array
    {
        return array_map(
            static fn (Module $module): string => $module->value,
            $this->modules(),
        );
    }

    /**
     * This facility's grants, ignoring the request-wide tenant scope.
     *
     * A facility asking about its own entitlements is the one question the
     * scope must not be allowed to answer, because these calls happen in
     * places where nothing is bound yet: signing a user in, granting an
     * edition, and deciding whether a licence has lapsed. Reading through the
     * scope there would return no grants for a facility that has plenty.
     *
     * @return HasMany<FacilityModule, $this>
     */
    public function ownModuleGrants(): HasMany
    {
        return $this->moduleGrants()->withoutGlobalScope(FacilityScope::class);
    }

    /**
     * Grant everything the edition entitles the facility to.
     *
     * Modules the facility already holds are left alone, so re-provisioning
     * after an upsell adds what is missing and revokes nothing.
     */
    public function grantEditionModules(?User $grantedBy = null): void
    {
        $now = now();

        foreach ($this->edition->modules() as $module) {
            $this->ownModuleGrants()->updateOrCreate(
                [
                    'facility_id' => $this->getKey(),
                    'module' => $module->value,
                ],
                [
                    'granted_at' => $now,
                    'revoked_at' => null,
                    'granted_by' => $grantedBy?->getKey(),
                ],
            );
        }

        $this->ensureDefaultDispensary();
    }

    /**
     * Give the facility a dispensary to receive into.
     *
     * Stock is held per batch and per location, and a ledger entry needs
     * somewhere to land, so a facility that has just been given the pharmacy
     * module would otherwise be unable to receive its first delivery. Provision
     * it here rather than asking every registration path to remember.
     */
    public function ensureDefaultDispensary(): void
    {
        if (! $this->hasModule(Module::Pharmacy)) {
            return;
        }

        $locations = [
            'MAIN' => ['name' => 'Main Dispensary', 'kind' => 'store'],
            // Goods on their way between stores live here. Without somewhere
            // to put them, a transfer either leaves the stock sitting in the
            // source store (where it could still be dispensed) or credits the
            // destination before the van arrives.
            'TRANSIT' => ['name' => 'Stock in transit', 'kind' => 'transit'],
        ];

        foreach ($locations as $code => $attributes) {
            StockLocation::query()->withoutGlobalScope(FacilityScope::class)->firstOrCreate(
                [
                    'facility_id' => $this->getKey(),
                    'code' => $code,
                ],
                $attributes + ['is_active' => true],
            );
        }
    }

    /**
     * The holding location for goods that have left one store and not yet
     * reached another.
     */
    public function transitLocationId(): int
    {
        $this->ensureDefaultDispensary();

        return (int) StockLocation::query()
            ->where('code', 'TRANSIT')
            ->value('id');
    }
}
