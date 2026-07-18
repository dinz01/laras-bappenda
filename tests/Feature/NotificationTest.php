<?php

declare(strict_types=1);

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('unauthenticated users are redirected to login', function () {
    $this->get(route('notifications.index'))
        ->assertRedirect(route('login'));

    $this->post(route('notifications.mark-all-read'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view notification center page', function () {
    Notification::factory()->count(3)->unread()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->get(route('notifications.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications')
            ->has('filters')
            ->has('types')
        );
});

test('user can mark notification as read', function () {
    $notif = Notification::factory()->unread()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->post(route('notifications.mark-read', $notif->id))
        ->assertStatus(302);

    expect($notif->fresh()->is_read)->toBeTrue();
});

test('user cannot mark another users notification as read', function () {
    $otherUser = User::factory()->create();
    $notif = Notification::factory()->unread()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->user)
        ->post(route('notifications.mark-read', $notif->id))
        ->assertStatus(403);

    expect($notif->fresh()->is_read)->toBeFalse();
});

test('user can mark all notifications as read', function () {
    Notification::factory()->count(3)->unread()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->post(route('notifications.mark-all-read'))
        ->assertStatus(302);

    expect(Notification::where('user_id', $this->user->id)->where('is_read', false)->count())->toBe(0);
});

test('redirect endpoint marks read and redirects to correct target', function () {
    $notif = Notification::factory()->unread()->create([
        'user_id' => $this->user->id,
        'url' => '/arsip/12',
    ]);

    $this->actingAs($this->user)
        ->get(route('notifications.redirect', $notif->id))
        ->assertRedirect('/arsip/12');

    expect($notif->fresh()->is_read)->toBeTrue();
});

test('redirect endpoint fallback to notifications index if url is empty', function () {
    $notif = Notification::factory()->unread()->create([
        'user_id' => $this->user->id,
        'url' => null,
    ]);

    $this->actingAs($this->user)
        ->get(route('notifications.redirect', $notif->id))
        ->assertRedirect(route('notifications.index'));

    expect($notif->fresh()->is_read)->toBeTrue();
});
