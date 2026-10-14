<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendUsernameNotification extends Notification
{
    use Queueable;

    public function __construct(public string $username) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengingat Nama Pengguna - LARAS BAPPENDA')
            ->view('emails.username-reminder', [
                'username' => $this->username,
                'name' => $notifiable->name ?? 'Pengguna',
                'loginUrl' => url('/login'),
            ]);
    }
}
