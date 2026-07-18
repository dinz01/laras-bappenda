<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\StatusArsip;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Populate required status arsip
    StatusArsip::factory()->create(['kode' => 'SA-00001', 'nama' => 'Aktif']);
    StatusArsip::factory()->create(['kode' => 'SA-00002', 'nama' => 'Inaktif']);
    StatusArsip::factory()->create(['kode' => 'SA-00003', 'nama' => 'Permanen']);
});

it('calculates dashboard main statistics correctly', function () {
    $service = new DashboardService;

    $statusAktif = StatusArsip::where('kode', 'SA-00001')->first();
    $statusInaktif = StatusArsip::where('kode', 'SA-00002')->first();

    Arsip::factory()->count(3)->create(['status_arsip_id' => $statusAktif->id]);
    Arsip::factory()->count(2)->create(['status_arsip_id' => $statusInaktif->id]);

    $stats = $service->mainStatistics();

    expect($stats['total'])->toBe(5)
        ->and($stats['aktif'])->toBe(3)
        ->and($stats['inaktif'])->toBe(2)
        ->and($stats['permanen'])->toBe(0);
});

it('groups dashboard statistics by workflow status stage correctly', function () {
    $service = new DashboardService;

    Arsip::factory()->count(2)->create(['workflow_status' => WorkflowStatus::Draft]);
    Arsip::factory()->count(1)->create(['workflow_status' => WorkflowStatus::Approved]);

    $stats = $service->tahapStatistics();

    expect($stats['draft'])->toBe(2)
        ->and($stats['approved'])->toBe(1)
        ->and($stats['review'])->toBe(0);
});

it('retrieves recent dashboard activities sorted by date', function () {
    $service = new DashboardService;

    $user = User::factory()->create(['name' => 'John Doe']);

    // Create an archive (which will be in recent activities as Created)
    $arsip = Arsip::factory()->create([
        'judul' => 'Arsip Penting',
        'created_by' => $user->id,
    ]);

    $activities = $service->recentActivities();

    expect($activities->count())->toBeGreaterThanOrEqual(1);

    $activity = $activities->first();
    expect($activity['judul'])->toBe('Arsip Penting')
        ->and($activity['user'])->toBe('John Doe')
        ->and($activity['aktivitas'])->toBe('Arsip dibuat');
});

it('handles soft-deleted archives in recent activities without crashing', function () {
    $service = new DashboardService;
    $user = User::factory()->create(['name' => 'John Doe']);

    $arsip = Arsip::factory()->create([
        'judul' => 'Arsip Dihapus',
        'created_by' => $user->id,
    ]);

    // Create workflow history
    ArsipWorkflowHistory::create([
        'arsip_id' => $arsip->id,
        'status_lama' => WorkflowStatus::Draft->value,
        'status_baru' => WorkflowStatus::Review->value,
        'user_id' => $user->id,
    ]);

    // Soft delete the archive
    $arsip->delete();

    $activities = $service->recentActivities();

    // Verify it doesn't throw Exception and successfully maps the activity
    expect($activities->count())->toBeGreaterThanOrEqual(1);

    $transitionActivity = $activities->firstWhere('arsip_id', $arsip->id);
    expect($transitionActivity)->not->toBeNull()
        ->and($transitionActivity['judul'])->toBe('Arsip Dihapus')
        ->and($transitionActivity['aktivitas'])->toContain('Tahap berubah ke Review');
});

it('loads dashboard page with successful Inertia props for authenticated user', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('statistics')
        ->has('tahapStatistics')
        ->has('arsipPerTahun')
        ->has('topUnit')
        ->has('topKlasifikasi')
        ->has('recentActivities')
        ->has('mendekatiRetensi')
    );
});
