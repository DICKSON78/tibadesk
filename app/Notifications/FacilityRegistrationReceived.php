<?php

namespace App\Notifications;

use App\Models\FacilityRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Channels\MailChannel;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FacilityRegistrationReceived extends Notification
{
    use Queueable;

    public function __construct(public FacilityRegistration $registration) {}

    /**
     * @return list<class-string>
     */
    public function via(object $notifiable): array
    {
        return [MailChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $registration = $this->registration;

        return (new MailMessage)
            ->subject('New TibaDesk registration '.$registration->reference.' - '.$registration->facility_name)
            ->replyTo($registration->contact_email, $registration->contact_name)
            ->greeting('New facility registration')
            ->line('Facility: '.$registration->facility_name)
            ->line('Type: '.$registration->facility_type)
            ->line('Edition: '.$registration->edition)
            ->line('Term: '.$registration->licence_term.' ('.$registration->months.' months)')
            ->line('Contact: '.$registration->contact_name)
            ->line('Email: '.$registration->contact_email)
            ->line('Phone: '.$registration->contact_phone)
            ->line('Username: '.$registration->username)
            ->line('The account is not active until this is reviewed and approved.')
            ->salutation('TibaDesk registration inbox');
    }
}
