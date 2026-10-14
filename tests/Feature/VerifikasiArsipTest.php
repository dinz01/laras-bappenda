<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    $this->user = User::factory()->create();
    $this->user->givePermissionTo([
        'verifikasi-arsip.view',
        'verifikasi-arsip.verify',
        'verifikasi-arsip.reject',
    ]);
});

it('renders verifikasi arsip page with pending review archives', function () {
    Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $response = $this->actingAs($this->user)
        ->get(route('verifikasi-arsip.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('verifikasi-arsip/index'));
});

it('allows approving an archive in review status to waiting tte', function () {
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $response = $this->actingAs($this->user)
        ->post(route('arsip.verify', $arsip));

    $response->assertRedirect();
    $this->assertDatabaseHas('arsip', [
        'id' => $arsip->id,
        'workflow_status' => WorkflowStatus::WaitingTte->value,
    ]);
});

it('allows rejecting an archive in review status to revisi', function () {
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $response = $this->actingAs($this->user)
        ->post(route('arsip.reject', $arsip), [
            'catatan_revisi' => 'Mohon perbaiki nomor surat.',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('arsip', [
        'id' => $arsip->id,
        'workflow_status' => WorkflowStatus::Revisi->value,
        'catatan_revisi' => 'Mohon perbaiki nomor surat.',
    ]);
});

it('resubmits an archive from revisi to review status upon update', function () {
    $this->user->givePermissionTo('kelola-arsip.update');

    $arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::Revisi,
        'catatan_revisi' => 'Perbaiki judul',
    ]);

    $response = $this->actingAs($this->user)
        ->put(route('arsip.update', $arsip), [
            'judul' => 'Judul Baru Setelah Direvisi',
            'tanggal_arsip' => $arsip->tanggal_arsip->format('Y-m-d'),
            'klasifikasi_arsip_id' => $arsip->klasifikasi_arsip_id,
            'lokasi_arsip_id' => $arsip->lokasi_arsip_id,
            'jenis_arsip_id' => $arsip->jenis_arsip_id,
            'sifat_arsip_id' => $arsip->sifat_arsip_id,
            'tingkat_perkembangan_arsip_id' => $arsip->tingkat_perkembangan_arsip_id,
            'kondisi_arsip_id' => $arsip->kondisi_arsip_id,
            'tingkat_akses_arsip_id' => $arsip->tingkat_akses_arsip_id,
            'unit_organisasi_id' => $arsip->unit_organisasi_id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('arsip', [
        'id' => $arsip->id,
        'judul' => 'Judul Baru Setelah Direvisi',
        'workflow_status' => WorkflowStatus::Review->value,
        'catatan_revisi' => null,
    ]);
});
