<?php

use App\Enums\WorkflowStatus;
use App\Events\WorkflowTransitioned;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

it('advances workflow status via http request and logs activity', function () {
    Event::fake();

    $user = User::factory()->create();
    $user->givePermissionTo('kelola-arsip.update');
    $this->actingAs($user);

    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $response = $this->post(route('arsip.workflow.advance', $arsip), [
        'target_status' => WorkflowStatus::Approved->value,
        'keterangan' => 'Menyetujui arsip',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Approved);

    // Verify history stored
    $history = ArsipWorkflowHistory::where('arsip_id', $arsip->id)->first();
    expect($history)->not->toBeNull()
        ->and($history->status_lama)->toBe(WorkflowStatus::Review)
        ->and($history->status_baru)->toBe(WorkflowStatus::Approved)
        ->and($history->keterangan)->toBe('Menyetujui arsip')
        ->and($history->user_id)->toBe($user->id);

    // Verify audit log recorded
    $auditLog = AuditLog::where('auditable_type', Arsip::class)
        ->where('auditable_id', $arsip->id)
        ->first();

    expect($auditLog)->not->toBeNull()
        ->and($auditLog->event)->toBe('workflow.changed')
        ->and($auditLog->old_values['workflow_status'])->toBe('review')
        ->and($auditLog->new_values['workflow_status'])->toBe('approved')
        ->and($auditLog->user_id)->toBe($user->id);

    // Verify event dispatched
    Event::assertDispatched(WorkflowTransitioned::class, function ($event) use ($arsip, $user) {
        return $event->arsip->id === $arsip->id
            && $event->from === WorkflowStatus::Review
            && $event->to === WorkflowStatus::Approved
            && $event->actor->id === $user->id;
    });
});

it('rejects invalid workflow status transitions via http request', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('kelola-arsip.update');
    $this->actingAs($user);

    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    // Attempt Review -> Active directly (invalid)
    $response = $this->post(route('arsip.workflow.advance', $arsip), [
        'target_status' => WorkflowStatus::Active->value,
        'keterangan' => 'Mencoba lompat status',
    ]);

    $response->assertSessionHasErrors(['workflow']);

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Review);
});
