<?php

namespace App\Http\Controllers\Api;

use App\Data\ProvisionFacility;
use App\Enums\Edition;
use App\Http\Controllers\Controller;
use App\Http\Requests\StartTrialRequest;
use App\Services\FacilityProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * The public face of a self-service trial: what is on offer, and opening one.
 *
 * These two routes are the only unauthenticated routes that read and write
 * anything of substance, which is the whole point of a trial but also the whole
 * risk. The catalogue is safe to publish — it is configuration that would be
 * visible from the interface anyway. Starting a trial is not, so it is
 * throttled, validated hard, and allowed to create exactly one tenant per
 * request.
 */
class TrialController extends Controller
{
    public function __construct(private readonly FacilityProvisioningService $provisioning) {}

    /**
     * What a visitor can try, and what each edition contains.
     *
     * Published rather than fetched from the marketing site, because this is
     * the system that would have to honour the promise. A catalogue the shop
     * and the application both read from is the only kind that cannot drift
     * into offering a module the running system refuses to grant.
     */
    public function catalogue(Request $request): JsonResponse
    {
        $enabled = (bool) config('tibadesk.trial.enabled');
        $triallable = $enabled ? StartTrialRequest::triallableEditions() : [];

        $editions = collect(Edition::cases())
            ->map(fn (Edition $edition): array => [
                'key' => $edition->value,
                'name' => $edition->label(),
                'tagline' => $edition->tagline(),
                'modules' => array_map(
                    fn ($module) => [
                        'key' => $module->value,
                        'name' => $module->label(),
                    ],
                    $edition->modules(),
                ),
                'triallable' => in_array($edition->value, $triallable, true),
            ])
            ->values();

        return response()->json([
            'trial' => [
                'enabled' => $enabled,
                'days' => (int) config('tibadesk.trial.days'),
            ],
            'editions' => $editions,
        ]);
    }

    /**
     * Open a trial and hand back the account that can sign in to it.
     *
     * The owner is created active and verified so that somebody can get in
     * immediately: a trial that has to be approved by email before it opens is
     * a demo request form, not a trial, and the one behaviour that would make
     * people give up. Verification is the obvious next hardening step once a
     * real mail transport is configured, and it belongs here rather than in the
     * provisioning service so the paid path is not slowed by it.
     */
    public function store(StartTrialRequest $request): JsonResponse
    {
        if (! config('tibadesk.trial.enabled')) {
            throw new HttpException(503, 'Trials are not available at the moment.');
        }

        $data = ProvisionFacility::fromArray([
            'name' => (string) $request->input('facility_name'),
            'edition' => (string) $request->input('edition'),
            'ownerName' => (string) $request->input('owner_name'),
            'ownerEmail' => (string) $request->input('owner_email'),
            'ownerPassword' => (string) $request->input('password'),
            'ownerPhone' => $request->input('owner_phone'),
            'facilityType' => $request->input('facility_type'),
            'address' => $request->input('address'),
        ]);

        try {
            ['facility' => $facility, 'owner' => $owner] = $this->provisioning->provisionTrial($data);
        } catch (RuntimeException $e) {
            // The address was unique a moment ago, so this is a race rather than
            // a mistake, and it deserves the same answer a validation failure
            // would have given.
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['owner_email' => [$e->getMessage()]],
            ], 422);
        }

        return response()->json([
            'message' => 'Your trial is ready. Sign in with the account below.',
            'trial' => [
                'facility' => $facility->name,
                'edition' => $facility->edition->label(),
                'expires_at' => $facility->licence_expires_at?->toDateString(),
                'modules' => $facility->enabledModuleValues(),
            ],
            'account' => [
                'email' => $owner->email,
                // Deliberately not returned: the person chose it and already
                // has it, and no response body should carry a password.
            ],
        ], 201);
    }
}
