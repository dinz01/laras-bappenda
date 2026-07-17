<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\User;
use App\Services\WorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

it('determines allowed transitions correctly', function () {
    $service = new WorkflowService;

    // Draft -> Review
    $arsipDraft = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Draft]);
    expect($service->canTransition($arsipDraft, WorkflowStatus::Review))->toBeTrue()
        ->and($service->canTransition($arsipDraft, WorkflowStatus::Approved))->toBeFalse();

    // Review -> Approved
    $arsipReview = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);
    expect($service->canTransition($arsipReview, WorkflowStatus::Approved))->toBeTrue()
        ->and($service->canTransition($arsipReview, WorkflowStatus::Draft))->toBeFalse();

    // Approved -> Active
    $arsipApproved = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Approved]);
    expect($service->canTransition($arsipApproved, WorkflowStatus::Active))->toBeTrue()
        ->and($service->canTransition($arsipApproved, WorkflowStatus::Review))->toBeFalse();

    // Active -> Retention
    $arsipActive = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Active]);
    expect($service->canTransition($arsipActive, WorkflowStatus::Retention))->toBeTrue()
        ->and($service->canTransition($arsipActive, WorkflowStatus::Approved))->toBeFalse();

    // Retention -> Record Center
    $arsipRetention = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Retention]);
    expect($service->canTransition($arsipRetention, WorkflowStatus::RecordCenter))->toBeTrue()
        ->and($service->canTransition($arsipRetention, WorkflowStatus::Active))->toBeFalse();

    // Record Center -> Destruction
    $arsipRC = Arsip::factory()->create(['workflow_status' => WorkflowStatus::RecordCenter]);
    expect($service->canTransition($arsipRC, WorkflowStatus::Destruction))->toBeTrue()
        ->and($service->canTransition($arsipRC, WorkflowStatus::Retention))->toBeFalse();

    // Destruction -> cannot transition further
    $arsipDestructed = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Destruction]);
    expect($service->allowedTransitions($arsipDestructed))->toBeEmpty();
});

it('successfully transitions workflow status and records history', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Draft]);

    $request = Request::create('/arsip/1/workflow/advance', 'POST');

    $history = $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Review,
        keterangan: 'Tinjau dokumen',
        actor: $actor,
        request: $request,
    );

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Review);

    // Verify history record
    expect($history->status_lama)->toBe(WorkflowStatus::Draft)
        ->and($history->status_baru)->toBe(WorkflowStatus::Review)
        ->and($history->user_id)->toBe($actor->id)
        ->and($history->keterangan)->toBe('Tinjau dokumen');

    // Retrieve history collection
    $histories = $service->history($arsip);
    expect($histories->count())->toBe(1)
        ->and($histories->first()->id)->toBe($history->id);
});

it('throws exception when transitioning to an invalid status', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Draft]);

    $request = Request::create('/arsip/1/workflow/advance', 'POST');

    // Trying to transition Draft -> Approved (must fail)
    $this->expectException(InvalidArgumentException::class);
    $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Approved,
        keterangan: 'Invalid step',
        actor: $actor,
        request: $request,
    );
});
