<?php

declare(strict_types=1);

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

test('arsiparis can bulk verify archives', function (): void {
    $arsiparis = User::factory()->create();
    $arsiparis->assignRole('Arsiparis');

    $arsips = Arsip::factory()->count(3)->create([
        'workflow_status' => WorkflowStatus::Review,
    ]);

    $response = $this->actingAs($arsiparis)
        ->post(route('arsip.bulk-verify'), [
            'ids' => $arsips->pluck('id')->toArray(),
            'keterangan' => 'Disetujui',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($arsips as $arsip) {
        expect($arsip->fresh()->workflow_status)->toBe(WorkflowStatus::WaitingTte);
    }
});

test('arsiparis can bulk reject archives', function (): void {
    $arsiparis = User::factory()->create();
    $arsiparis->assignRole('Arsiparis');

    $arsips = Arsip::factory()->count(2)->create([
        'workflow_status' => WorkflowStatus::Review,
    ]);

    $response = $this->actingAs($arsiparis)
        ->post(route('arsip.bulk-reject'), [
            'ids' => $arsips->pluck('id')->toArray(),
            'catatan_revisi' => 'Perbaiki berkas lampiran',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($arsips as $arsip) {
        expect($arsip->fresh()->workflow_status)->toBe(WorkflowStatus::Revisi);
        expect($arsip->fresh()->catatan_revisi)->toBe('Perbaiki berkas lampiran');
    }
});

test('pimpinan can bulk sign archives with TTE', function (): void {
    $pimpinan = User::factory()->create();
    $pimpinan->assignRole('Pimpinan');

    $arsips = Arsip::factory()->count(3)->create([
        'workflow_status' => WorkflowStatus::WaitingTte,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($pimpinan)
        ->post(route('arsip.bulk-ajukan-tte'), [
            'ids' => $arsips->pluck('id')->toArray(),
            'passphrase' => 'password123',
            'catatan' => 'TTE disetujui',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($arsips as $arsip) {
        expect($arsip->fresh()->workflow_status)->toBe(WorkflowStatus::Active);
    }
});
