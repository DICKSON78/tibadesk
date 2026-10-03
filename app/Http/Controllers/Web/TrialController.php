<?php

namespace App\Http\Controllers\Web;

use App\Data\ProvisionFacility;
use App\Enums\Edition;
use App\Http\Controllers\Controller;
use App\Http\Requests\StartTrialRequest;
use App\Services\FacilityProvisioningService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

/**
 * The page a visitor lands on after seeing the demo, and the button that opens
 * the trial.
 *
 * This is the Odoo-shaped part of the product, with the database-per-customer
 * part left out on purpose. A customer gets their own patients, their own
 * reports and their own set of modules either way; the difference is that this
 * one is a row rather than a whole database, so it costs nothing to open,
 * nothing to back up separately, and still allows the platform to see across
 * customers when it needs to.
 */
class TrialController extends Controller
{
    public function __construct(private readonly FacilityProvisioningService $provisioning) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user() !== null) {
            return redirect()->route('dashboard');
        }

        if (! config('tibadesk.trial.enabled')) {
            throw new HttpException(404);
        }

        return Inertia::render('Auth/StartTrial', [
            'trial' => [
                'days' => (int) config('tibadesk.trial.days'),
                // Sent from the same place the rule is defined, so the hint on
                // the field can never promise a shorter password than the
                // request accepts.
                'password_min_length' => (int) config('tibadesk.trial.password_min_length'),
            ],
            'editions' => $this->triallableEditions(),
        ]);
    }

    public function store(StartTrialRequest $request): RedirectResponse
    {
        if (! config('tibadesk.trial.enabled')) {
            throw new HttpException(404);
        }

        try {
            ['facility' => $facility] = $this->provisioning->provisionTrial(ProvisionFacility::fromArray([
                'name' => (string) $request->input('facility_name'),
                'edition' => (string) $request->input('edition'),
                'ownerName' => (string) $request->input('owner_name'),
                'ownerEmail' => (string) $request->input('owner_email'),
                'ownerPassword' => (string) $request->input('password'),
                'ownerPhone' => $request->input('owner_phone'),
                'facilityType' => $request->input('facility_type'),
                'address' => $request->input('address'),
            ]));
        } catch (Throwable $e) {
            // Anything unexpected goes to the log with the address attached,
            // because an address that fails to open a trial is a sales lead
            // sitting behind an error page. The form itself is put back with
            // their details so they do not have to retype the lot.
            Log::error('Trial could not be started', [
                'email' => $request->input('owner_email'),
                'exception' => $e,
            ]);

            return back()
                ->withInput($request->except('password'))
                ->withErrors(['owner_email' => 'We could not open your trial just now. Please try again.']);
        }

        return redirect()
            ->route('login')
            ->with('success', sprintf(
                'Your %d-day trial of %s is ready. Sign in as %s.',
                (int) config('tibadesk.trial.days'),
                $facility->name,
                (string) $request->input('owner_email'),
            ))
            ->with('trial_expires_at', $facility->licence_expires_at?->toDateString());
    }

    /**
     * The editions on offer, in the order they are configured, each already
     * resolved into the modules it will actually be granted.
     *
     * Built from the same config the API catalogue and the entitlement check
     * read, so the page cannot advertise an edition that the running system
     * would refuse.
     *
     * @return list<array<string, mixed>>
     */
    private function triallableEditions(): array
    {
        return array_values(array_map(
            fn (string $key): array => $this->describe(Edition::from($key)),
            StartTrialRequest::triallableEditions(),
        ));
    }

    /**
     * @return array<string, mixed>
     */
    private function describe(Edition $edition): array
    {
        return [
            'key' => $edition->value,
            'name' => $edition->label(),
            'tagline' => $edition->tagline(),
            'modules' => array_map(
                fn ($module) => ['key' => $module->value, 'name' => $module->label()],
                $edition->modules(),
            ),
        ];
    }
}
