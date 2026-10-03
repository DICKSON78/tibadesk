<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Channels\MailChannel;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactMessageReceived extends Notification
{
    use Queueable;

    public function __construct(public ContactMessage $contactMessage) {}

    /**
     * @return list<class-string>
     */
    public function via(object $notifiable): array
    {
        return [MailChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = $this->contactMessage;

        $mail = (new MailMessage)
            ->subject('New TibaDesk enquiry from '.$message->name)
            ->replyTo($message->email, $message->name)
            ->greeting('New website enquiry')
            ->line('Name: '.$message->name)
            ->line('Email: '.$message->email)
            ->line('Phone: '.$message->phone);

        if ($message->facility) {
            $mail->line('Facility: '.$message->facility);
        }

        return $mail
            ->line('Message:')
            ->line($message->message)
            ->salutation('TibaDesk enquiry inbox');
    }
}
