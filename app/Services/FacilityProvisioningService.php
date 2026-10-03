<?php

namespace App\Services;

use App\Data\ProvisionFacility;
use App\Enums\FacilityStatus;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Turns a paid registration into a facility that can actually be worked in.
 *
 * This is the single place a tenant is born. Everything after it — signing in,
 * the patient register, billing, reporting — depends on this having produced
 * a facility, an owner who can sign in, and the module grants for the edition
 * that was paid for. Doing it in one transaction means a failure never leaves
 * a half-built facility that nobody can delete.
 */
class FacilityProvisioningService
{
    /**
     * @return array{facility: Facility, owner: User}
     */
    public function provision(ProvisionFacility $data, bool $activate = true): array
    {
        if (User::query()->where('email', $data->ownerEmail)->exists()) {
            throw new RuntimeException(
                "The administrator email [{$data->ownerEmail}] is already registered to an account.",
            );
        }

        return DB::transaction(function () use ($data, $activate): array {
            $facility = Facility::create([
                'name' => $data->name,
                'slug' => $this->uniqueSlug($data->name),
                'edition' => $data->edition,
                'licence_term' => $data->licenceTerm,
                'licence_months' => $data->licenceMonths,
                'licence_expires_at' => $this->licenceExpiry($data->licenceMonths, $data->licenceExpiresAt),
                'status' => $activate ? FacilityStatus::Active : FacilityStatus::Pending,
                'registration_reference' => $data->registrationReference,
                'facility_type' => $data->facilityType,
                'contact_name' => $data->ownerName,
                'contact_email' => $data->ownerEmail,
                'contact_phone' => $data->ownerPhone,
                'address' => $data->address,
            ]);

            $owner = User::create([
                'facility_id' => $facility->getKey(),
                'name' => $data->ownerName,
                'email' => $data->ownerEmail,
                'email_verified_at' => now(),
                // Hashed here rather than in the model so the plaintext never
                // reaches the database layer, and never reaches a log.
                'password' => Hash::make($data->ownerPassword),
                'role' => Role::FacilityAdmin,
                'is_active' => $activate,
            ]);

            $facility->grantEditionModules($owner);

            return ['facility' => $facility, 'owner' => $owner];
        });
    }

    /**
     * Re-run provisioning for a facility that already exists.
     *
     * Used when a registration is re-sent after a partial failure, or when a
     * facility is upgraded. The owner is never overwritten: an existing
     * administrator keeps their password, because the one that arrived with
     * the registration may already have been changed by the customer.
     *
     * @return array{facility: Facility, owner: User}
     */
    public function reprovision(Facility $facility, ProvisionFacility $data, bool $activate = true): array
    {
        return DB::transaction(function () use ($facility, $data, $activate): array {
            $facility->fill([
                'edition' => $data->edition,
                'licence_term' => $data->licenceTerm,
                'licence_months' => $data->licenceMonths,
                'licence_expires_at' => $this->licenceExpiry($data->licenceMonths, $data->licenceExpiresAt),
                'facility_type' => $data->facilityType,
                'address' => $data->address,
            ]);

            if ($activate && ! $facility->status->allowsWork()) {
                $facility->status = FacilityStatus::Active;
            }

            $facility->save();

            $owner = $facility->users()
                ->where('role', Role::FacilityAdmin->value)
                ->first()
                ?? User::create([
                    'facility_id' => $facility->getKey(),
                    'name' => $data->ownerName,
                    'email' => $data->ownerEmail,
                    'email_verified_at' => now(),
                    'password' => Hash::make($data->ownerPassword),
                    'role' => Role::FacilityAdmin,
                    'is_active' => $activate,
                ]);

            $facility->grantEditionModules($owner);

            return ['facility' => $facility->fresh(), 'owner' => $owner];
        });
    }

    /**
     * Open a self-service trial.
     *
     * Goes through provision() rather than round it, so a trial is a real
     * facility built by the same code as a paid one: same edition, same module
     * grants, same owner, same defaults. There is no trial-only mode to keep in
     * step with the paid path, and nothing has to be switched off when the
     * trial ends — the licence simply lapses, and a lapsed licence is read-only.
     *
     * The trial is recorded under its own term key so that a facility which
     * never converted is identifiable later, when somebody asks why it went
     * quiet, and so it can be told apart from a licence that was paid for and
     * has since expired.
     *
     * @return array{facility: Facility, owner: User}
     */
    public function provisionTrial(ProvisionFacility $data): array
    {
        return $this->provision(new ProvisionFacility(
            name: $data->name,
            edition: $data->edition,
            ownerName: $data->ownerName,
            ownerEmail: $data->ownerEmail,
            ownerPassword: $data->ownerPassword,
            ownerPhone: $data->ownerPhone,
            // Recorded under its own key so a facility that never converted is
            // identifiable later, and can be told apart from a licence that was
            // paid for and has since run out.
            licenceTerm: 'trial',
            // Not a number of months, so it is left null rather than rounded to
            // one: a fourteen-day trial given as a month hands out twice what it
            // promises and quietly under-prices the upgrade.
            licenceMonths: null,
            // Left null deliberately: a trial has not been registered for
            // anything, and a placeholder in this unique column would collide
            // with the real registration that follows it.
            registrationReference: null,
            facilityType: $data->facilityType,
            address: $data->address,
            licenceExpiresAt: now()->addDays((int) config('tibadesk.trial.days')),
        ));
    }

    /**
     * A readable, collision-free URL slug from the facility's name.
     *
     * Two "Mkwakwa Hospital" registrations must not fight over one slug, which
     * is the normal case rather than an edge case on a registration form.
     */
    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'facility';

        $slug = $base;
        $suffix = 2;

        while (Facility::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function licenceExpiry(?int $months, ?DateTimeInterface $override): ?string
    {
        // A stated date wins, so a fourteen-day trial is fourteen days and not
        // a month rounded up. Everything sold by the month still arrives here
        // as null and is derived as before.
        if ($override !== null) {
            return Carbon::instance($override)->toDateTimeString();
        }

        return $months !== null ? now()->addMonths($months)->toDateTimeString() : null;
    }
}
