<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFacilityRegistrationRequest;
use App\Models\FacilityRegistration;
use App\Notifications\FacilityRegistrationReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Throwable;

class FacilityRegistrationController extends Controller
{
    /**
     * Record a facility's registration request.
     *
     * The row is written first and the notification is attempted second, so a
     * mail outage degrades to a stored registration rather than a lost one --
     * the same bargain the contact form strikes. The applicant is told the
     * account is awaiting review either way, which also stops a failed send
     * from tempting them into registering twice.
     */
    public function store(StoreFacilityRegistrationRequest $request): JsonResponse
    {
        if ($request->looksAutomated()) {
            return $this->registered();
        }

        $data = $request->safe()->only([
            'facility_name',
            'facility_type',
            'edition',
            'licence_term',
            'contact_name',
            'contact_email',
            'contact_phone',
            'username',
            'password',
        ]);

        $registration = FacilityRegistration::create([
            ...$data,
            // Hashing here rather than in the model keeps the plain value out
            // of the model layer entirely, and the months are read off the
            // term key so a hand-rolled post cannot buy twelve months of
            // one-month pricing.
            'password' => Hash::make($data['password']),
            'months' => $this->monthsFor($data['licence_term']),
            'reference' => $this->reference(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            Notification::route('mail', (string) config('tibadesk.enquiry_inbox'))
                ->notify(new FacilityRegistrationReceived($registration));
        } catch (Throwable $exception) {
            report($exception);
        }

        return $this->registered($registration->reference);
    }

    /**
     * Months for a term key, taken from the published catalogue so the stored
     * duration always matches what the site advertised.
     */
    private function monthsFor(string $licenceTerm): int
    {
        $term = collect(config('tibadesk.licence_terms'))->firstWhere('key', $licenceTerm);

        return (int) ($term['months'] ?? 0);
    }

    private function reference(): string
    {
        return 'TBR-'.Str::upper(Str::random(10));
    }

    private function registered(?string $reference = null): JsonResponse
    {
        return response()->json([
            'message' => 'Your registration is in. We review it within one business day and email you when the account is active.',
            'reference' => $reference,
        ], 202);
    }
}
