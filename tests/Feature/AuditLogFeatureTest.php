<?php

declare(strict_types=1);

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\AuditLog;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\KlasifikasiArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Role::findOrCreate('Super Administrator');

    $this->user = User::factory()->create();
    $this->user->assignRole('Super Administrator');
});

it('logs arsip.created when storing archive', function () {
    $klasifikasi = KlasifikasiArsip::factory()->create();

    $data = [
        'nomor_arsip' => 'ARS/2026/001',
        'judul' => 'Arsip Keuangan 2026',
        'deskripsi' => 'Arsip Keuangan Pertama',
        'tanggal_arsip' => '2026-07-19',
        'klasifikasi_arsip_id' => $klasifikasi->id,
    ];

    $this->actingAs($this->user)
        ->post(route('arsip.store'), $data)
        ->assertRedirect(route('arsip.index'));

    $arsip = Arsip::where('nomor_arsip', 'ARS/2026/001')->first();
    expect($arsip)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.created',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::where('event', 'arsip.created')->first();
    expect($log->old_values)->toBeNull()
        ->and($log->new_values['judul'])->toBe('Arsip Keuangan 2026')
        ->and($log->new_values['nomor_arsip'])->toBe('ARS/2026/001');
});

it('logs arsip.updated when modifying archive metadata', function () {
    $arsip = Arsip::factory()->create([
        'judul' => 'Judul Lama',
        'nomor_arsip' => 'ARS/OLD/123',
    ]);

    $data = [
        'judul' => 'Judul Baru',
        'nomor_arsip' => 'ARS/NEW/456',
        'tanggal_arsip' => $arsip->tanggal_arsip->toDateString(),
        'klasifikasi_arsip_id' => $arsip->klasifikasi_arsip_id,
    ];

    $this->actingAs($this->user)
        ->put(route('arsip.update', $arsip->id), $data)
        ->assertRedirect(route('arsip.show', $arsip->id));

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.updated',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::where('event', 'arsip.updated')->first();
    expect($log->old_values['judul'])->toBe('Judul Lama')
        ->and($log->new_values['judul'])->toBe('Judul Baru')
        ->and($log->old_values['nomor_arsip'])->toBe('ARS/OLD/123')
        ->and($log->new_values['nomor_arsip'])->toBe('ARS/NEW/456');
});

it('logs arsip.deleted on soft deletion', function () {
    $arsip = Arsip::factory()->create(['judul' => 'Arsip Dihapus']);

    $this->actingAs($this->user)
        ->delete(route('arsip.destroy', $arsip->id))
        ->assertRedirect(route('arsip.index'));

    $this->assertSoftDeleted('arsip', ['id' => $arsip->id]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.deleted',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::where('event', 'arsip.deleted')->first();
    expect($log->old_values['judul'])->toBe('Arsip Dihapus')
        ->and($log->new_values)->toBeNull();
});

it('logs arsip.restored on restoration', function () {
    $arsip = Arsip::factory()->create();
    $arsip->delete();

    $this->actingAs($this->user)
        ->post(route('admin.recycle-bin.restore', $arsip->id))
        ->assertRedirect();

    $this->assertNotSoftDeleted('arsip', ['id' => $arsip->id]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.restored',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::where('event', 'arsip.restored')->first();
    expect($log->old_values)->toHaveKey('deleted_at')
        ->and($log->new_values['deleted_at'])->toBeNull();
});

it('logs arsip.force_deleted on force deletion', function () {
    $arsip = Arsip::factory()->create();
    $arsip->delete();

    $this->actingAs($this->user)
        ->delete(route('admin.recycle-bin.force-delete', $arsip->id))
        ->assertRedirect();

    $this->assertDatabaseMissing('arsip', ['id' => $arsip->id]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.force_deleted',
        'user_id' => $this->user->id,
    ]);

    $log = AuditLog::where('event', 'arsip.force_deleted')->first();
    expect($log->old_values['nomor_arsip'])->toBe($arsip->nomor_arsip)
        ->and($log->new_values)->toBeNull();
});

it('logs dokumen.uploaded and dokumen.version_created on uploadFile', function () {
    $arsip = Arsip::factory()->create();
    $file = UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf');

    $this->actingAs($this->user)
        ->post(route('arsip.upload-file', $arsip->id), ['file' => $file])
        ->assertRedirect(route('arsip.show', $arsip->id));

    $dokumen = DokumenArsip::where('arsip_id', $arsip->id)->first();
    expect($dokumen)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => DokumenArsip::class,
        'auditable_id' => $dokumen->id,
        'event' => 'dokumen.uploaded',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => DokumenArsipVersion::class,
        'event' => 'dokumen.version_created',
    ]);

    $versionLog = AuditLog::where('event', 'dokumen.version_created')->first();
    expect($versionLog->new_values['versi'])->toBe(1)
        ->and($versionLog->new_values['nama_file'])->toBe('contract.pdf');
});

it('logs dokumen.replaced and dokumen.version_created on replaceFile', function () {
    $arsip = Arsip::factory()->create();
    $file1 = UploadedFile::fake()->create('contract_v1.pdf', 100, 'application/pdf');

    // First upload
    $this->actingAs($this->user)->post(route('arsip.upload-file', $arsip->id), ['file' => $file1]);
    $dokumen = DokumenArsip::where('arsip_id', $arsip->id)->first();

    // Now replace
    $file2 = UploadedFile::fake()->create('contract_v2.pdf', 200, 'application/pdf');
    $this->actingAs($this->user)
        ->post(route('arsip.replace-file', $arsip->id), ['file' => $file2])
        ->assertRedirect(route('arsip.show', $arsip->id));

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => DokumenArsip::class,
        'auditable_id' => $dokumen->id,
        'event' => 'dokumen.replaced',
    ]);

    $versionLog = AuditLog::where('event', 'dokumen.version_created')
        ->where('new_values->versi', 2)
        ->first();
    expect($versionLog)->not->toBeNull()
        ->and($versionLog->new_values['nama_file'])->toBe('contract_v2.pdf');
});

it('logs workflow.changed when advancing status', function () {
    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Draft]);

    $this->actingAs($this->user)
        ->post(route('arsip.workflow.advance', $arsip->id), [
            'target_status' => WorkflowStatus::Review->value,
            'keterangan' => 'Ready for review',
        ])
        ->assertRedirect(route('arsip.show', $arsip->id));

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'workflow.changed',
    ]);

    $log = AuditLog::where('event', 'workflow.changed')->first();
    expect($log->old_values['workflow_status'])->toBe('draft')
        ->and($log->new_values['workflow_status'])->toBe('review');
});
