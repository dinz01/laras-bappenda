<?php

declare(strict_types=1);

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new NotificationService;
    $this->user = User::factory()->create();
});

test('create notification', function () {
    $notif = $this->service->create(
        user: $this->user,
        type: NotificationType::ArsipBaru,
        title: 'New Archive',
        message: 'A new archive has been uploaded.',
        url: '/arsip/1'
    );

    expect($notif)->toBeInstanceOf(Notification::class)
        ->and($notif->user_id)->toBe($this->user->id)
        ->and($notif->type)->toBe(NotificationType::ArsipBaru)
        ->and($notif->title)->toBe('New Archive')
        ->and($notif->message)->toBe('A new archive has been uploaded.')
        ->and($notif->url)->toBe('/arsip/1')
        ->and($notif->is_read)->toBeFalse();
});

test('mark as read', function () {
    $notif = Notification::factory()->unread()->create([
        'user_id' => $this->user->id,
    ]);

    $this->service->markAsRead($notif);

    expect($notif->fresh()->is_read)->toBeTrue();
});

test('mark all as read', function () {
    Notification::factory()->count(3)->unread()->create([
        'user_id' => $this->user->id,
    ]);
    Notification::factory()->read()->create([
        'user_id' => $this->user->id,
    ]);

    // Create another user's notifications to ensure scoped correctly
    $otherUser = User::factory()->create();
    Notification::factory()->unread()->create([
        'user_id' => $otherUser->id,
    ]);

    $updated = $this->service->markAllAsRead($this->user);

    expect($updated)->toBe(3)
        ->and($this->service->unreadCount($this->user))->toBe(0)
        ->and($this->service->unreadCount($otherUser))->toBe(1);
});

test('latest notifications retrieved in correct order and limited', function () {
    // Create 12 notifications with different timestamps
    for ($i = 1; $i <= 12; $i++) {
        Notification::factory()->create([
            'user_id' => $this->user->id,
            'title' => "Notification {$i}",
            'created_at' => now()->addMinutes($i),
        ]);
    }

    $latest = $this->service->latest($this->user, 10);

    expect($latest->count())->toBe(10)
        ->and($latest->first()->title)->toBe('Notification 12')
        ->and($latest->last()->title)->toBe('Notification 3');
});

test('unread count', function () {
    Notification::factory()->count(2)->unread()->create(['user_id' => $this->user->id]);
    Notification::factory()->count(1)->read()->create(['user_id' => $this->user->id]);

    expect($this->service->unreadCount($this->user))->toBe(2);
});

test('paginate and filter notifications', function () {
    // Search match
    Notification::factory()->unread()->create([
        'user_id' => $this->user->id,
        'title' => 'Laporan Tahunan',
        'message' => 'Laporan pajak tahun 2026',
        'type' => NotificationType::ArsipBaru,
    ]);

    // Type match
    Notification::factory()->read()->create([
        'user_id' => $this->user->id,
        'title' => 'Proses OCR',
        'message' => 'OCR selesai diproses',
        'type' => NotificationType::OcrSelesai,
    ]);

    // 1. Test search filter
    $resultSearch = $this->service->paginate($this->user, ['search' => 'pajak']);
    expect($resultSearch->total())->toBe(1)
        ->and($resultSearch->first()->title)->toBe('Laporan Tahunan');

    // 2. Test type filter
    $resultType = $this->service->paginate($this->user, ['type' => 'ocr_selesai']);
    expect($resultType->total())->toBe(1)
        ->and($resultType->first()->title)->toBe('Proses OCR');

    // 3. Test status filter
    $resultUnread = $this->service->paginate($this->user, ['status' => 'unread']);
    expect($resultUnread->total())->toBe(1)
        ->and($resultUnread->first()->title)->toBe('Laporan Tahunan');

    $resultRead = $this->service->paginate($this->user, ['status' => 'read']);
    expect($resultRead->total())->toBe(1)
        ->and($resultRead->first()->title)->toBe('Proses OCR');
});

test('delete expired notifications', function () {
    Notification::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subDays(91),
    ]);
    Notification::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subDays(89),
    ]);

    $deleted = $this->service->deleteExpired();

    expect($deleted)->toBe(1)
        ->and(Notification::count())->toBe(1);
});
