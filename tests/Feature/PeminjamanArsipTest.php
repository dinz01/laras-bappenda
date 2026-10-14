<?php

use App\Enums\PeminjamanStatus;
use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\PeminjamanArsip;
use App\Models\User;

beforeEach(function (): void {
    $this->operator = User::factory()->create();
    $this->operator->assignRole('Operator Unit');

    $this->arsiparis = User::factory()->create();
    $this->arsiparis->assignRole('Arsiparis');

    $this->arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::Inactive,
    ]);
});

it('operator can view peminjaman index', function (): void {
    $this->actingAs($this->operator)
        ->get('/peminjaman')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('pengelolaan/peminjaman/index'));
});

it('operator can submit peminjaman for inactive arsip', function (): void {
    $this->actingAs($this->operator)
        ->post("/peminjaman/{$this->arsip->id}/ajukan", [
            'alasan' => 'Keperluan audit internal unit',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('peminjaman_arsip', [
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'status' => PeminjamanStatus::Pending->value,
        'alasan' => 'Keperluan audit internal unit',
    ]);
});

it('operator cannot submit duplicate pending peminjaman', function (): void {
    PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Alasan pertama',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->operator)
        ->post("/peminjaman/{$this->arsip->id}/ajukan", [
            'alasan' => 'Alasan kedua',
        ])
        ->assertSessionHasErrors('arsip');

    $this->assertDatabaseCount('peminjaman_arsip', 1);
});

it('operator cannot submit peminjaman for non-inactive arsip', function (): void {
    $arsipAktif = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::Active,
    ]);

    $this->actingAs($this->operator)
        ->post("/peminjaman/{$arsipAktif->id}/ajukan", [
            'alasan' => 'Alasan peminjaman',
        ])
        ->assertSessionHasErrors('arsip');
});

it('arsiparis can approve pending peminjaman', function (): void {
    $peminjaman = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Keperluan audit',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->arsiparis)
        ->post("/peminjaman/{$peminjaman->id}/approve", [
            'catatan_peninjau' => 'Disetujui untuk audit Q3',
        ])
        ->assertRedirect();

    expect($peminjaman->fresh())
        ->status->toBe(PeminjamanStatus::Approved)
        ->reviewed_by->toBe($this->arsiparis->id)
        ->catatan_peninjau->toBe('Disetujui untuk audit Q3');
});

it('arsiparis can reject pending peminjaman with catatan', function (): void {
    $peminjaman = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Keperluan audit',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->arsiparis)
        ->post("/peminjaman/{$peminjaman->id}/reject", [
            'catatan_peninjau' => 'Arsip sedang dalam pengkajian ulang.',
        ])
        ->assertRedirect();

    expect($peminjaman->fresh())
        ->status->toBe(PeminjamanStatus::Rejected)
        ->reviewed_by->toBe($this->arsiparis->id);
});

it('arsiparis cannot reject without catatan', function (): void {
    $peminjaman = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Keperluan audit',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->arsiparis)
        ->post("/peminjaman/{$peminjaman->id}/reject", [
            'catatan_peninjau' => '',
        ])
        ->assertSessionHasErrors('catatan_peninjau');
});

it('operator cannot approve or reject peminjaman', function (): void {
    $peminjaman = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Keperluan audit',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->operator)
        ->post("/peminjaman/{$peminjaman->id}/approve")
        ->assertForbidden();

    $this->actingAs($this->operator)
        ->post("/peminjaman/{$peminjaman->id}/reject", [
            'catatan_peninjau' => 'test',
        ])
        ->assertForbidden();
});

it('cannot process already processed peminjaman', function (): void {
    $peminjaman = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Keperluan audit',
        'status' => PeminjamanStatus::Approved,
        'reviewed_by' => $this->arsiparis->id,
        'reviewed_at' => now(),
    ]);

    $this->actingAs($this->arsiparis)
        ->post("/peminjaman/{$peminjaman->id}/approve")
        ->assertSessionHasErrors('peminjaman');
});

it('arsiparis can bulk approve pending peminjamans', function (): void {
    $p1 = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Audit 1',
        'status' => PeminjamanStatus::Pending,
    ]);
    $p2 = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Audit 2',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->arsiparis)
        ->post(route('peminjaman.bulk-approve'), [
            'ids' => [$p1->id, $p2->id],
            'catatan_peninjau' => 'Disetujui serentak',
        ])
        ->assertRedirect();

    expect($p1->fresh()->status)->toBe(PeminjamanStatus::Approved);
    expect($p2->fresh()->status)->toBe(PeminjamanStatus::Approved);
});

it('arsiparis can bulk reject pending peminjamans', function (): void {
    $p1 = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Audit 1',
        'status' => PeminjamanStatus::Pending,
    ]);
    $p2 = PeminjamanArsip::create([
        'arsip_id' => $this->arsip->id,
        'pemohon_id' => $this->operator->id,
        'alasan' => 'Audit 2',
        'status' => PeminjamanStatus::Pending,
    ]);

    $this->actingAs($this->arsiparis)
        ->post(route('peminjaman.bulk-reject'), [
            'ids' => [$p1->id, $p2->id],
            'catatan_peninjau' => 'Ditolak serentak karena berkas rusak',
        ])
        ->assertRedirect();

    expect($p1->fresh()->status)->toBe(PeminjamanStatus::Rejected);
    expect($p2->fresh()->status)->toBe(PeminjamanStatus::Rejected);
});
