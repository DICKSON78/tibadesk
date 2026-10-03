<?php

namespace App\Http\Controllers\Api;

use App\Data\ProvisionFacility;
use App\Enums\Edition;
use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Services\FacilityProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Turns an approved website registration into a working facility.
 *
 * This endpoint is the seam between the two systems, so it is deliberately
 * closed: a shared secret header, a throttle, and idempotency on the
 * registration reference. Retrying a failed activation must never produce two
 * facilities for one customer.
 */
class FacilityActivationController extends Controller
{
    public function __construct(private readonly FacilityProvisioningService $provisioning) {}

    public function store(Request $request): JsonResponse
    {
        $this->authorizeSecret($request);

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'edition' => ['required', Rule::in(array_column(Edition::cases(), 'value'))],
            'owner_name' => ['required', 'string', 'max:180'],
            'owner_email' => ['required', 'string', 'email:filter', 'max:180'],
            'owner_password' => ['required', 'string', 'min:8', 'max:200'],
            'owner_phone' => ['nullable', 'string', 'max:40'],
            'licence_term' => ['nullable', 'string', 'max:40'],
            'licence_months' => ['nullable', 'integer', 'between:1,60'],
            'registration_reference' => ['required', 'string', 'max:24'],
            'facility_type' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
        ], [
            'owner_password.min' => 'The administrator password must be at least 8 characters.',
        ]);

        $existing = Facility::query()
            ->where('registration_reference', $payload['registration_reference'])
            ->first();

        if ($existing !== null) {
            // A retry is only a retry if it is asking for the same thing. The
            // same reference carrying a different facility is a conflict, and
            // answering it with the first facility's details would hand the
            // website a success that quietly built the wrong tenant.
            if (! $this->isSameActivation($existing, $payload)) {
                throw ValidationException::withMessages([
                    'registration_reference' => 'That registration reference has already been activated for a different facility.',
                ]);
            }

            return response()->json([
                'message' => 'This registration was already activated.',
                'facility' => $this->facilityPayload($existing),
            ]);
        }

        $data = ProvisionFacility::fromArray([
            'name' => $payload['name'],
            'edition' => $payload['edition'],
            'ownerName' => $payload['owner_name'],
            'ownerEmail' => $payload['owner_email'],
            'ownerPassword' => $payload['owner_password'],
            'ownerPhone' => $payload['owner_phone'] ?? null,
            'licenceTerm' => $payload['licence_term'] ?? null,
            'licenceMonths' => $payload['licence_months'] ?? null,
            'registrationReference' => $payload['registration_reference'],
            'facilityType' => $payload['facility_type'] ?? null,
            'address' => $payload['address'] ?? null,
        ]);

        ['facility' => $facility] = $this->provisioning->provision($data);

        return response()->json([
            'message' => 'Facility activated.',
            'facility' => $this->facilityPayload($facility),
        ], JsonResponse::HTTP_CREATED);
    }

    /**
     * Whether a repeated reference is the same activation being retried.
     *
     * The owner email is the discriminator: it is unique across the system, so
     * two activations for one reference can only be the same customer if they
     * name the same administrator.
     *
     * @param  array<string, mixed>  $payload
     */
    private function isSameActivation(Facility $existing, array $payload): bool
    {
        return $existing->name === $payload['name']
            && $existing->edition->value === $payload['edition']
            && mb_strtolower($existing->contact_email ?? '') === mb_strtolower($payload['owner_email']);
    }

    /**
     * Compare in constant time so the endpoint cannot be probed one guess at a
     * time by timing the response.
     */
    private function authorizeSecret(Request $request): void
    {
        $expected = (string) config('services.tibadesk.activation_key');
        $provided = (string) $request->header('X-TibaDesk-Activation-Key', '');

        if ($expected === '') {
            throw new AccessDeniedHttpException('Activation is not configured on this server.');
        }

        if (! hash_equals($expected, $provided)) {
            throw new AccessDeniedHttpException('Invalid activation key.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function facilityPayload(Facility $facility): array
    {
        return [
            'id' => $facility->id,
            'name' => $facility->name,
            'slug' => $facility->slug,
            'edition' => $facility->edition->value,
            'status' => $facility->status->value,
            'licence_expires_at' => $facility->licence_expires_at?->toDateString(),
            'registration_reference' => $facility->registration_reference,
            'modules' => $facility->enabledModuleValues(),
        ];
    }
}
