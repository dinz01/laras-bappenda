<?php

use App\Models\User;
use App\Notifications\SendUsernameNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

it('can view forgot username page', function () {
    $this->get(route('forgot-username.request'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/forgot-username'));
});

it('sends username notification when email exists', function () {
    Notification::fake();

    $user = User::factory()->create([
        'username' => 'petugas1',
        'email' => 'petugas1@example.com',
    ]);

    $this->post(route('forgot-username.email'), [
        'email' => 'petugas1@example.com',
    ])
        ->assertRedirect()
        ->assertSessionHas('status');

    Notification::assertSentTo($user, SendUsernameNotification::class, function ($notification) {
        return $notification->username === 'petugas1';
    });
});

it('does not leak user existence for non-existent email', function () {
    Notification::fake();

    $this->post(route('forgot-username.email'), [
        'email' => 'notfound@example.com',
    ])
        ->assertRedirect()
        ->assertSessionHas('status');

    Notification::assertNothingSent();
});

it('validates email field', function () {
    $this->post(route('forgot-username.email'), [
        'email' => '',
    ])->assertSessionHasErrors(['email']);

    $this->post(route('forgot-username.email'), [
        'email' => 'not-an-email',
    ])->assertSessionHasErrors(['email']);
});
