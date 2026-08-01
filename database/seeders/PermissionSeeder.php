<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // Dashboard & Profile
            'dashboard.view',
            'profile.view',
            'profile.update',

            // Arsip
            'arsip.view',
            'arsip.create',
            'arsip.update',
            'arsip.delete',
            'arsip.restore',

            // Dokumen
            'dokumen.view',
            'dokumen.upload',
            'dokumen.download',
            'dokumen.delete',

            // Workflow
            'workflow.view',
            'workflow.verify',
            'workflow.approve',
            'workflow.reject',
            'workflow.tte',

            // Master Data
            'master.view',
            'master.create',
            'master.update',
            'master.delete',

            // User
            'user.view',
            'user.create',
            'user.update',
            'user.delete',

            // Role
            'role.view',
            'role.create',
            'role.update',
            'role.delete',

            // Permission
            'permission.view',
            'permission.create',
            'permission.update',
            'permission.delete',

            // Audit Log
            'auditlog.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Assign permissions to roles
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Administrator', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::all());

        $arsiparisRole = Role::firstOrCreate(['name' => 'Arsiparis', 'guard_name' => 'web']);
        $arsiparisRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'arsip.view',
            'arsip.create',
            'arsip.update',
            'dokumen.view',
            'dokumen.upload',
            'dokumen.download',
            'workflow.view',
            'workflow.approve',
            'workflow.reject',
            'master.view',
        ]);

        $pimpinanRole = Role::firstOrCreate(['name' => 'Pimpinan', 'guard_name' => 'web']);
        $pimpinanRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'arsip.view',
            'dokumen.view',
            'dokumen.download',
            'workflow.view',
            'workflow.verify',
            'workflow.approve',
            'workflow.reject',
            'workflow.tte',
            'auditlog.view',
        ]);

        $pegawaiRole = Role::firstOrCreate(['name' => 'Pegawai', 'guard_name' => 'web']);
        $pegawaiRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'arsip.view',
            'dokumen.view',
            'dokumen.download',
        ]);

        $operatorUnitRole = Role::firstOrCreate(['name' => 'Operator Unit Pengolah', 'guard_name' => 'web']);
        $operatorUnitRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'arsip.view',
            'arsip.create',
            'arsip.update',
            'dokumen.view',
            'dokumen.upload',
            'dokumen.download',
            'master.view',
        ]);
    }
}
