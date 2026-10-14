<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\User;
use App\Services\DashboardService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('calculates dashboard main statistics correctly', function () {
    $service = new DashboardService;

    Arsip::factory()->count(3)->create(['workflow_status' => WorkflowStatus::Active]);
    Arsip::factory()->count(2)->create(['workflow_status' => WorkflowStatus::Inactive]);
    Arsip::factory()->count(1)->create(['workflow_status' => WorkflowStatus::Permanen]);

    $stats = $service->mainStatistics();

    expect($stats['total'])->toBe(6)
        ->and($stats['aktif'])->toBe(3)
        ->and($stats['inaktif'])->toBe(2)
        ->and($stats['permanen'])->toBe(1);
});

it('groups dashboard statistics by workflow status stage correctly', function () {
    $service = new DashboardService;

    Arsip::factory()->count(2)->create(['workflow_status' => WorkflowStatus::Review]);
    Arsip::factory()->count(1)->create(['workflow_status' => WorkflowStatus::Approved]);

    $stats = $service->tahapStatistics();

    expect($stats['review'])->toBe(2)
        ->and($stats['approved'])->toBe(1)
        ->and($stats['revisi'])->toBe(0);
});

it('retrieves recent dashboard activities sorted by date', function () {
    $service = new DashboardService;

    $user = User::factory()->create(['name' => 'John Doe']);
    $createdAt = CarbonImmutable::parse('2026-07-19 21:20:00', config('app.timezone'));

    // Create an archive (which will be in recent activities as Created)
    $arsip = Arsip::factory()->create([
        'judul' => 'Arsip Penting',
        'created_by' => $user->id,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);

    $activities = $service->recentActivities();

    expect($activities->first())
        ->toHaveKey('judul', 'Arsip Penting')
        ->toHaveKey('aktivitas', 'Arsip dibuat');
});

it('handles soft deleted archives in recent activities without crashing', function () {
    $service = new DashboardService;

    $user = User::factory()->create(['name' => 'Jane Doe']);
    $createdAt = CarbonImmutable::parse('2026-07-19 21:20:00', config('app.timezone'));

    $arsip = Arsip::factory()->create([
        'judul' => 'Arsip Yang Dihapus',
        'created_by' => $user->id,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);

    // Add workflow history
    ArsipWorkflowHistory::create([
        'arsip_id' => $arsip->id,
        'status_lama' => WorkflowStatus::Review,
        'status_baru' => WorkflowStatus::Approved,
        'action' => 'verify',
        'actor_id' => $user->id,
        'actor_name' => $user->name,
        'keterangan' => 'Pengajuan awal',
        'created_at' => $createdAt->addMinute(),
    ]);

    // Soft delete the archive
    $arsip->delete();

    $activities = $service->recentActivities();

    // Should not throw exception and should contain activity with label
    expect($activities->count())->toBeGreaterThan(0)
        ->and($activities->first()['judul'])->toContain('Arsip Yang Dihapus');
});

it('loads dashboard page with successful Inertia props for authenticated user', function () {
    $user = superAdmin();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('statistics')
            ->has('tahapStatistics')
            ->has('recentActivities')
        );
});
