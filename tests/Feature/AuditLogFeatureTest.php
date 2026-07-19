<?php

declare(strict_types=1);

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\AuditLog;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\KlasifikasiArsip;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Role::findOrCreate('Super Administrator');

    $this->user = User::factory()->create(['name' => 'Admin Audit']);
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

it('renders audit log index with paginated logs and statistics', function () {
    $arsip = Arsip::factory()->create([
        'nomor_arsip' => 'AUD-2026-001',
        'judul' => 'Audit Laporan Keuangan',
    ]);
    $createdAt = CarbonImmutable::parse('2026-07-19 21:20:00', config('app.timezone'));

    $auditLog = AuditLog::create([
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.created',
        'old_values' => null,
        'new_values' => ['nomor_arsip' => $arsip->nomor_arsip],
        'user_id' => $this->user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest Browser',
    ]);
    $auditLog->forceFill([
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ])->save();

    $this->actingAs($this->user)
        ->get(route('admin.audit-log.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-log/index')
            ->has('auditLogs.data', 1)
            ->where('auditLogs.data.0.event', 'arsip.created')
            ->where('auditLogs.data.0.archive.nomor_arsip', 'AUD-2026-001')
            ->where('auditLogs.data.0.ip_address', '127.0.0.1')
            ->where('auditLogs.data.0.user_agent', 'Pest Browser')
            ->where('auditLogs.data.0.created_at', '2026-07-19T21:20:00+07:00')
            ->where('auditLogs.data.0.created_at_human', '19 Jul 2026 21:20 WIB')
            ->where('statistics.total', 1)
        );
});

it('searches audit logs by user archive and event', function (string $search) {
    $matchingUser = User::factory()->create(['name' => 'Rani Auditor']);
    $matchingArsip = Arsip::factory()->create([
        'nomor_arsip' => 'SEARCH-AUD-001',
        'judul' => 'Dokumen Audit Khusus',
    ]);
    $otherArsip = Arsip::factory()->create([
        'nomor_arsip' => 'OTHER-001',
        'judul' => 'Dokumen Lain',
    ]);

    AuditLog::create([
        'auditable_type' => Arsip::class,
        'auditable_id' => $matchingArsip->id,
        'event' => 'arsip.updated',
        'old_values' => ['judul' => 'Lama'],
        'new_values' => ['judul' => 'Baru'],
        'user_id' => $matchingUser->id,
    ]);

    AuditLog::create([
        'auditable_type' => Arsip::class,
        'auditable_id' => $otherArsip->id,
        'event' => 'arsip.deleted',
        'old_values' => ['judul' => 'Dokumen Lain'],
        'new_values' => null,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('admin.audit-log.index', ['search' => $search]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-log/index')
            ->has('auditLogs.data', 1)
            ->where('auditLogs.data.0.event', 'arsip.updated')
            ->where('filters.search', $search)
        );
})->with([
    'user name' => 'Rani',
    'archive number' => 'SEARCH-AUD',
    'archive title' => 'Khusus',
    'event' => 'arsip.updated',
]);

it('filters audit logs by category user type and date range', function () {
    $today = CarbonImmutable::parse('2026-07-19 10:00:00');
    $yesterday = $today->subDay();
    $arsip = Arsip::factory()->create();

    AuditLog::create([
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'dokumen.uploaded',
        'old_values' => null,
        'new_values' => ['nama_file' => 'today.pdf'],
        'user_id' => $this->user->id,
        'created_at' => $today,
        'updated_at' => $today,
    ]);

    AuditLog::create([
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.created',
        'old_values' => null,
        'new_values' => ['judul' => 'System'],
        'user_id' => null,
        'created_at' => $yesterday,
        'updated_at' => $yesterday,
    ]);

    $this->actingAs($this->user)
        ->get(route('admin.audit-log.index', [
            'event_category' => 'dokumen',
            'user_type' => 'user',
            'date_from' => '2026-07-19',
            'date_until' => '2026-07-19',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-log/index')
            ->has('auditLogs.data', 1)
            ->where('auditLogs.data.0.event', 'dokumen.uploaded')
            ->where('filters.event_category', 'dokumen')
            ->where('filters.user_type', 'user')
            ->where('filters.date_from', '2026-07-19')
            ->where('filters.date_until', '2026-07-19')
        );
});
