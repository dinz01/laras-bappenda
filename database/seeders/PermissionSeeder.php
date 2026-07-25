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

        // Assign default permissions to roles
        $adminRole = Role::whereIn('name', ['Administrator', 'Admin Arsip'])->first();
        if ($adminRole) {
            $adminRole->givePermissionTo(Permission::all());
        }

        $petugasRole = Role::whereIn('name', ['Arsiparis', 'Petugas Arsip'])->first();
        if ($petugasRole) {
            $petugasRole->givePermissionTo([
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
                'master.view',
            ]);
        }

        $pimpinanRole = Role::whereIn('name', ['Pimpinan', 'Kepala Bidang', 'Kepala Sub Bidang'])->first();
        if ($pimpinanRole) {
            $pimpinanRole->givePermissionTo([
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
                'auditlog.view',
            ]);
        }
    }
}
