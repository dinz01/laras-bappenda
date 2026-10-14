<?php

declare(strict_types=1);

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Setup roles and permissions
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    Storage::fake('local');
});

it('restricts recycle bin actions to Super Administrator role', function () {
    $regularUser = User::factory()->create();
    $regularUser->assignRole('Operator Unit');

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Administrator');

    $arsip = Arsip::factory()->create();
    $arsip->delete(); // Soft delete
    $deletedAt = CarbonImmutable::parse('2026-07-19 21:20:00', config('app.timezone'));
    $arsip->forceFill([
        'deleted_at' => $deletedAt,
        'updated_at' => $deletedAt,
    ])->save();

    // 1. Regular User cannot view recycle bin
    $this->actingAs($regularUser)
        ->get(route('admin.recycle-bin.index'))
        ->assertStatus(403);

    // 2. Regular User cannot restore
    $this->actingAs($regularUser)
        ->post(route('admin.recycle-bin.restore', $arsip->id))
        ->assertStatus(403);

    // 3. Regular User cannot force delete
    $this->actingAs($regularUser)
        ->delete(route('admin.recycle-bin.force-delete', $arsip->id))
        ->assertStatus(403);

    // 4. Super Admin can view
    $this->actingAs($superAdmin)
        ->get(route('admin.recycle-bin.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/recycle-bin/index')
            ->where('arsips.data.0.deleted_at', '19 Jul 2026 21:20 WIB')
        );
});

it('performs soft delete and records audit log', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('kelola-arsip.delete');
    $arsip = Arsip::factory()->create(['created_by' => $user->id]);

    $this->actingAs($user)
        ->delete(route('arsip.destroy', $arsip->id))
        ->assertRedirect(route('arsip.index'));

    // Verify soft deleted
    $this->assertSoftDeleted('arsip', ['id' => $arsip->id]);

    // Verify audit log exists
    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.deleted',
        'user_id' => $user->id,
    ]);
});

it('restores soft-deleted archive and records audit log', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Administrator');

    $arsip = Arsip::factory()->create();
    $arsip->delete(); // Soft delete

    $this->actingAs($superAdmin)
        ->post(route('admin.recycle-bin.restore', $arsip->id))
        ->assertRedirect();

    // Verify restored
    $this->assertNotSoftDeleted('arsip', ['id' => $arsip->id]);

    // Verify audit log
    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.restored',
        'user_id' => $superAdmin->id,
    ]);
});

it('force deletes archive, cleans files, and cascades relations', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Administrator');

    $arsip = Arsip::factory()->create();

    // Create physical files simulated
    $dokumenPath = 'archives/test-doc.pdf';
    $versionPath = 'archives/test-version.pdf';
    Storage::disk('local')->put($dokumenPath, 'content');
    Storage::disk('local')->put($versionPath, 'version content');

    $dokumen = DokumenArsip::create([
        'arsip_id' => $arsip->id,
        'nama_original' => 'test-doc.pdf',
        'nama_generated' => 'test-doc.pdf',
        'ukuran' => 123,
        'mime_type' => 'application/pdf',
        'path_penyimpanan' => $dokumenPath,
    ]);

    $version = DokumenArsipVersion::create([
        'dokumen_arsip_id' => $dokumen->id,
        'versi' => 1,
        'nama_file' => 'test-version.pdf',
        'path_file' => $versionPath,
        'ukuran_file' => 123,
        'mime_type' => 'application/pdf',
        'hash_file' => 'abc',
    ]);

    $arsip->delete(); // Soft delete first

    // Ensure files exist
    Storage::disk('local')->assertExists($dokumenPath);
    Storage::disk('local')->assertExists($versionPath);

    // Perform manual force delete
    $this->actingAs($superAdmin)
        ->delete(route('admin.recycle-bin.force-delete', $arsip->id))
        ->assertRedirect();

    // Verify database record completely gone
    $this->assertDatabaseMissing('arsip', ['id' => $arsip->id]);
    $this->assertDatabaseMissing('dokumen_arsip', ['id' => $dokumen->id]);
    $this->assertDatabaseMissing('dokumen_arsip_versions', ['id' => $version->id]);

    // Verify physical files deleted
    Storage::disk('local')->assertMissing($dokumenPath);
    Storage::disk('local')->assertMissing($versionPath);

    // Verify audit log
    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.force_deleted',
        'user_id' => $superAdmin->id,
    ]);
});

it('automatically force deletes archives older than 24 hours via scheduler command', function () {
    $arsipFresh = Arsip::factory()->create();
    $arsipFresh->delete(); // Freshly deleted

    $arsipExpired = Arsip::factory()->create();
    $arsipExpired->delete();

    // Simulate being deleted 25 hours ago
    $arsipExpired->deleted_at = now()->subHours(25);
    $arsipExpired->save();

    // Run scheduler command
    $exitCode = Artisan::call('arsip:delete-expired');
    expect($exitCode)->toBe(0);

    // Fresh archive should still be in recycle bin
    $this->assertSoftDeleted('arsip', ['id' => $arsipFresh->id]);

    // Expired archive should be permanently deleted
    $this->assertDatabaseMissing('arsip', ['id' => $arsipExpired->id]);

    // Verify scheduler audit log
    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsipExpired->id,
        'event' => 'arsip.force_deleted',
    ]);
});
