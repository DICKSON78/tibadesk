<?php

namespace App\Console\Commands;

use App\Data\ProvisionFacility;
use App\Enums\Edition;
use App\Models\Facility;
use App\Services\FacilityProvisioningService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Throwable;

/**
 * Activates a registration by hand, for a phone order or a backfill.
 *
 * The website calls the API for the normal path; this exists so support can
 * provision a customer at 6pm on a Friday without a deploy. It asks for
 * everything it needs rather than reading a file, so there is no way to run it
 * with a half-filled customer and discover the problem afterwards.
 */
class ActivateFacility extends Command
{
    protected $signature = 'tibadesk:activate-facility
                            {--name= : Registered name of the facility}
                            {--edition= : dental-clinic, eye-clinic, polyclinic or hospital}
                            {--owner-name= : Administrator’s full name}
                            {--owner-email= : Administrator’s sign-in email}
                            {--password= : Administrator’s password (generated if omitted)}
                            {--licence-months= : Licence length in months}
                            {--reference= : Website registration reference, e.g. TBR-XXXXXXXX}
                            {--reprovision= : Re-run provisioning for an existing facility instead of creating one}';

    protected $description = 'Turn an approved registration into a working facility with an administrator and its edition modules';

    public function handle(FacilityProvisioningService $provisioning): int
    {
        $edition = $this->option('edition');

        $validator = Validator::make([
            'name' => $this->option('name'),
            'edition' => $edition,
            'owner_name' => $this->option('owner-name'),
            'owner_email' => $this->option('owner-email'),
            'licence_months' => $this->option('licence-months'),
            'reference' => $this->option('reference'),
        ], [
            'name' => ['required', 'string', 'max:180'],
            'edition' => ['required', Rule::in(array_column(Edition::cases(), 'value'))],
            'owner_name' => ['required', 'string', 'max:180'],
            'owner_email' => ['required', 'string', 'email:filter', 'max:180'],
            'licence_months' => ['nullable', 'integer', 'between:1,60'],
            'reference' => ['required', 'string', 'max:24'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->components->error($error);
            }

            return self::FAILURE;
        }

        $generated = $this->option('password') === null;
        $password = $this->option('password') ?? $this->generatePassword();

        $data = ProvisionFacility::fromArray([
            'name' => $this->option('name'),
            'edition' => $edition,
            'ownerName' => $this->option('owner-name'),
            'ownerEmail' => $this->option('owner-email'),
            'ownerPassword' => $password,
            'licenceMonths' => $this->option('licence-months'),
            'registrationReference' => $this->option('reference'),
        ]);

        try {
            if ($this->option('reprovision')) {
                $facility = Facility::query()
                    ->where('registration_reference', $this->option('reference'))
                    ->first();

                if ($facility === null) {
                    $this->components->error('No facility exists with that registration reference.');

                    return self::FAILURE;
                }

                $result = $provisioning->reprovision($facility, $data);
            } else {
                $result = $provisioning->provision($data);
            }

            $facility = $result['facility'];
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $this->components->info("Facility [{$facility->name}] is active as [{$facility->slug}].");
        $this->components->twoColumnDetail('Edition', $facility->edition->value);
        $this->components->twoColumnDetail('Modules', implode(', ', $facility->enabledModuleValues()));
        $this->components->twoColumnDetail('Administrator', $data->ownerEmail);

        if ($generated) {
            // The only time the password is ever shown, because it was just
            // generated and nobody has seen it.
            $this->newLine();
            $this->components->twoColumnDetail('<fg=yellow>Generated password</>', $password);
            $this->components->warn('This password is not stored anywhere and cannot be shown again.');
        }

        return self::SUCCESS;
    }

    private function generatePassword(): string
    {
        return 'Tiba'.str()->random(4).'-'.str()->random(4).'-'.str()->random(4);
    }
}
