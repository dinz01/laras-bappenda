<?php

declare(strict_types=1);

use App\Models\Arsip;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new AuditLogService;
    $this->user = User::factory()->create();
});

test('it logs create event correctly', function () {
    $arsip = Arsip::factory()->create();

    $this->service->log(
        event: 'arsip.created',
        model: $arsip,
        oldValues: null,
        newValues: ['judul' => $arsip->judul],
        actor: $this->user
    );

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.created',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::latest('id')->first();
    expect($log->old_values)->toBeNull()
        ->and($log->new_values['judul'])->toBe($arsip->judul);
});

test('it logs update event correctly', function () {
    $arsip = Arsip::factory()->create(['judul' => 'Old Title']);

    $this->service->log(
        event: 'arsip.updated',
        model: $arsip,
        oldValues: ['judul' => 'Old Title'],
        newValues: ['judul' => 'New Title'],
        actor: $this->user
    );

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.updated',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::latest('id')->first();
    expect($log->old_values['judul'])->toBe('Old Title')
        ->and($log->new_values['judul'])->toBe('New Title');
});

test('it logs delete event correctly', function () {
    $arsip = Arsip::factory()->create();

    $this->service->log(
        event: 'arsip.deleted',
        model: $arsip,
        oldValues: ['judul' => $arsip->judul],
        newValues: null,
        actor: $this->user
    );

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.deleted',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::latest('id')->first();
    expect($log->old_values['judul'])->toBe($arsip->judul)
        ->and($log->new_values)->toBeNull();
});

test('it logs restore event correctly', function () {
    $arsip = Arsip::factory()->create();

    $this->service->log(
        event: 'arsip.restored',
        model: $arsip,
        oldValues: ['deleted_at' => '2026-07-19 12:00:00'],
        newValues: ['deleted_at' => null],
        actor: $this->user
    );

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.restored',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::latest('id')->first();
    expect($log->old_values['deleted_at'])->toBe('2026-07-19 12:00:00')
        ->and($log->new_values['deleted_at'])->toBeNull();
});

test('it logs workflow event correctly', function () {
    $arsip = Arsip::factory()->create();

    $this->service->log(
        event: 'workflow.changed',
        model: $arsip,
        oldValues: ['workflow_status' => 'draft'],
        newValues: ['workflow_status' => 'review'],
        actor: $this->user
    );

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'workflow.changed',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::latest('id')->first();
    expect($log->old_values['workflow_status'])->toBe('draft')
        ->and($log->new_values['workflow_status'])->toBe('review');
});
