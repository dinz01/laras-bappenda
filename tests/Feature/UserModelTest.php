<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\AuditLog;
use App\Models\DokumenArsip;
use App\Models\Jabatan;
use App\Models\KlasifikasiArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('user has spatie role and permission functionality', function () {
    $role = Role::firstOrCreate(['name' => 'Super Admin']);
    $permission = Permission::firstOrCreate(['name' => 'arsip.view']);

    $user = User::factory()->create();

    $user->assignRole($role);
    $user->givePermissionTo($permission);

    expect($user->hasRole('Super Admin'))->toBeTrue()
        ->and($user->hasPermissionTo('arsip.view'))->toBeTrue();
});

test('user helper methods check roles and permissions correctly', function () {
    $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
    $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $pimpinanRole = Role::firstOrCreate(['name' => 'Pimpinan']);
    $permission = Permission::firstOrCreate(['name' => 'arsip.create']);
    Permission::firstOrCreate(['name' => 'arsip.delete']);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole($superAdminRole);

    $admin = User::factory()->create();
    $admin->assignRole($adminRole);

    $pimpinan = User::factory()->create();
    $pimpinan->assignRole($pimpinanRole);

    $staff = User::factory()->create();
    $staff->givePermissionTo($permission);

    expect($superAdmin->isSuperAdmin())->toBeTrue()
        ->and($superAdmin->isAdministrator())->toBeFalse()
        ->and($admin->isAdministrator())->toBeTrue()
        ->and($pimpinan->isPimpinan())->toBeTrue()
        ->and($staff->hasPermission('arsip.create'))->toBeTrue()
        ->and($staff->hasPermission('arsip.delete'))->toBeFalse();
});

test('user active scope filters active users correctly', function () {
    User::factory()->create(['status' => 'active']);
    User::factory()->create(['status' => 'aktif']);
    User::factory()->create(['status' => 'inactive']);

    $activeUsers = User::active()->get();

    expect($activeUsers)->toHaveCount(2);
});

test('user byUnit scope filters users by unit_organisasi_id', function () {
    $unitA = UnitOrganisasi::factory()->create();
    $unitB = UnitOrganisasi::factory()->create();

    User::factory()->create(['unit_organisasi_id' => $unitA->id]);
    User::factory()->create(['unit_organisasi_id' => $unitA->id]);
    User::factory()->create(['unit_organisasi_id' => $unitB->id]);

    $usersUnitA = User::byUnit($unitA->id)->get();

    expect($usersUnitA)->toHaveCount(2);
});

test('user byRole scope filters users by role name', function () {
    $roleArsiparis = Role::firstOrCreate(['name' => 'Arsiparis']);
    $roleStaff = Role::firstOrCreate(['name' => 'Staff']);

    $user1 = User::factory()->create();
    $user1->assignRole($roleArsiparis);

    $user2 = User::factory()->create();
    $user2->assignRole($roleStaff);

    $arsiparisList = User::byRole('Arsiparis')->get();

    expect($arsiparisList)->toHaveCount(1)
        ->and($arsiparisList->first()->id)->toBe($user1->id);
});

test('user relationships to unit_organisasi and jabatan work correctly', function () {
    $unit = UnitOrganisasi::factory()->create();
    $jabatan = Jabatan::factory()->create();

    $user = User::factory()->create([
        'unit_organisasi_id' => $unit->id,
        'jabatan_id' => $jabatan->id,
    ]);

    expect($user->unitOrganisasi->id)->toBe($unit->id)
        ->and($user->jabatan->id)->toBe($jabatan->id)
        ->and($unit->users)->toHaveCount(1)
        ->and($unit->users->first()->id)->toBe($user->id)
        ->and($jabatan->users)->toHaveCount(1)
        ->and($jabatan->users->first()->id)->toBe($user->id);
});

test('user relationships to operational models work correctly', function () {
    $user = User::factory()->create();
    $klasifikasi = KlasifikasiArsip::factory()->create();

    $arsip = Arsip::factory()->create([
        'created_by' => $user->id,
        'klasifikasi_arsip_id' => $klasifikasi->id,
    ]);

    $dokumen = DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'uploaded_by' => $user->id,
    ]);

    $workflowHistory = ArsipWorkflowHistory::create([
        'arsip_id' => $arsip->id,
        'status_lama' => WorkflowStatus::Draft,
        'status_baru' => WorkflowStatus::Review,
        'action' => 'submit',
        'user_id' => $user->id,
        'keterangan' => 'Pengajuan review',
    ]);

    $auditLog = AuditLog::create([
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'created',
        'user_id' => $user->id,
    ]);

    expect($user->arsips)->toHaveCount(1)
        ->and($user->arsips->first()->id)->toBe($arsip->id)
        ->and($user->dokumenArsips)->toHaveCount(1)
        ->and($user->dokumenArsips->first()->id)->toBe($dokumen->id)
        ->and($user->workflowHistories)->toHaveCount(1)
        ->and($user->workflowHistories->first()->id)->toBe($workflowHistory->id)
        ->and($user->auditLogs)->toHaveCount(1)
        ->and($user->auditLogs->first()->id)->toBe($auditLog->id);
});
