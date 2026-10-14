<?php

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('reset password link screen can be rendered', function () {
    $response = $this->get(route('password.request'));

    $response->assertOk();
});

test('reset password link can be requested using username', function () {
    Notification::fake();

    $user = User::factory()->create([
        'username' => 'petugas_arsip',
        'email' => 'petugas@example.com',
    ]);

    $this->post(route('password.email'), ['username' => $user->username])
        ->assertRedirect()
        ->assertSessionHas('status');

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create([
        'username' => 'petugas_arsip',
        'email' => 'petugas@example.com',
    ]);

    $this->post(route('password.email'), ['username' => $user->username]);

    Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
        $response = $this->get(route('password.reset', [
            'token' => $notification->token,
            'email' => $user->email,
        ]));

        $response->assertOk();

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create([
        'username' => 'petugas_arsip',
        'email' => 'petugas@example.com',
    ]);

    $this->post(route('password.email'), ['username' => $user->username]);

    Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
        $response = $this->post(route('password.update'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        return true;
    });
});

test('password cannot be reset with invalid token', function () {
    $user = User::factory()->create();

    $response = $this->post(route('password.update'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('password cannot be reset with the same old password', function () {
    Notification::fake();

    $user = User::factory()->create([
        'username' => 'petugas_arsip',
        'email' => 'petugas@example.com',
        'password' => 'password123',
    ]);

    $this->post(route('password.email'), ['username' => $user->username]);

    Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
        $response = $this->post(route('password.update'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['password']);

        return true;
    });
});
