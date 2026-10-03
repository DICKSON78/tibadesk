<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Notifications\ContactMessageReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;
use Throwable;

class ContactMessageController extends Controller
{
    /**
     * Store a contact form enquiry and alert the team inbox.
     *
     * The row is written first and the notification is attempted second, so a
     * mail outage degrades to a stored enquiry rather than a lost one. The
     * visitor still gets the same confirmation either way, which also stops a
     * failed send from tempting them into resubmitting.
     */
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        if ($request->looksAutomated()) {
            return $this->received();
        }

        $message = ContactMessage::create([
            ...$request->safe()->only(['name', 'email', 'phone', 'facility', 'message']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            Notification::route('mail', (string) config('tibadesk.enquiry_inbox'))
                ->notify(new ContactMessageReceived($message));
        } catch (Throwable $exception) {
            report($exception);
        }

        return $this->received();
    }

    private function received(): JsonResponse
    {
        return response()->json([
            'message' => 'We have your message and will reply within one business day.',
        ], 202);
    }
}
