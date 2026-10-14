<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\NasibAkhir;
use App\Models\User;
use App\Services\WorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

it('determines allowed transitions correctly', function () {
    $service = new WorkflowService;

    // Review -> Approved / Revisi
    $arsipReview = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);
    expect($service->canTransition($arsipReview, WorkflowStatus::Approved))->toBeTrue()
        ->and($service->canTransition($arsipReview, WorkflowStatus::Revisi))->toBeTrue()
        ->and($service->canTransition($arsipReview, WorkflowStatus::Active))->toBeFalse();

    // Approved -> Active
    $arsipApproved = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Approved]);
    expect($service->canTransition($arsipApproved, WorkflowStatus::Active))->toBeTrue()
        ->and($service->canTransition($arsipApproved, WorkflowStatus::Review))->toBeFalse();

    // Active -> Inactive
    $arsipActive = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Active]);
    expect($service->canTransition($arsipActive, WorkflowStatus::Inactive))->toBeTrue()
        ->and($service->canTransition($arsipActive, WorkflowStatus::Approved))->toBeFalse();

    // Inactive -> Musnah
    $arsipInactive = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Inactive]);
    expect($service->canTransition($arsipInactive, WorkflowStatus::Musnah))->toBeTrue()
        ->and($service->canTransition($arsipInactive, WorkflowStatus::Active))->toBeFalse();

    // Musnah -> cannot transition further
    $arsipDestructed = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Musnah]);
    expect($service->allowedTransitions($arsipDestructed))->toBeEmpty();
});

it('successfully transitions workflow status and records history', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $request = Request::create('/arsip/1/workflow/advance', 'POST');

    $history = $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Approved,
        keterangan: 'Setujui dokumen',
        actor: $actor,
        request: $request,
    );

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Approved);

    // Verify history record
    expect($history->status_lama)->toBe(WorkflowStatus::Review)
        ->and($history->status_baru)->toBe(WorkflowStatus::Approved)
        ->and($history->user_id)->toBe($actor->id)
        ->and($history->keterangan)->toBe('Setujui dokumen');

    // Retrieve history collection
    $histories = $service->history($arsip);
    expect($histories->count())->toBe(1)
        ->and($histories->first()->id)->toBe($history->id);
});

it('throws exception when transitioning to an invalid status', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $request = Request::create('/arsip/1/workflow/advance', 'POST');

    // Trying to transition Review -> Active directly (must fail)
    $this->expectException(InvalidArgumentException::class);
    $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Active,
        keterangan: 'Invalid step',
        actor: $actor,
        request: $request,
    );
});

it('auto-expires to Inactive when only active retention has passed during TTE', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $request = Request::create('/tte', 'POST');

    $nasibAkhir = NasibAkhir::factory()->create(['nama' => 'Musnah']);
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'retensi_aktif' => 2,
        'retensi_inaktif' => 3,
        'nasib_akhir_id' => $nasibAkhir->id,
    ]);

    // tanggal_arsip 1 tahun lalu → masa aktif 2 tahun belum lewat
    $arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::WaitingTte,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subYear(),
    ]);

    $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Active,
        keterangan: 'TTE',
        actor: $actor,
        request: $request,
        action: 'tte',
    );

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Active);
});

it('auto-expires to Inactive when active retention has passed but inactive has not during TTE', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $request = Request::create('/tte', 'POST');

    $nasibAkhir = NasibAkhir::factory()->create(['nama' => 'Musnah']);
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'retensi_aktif' => 2,
        'retensi_inaktif' => 5,
        'nasib_akhir_id' => $nasibAkhir->id,
    ]);

    // tanggal_arsip 3 tahun lalu → masa aktif 2th sudah lewat, inaktif 5th belum lewat (total 7th)
    $arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::WaitingTte,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subYears(3),
    ]);

    $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Active,
        keterangan: 'TTE',
        actor: $actor,
        request: $request,
        action: 'tte',
    );

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Inactive);
});

it('auto-expires to Musnah when both retentions have passed and nasib akhir is Musnah during TTE', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $request = Request::create('/tte', 'POST');

    $nasibAkhir = NasibAkhir::factory()->create(['nama' => 'Musnah']);
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'retensi_aktif' => 2,
        'retensi_inaktif' => 1,
        'nasib_akhir_id' => $nasibAkhir->id,
    ]);

    // tanggal_arsip 4 tahun lalu → aktif 2th lewat, inaktif 1th lewat (total 3th < 4th)
    $arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::WaitingTte,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subYears(4),
    ]);

    $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Active,
        keterangan: 'TTE',
        actor: $actor,
        request: $request,
        action: 'tte',
    );

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Musnah);
});

it('auto-expires to Permanen when both retentions have passed and nasib akhir is Permanen during TTE', function () {
    $service = new WorkflowService;
    $actor = User::factory()->create();
    $request = Request::create('/tte', 'POST');

    $nasibAkhir = NasibAkhir::factory()->create(['nama' => 'Permanen']);
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'retensi_aktif' => 2,
        'retensi_inaktif' => 1,
        'nasib_akhir_id' => $nasibAkhir->id,
    ]);

    // tanggal_arsip 4 tahun lalu → kedua masa sudah lewat, nasib akhir Permanen
    $arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::WaitingTte,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subYears(4),
    ]);

    $service->transition(
        arsip: $arsip,
        target: WorkflowStatus::Active,
        keterangan: 'TTE',
        actor: $actor,
        request: $request,
        action: 'tte',
    );

    $arsip->refresh();
    expect($arsip->workflow_status)->toBe(WorkflowStatus::Permanen);
});
