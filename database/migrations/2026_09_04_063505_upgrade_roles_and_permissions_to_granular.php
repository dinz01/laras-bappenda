<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // 1. Rename role 'Operator Unit Pengolah' to 'Operator Unit' if exists
        $oldOperatorRole = Role::where('name', 'Operator Unit Pengolah')->first();
        if ($oldOperatorRole) {
            $oldOperatorRole->update(['name' => 'Operator Unit']);
        } else {
            Role::firstOrCreate(['name' => 'Operator Unit', 'guard_name' => 'web']);
        }

        // Ensure default roles exist
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Administrator', 'guard_name' => 'web']);
        $arsiparisRole = Role::firstOrCreate(['name' => 'Arsiparis', 'guard_name' => 'web']);
        $pimpinanRole = Role::firstOrCreate(['name' => 'Pimpinan', 'guard_name' => 'web']);
        $operatorUnitRole = Role::firstOrCreate(['name' => 'Operator Unit', 'guard_name' => 'web']);

        // 2. Daftar permission baru granular [module].[action]
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Repositori Arsip
            'repositori-arsip.view',
            'repositori-arsip.download',
            'repositori-arsip.delete',

            // Arsip Inaktif
            'arsip-inaktif.view',

            // Nasib Akhir Arsip
            'nasib-akhir-arsip.view',
            'nasib-akhir-arsip.delete',

            // Kelola Arsip
            'kelola-arsip.view',
            'kelola-arsip.create',
            'kelola-arsip.update',
            'kelola-arsip.delete',
            'kelola-arsip.upload-file',

            // Verifikasi Arsip
            'verifikasi-arsip.view',
            'verifikasi-arsip.verify',
            'verifikasi-arsip.reject',

            // Kelola TTE
            'kelola-tte.view',
            'kelola-tte.sign',

            // Peminjaman Arsip
            'peminjaman.view',
            'peminjaman.create',
            'peminjaman.approve',
            'peminjaman.reject',
            'peminjaman.return',

            // Master Data (11 sub-modul)
            'master-unit-organisasi.view',
            'master-unit-organisasi.create',
            'master-unit-organisasi.update',
            'master-unit-organisasi.delete',

            'master-jabatan.view',
            'master-jabatan.create',
            'master-jabatan.update',
            'master-jabatan.delete',

            'master-klasifikasi-arsip.view',
            'master-klasifikasi-arsip.create',
            'master-klasifikasi-arsip.update',
            'master-klasifikasi-arsip.delete',

            'master-lokasi-arsip.view',
            'master-lokasi-arsip.create',
            'master-lokasi-arsip.update',
            'master-lokasi-arsip.delete',

            'master-jenis-arsip.view',
            'master-jenis-arsip.create',
            'master-jenis-arsip.update',
            'master-jenis-arsip.delete',

            'master-kategori-arsip.view',
            'master-kategori-arsip.create',
            'master-kategori-arsip.update',
            'master-kategori-arsip.delete',

            'master-sifat-arsip.view',
            'master-sifat-arsip.create',
            'master-sifat-arsip.update',
            'master-sifat-arsip.delete',

            'master-tingkat-akses-arsip.view',
            'master-tingkat-akses-arsip.create',
            'master-tingkat-akses-arsip.update',
            'master-tingkat-akses-arsip.delete',

            'master-tingkat-perkembangan-arsip.view',
            'master-tingkat-perkembangan-arsip.create',
            'master-tingkat-perkembangan-arsip.update',
            'master-tingkat-perkembangan-arsip.delete',

            'master-kondisi-arsip.view',
            'master-kondisi-arsip.create',
            'master-kondisi-arsip.update',
            'master-kondisi-arsip.delete',

            'master-nasib-akhir.view',
            'master-nasib-akhir.create',
            'master-nasib-akhir.update',
            'master-nasib-akhir.delete',

            // Administrasi
            'admin-pengguna.view',
            'admin-pengguna.create',
            'admin-pengguna.update',
            'admin-pengguna.delete',

            'admin-role.view',
            'admin-role.create',
            'admin-role.update',
            'admin-role.delete',

            'admin-permission.view',
            'admin-audit-log.view',

            'admin-recycle-bin.view',
            'admin-recycle-bin.restore',
            'admin-recycle-bin.force-delete',

            // Profil Pengguna
            'profile.view',
            'profile.update',
        ];

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'web']);
        }

        // 3. Assign granular permissions ke default roles
        $superAdminRole->syncPermissions(Permission::all());

        $arsiparisRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'repositori-arsip.view',
            'repositori-arsip.download',
            'repositori-arsip.delete',
            'arsip-inaktif.view',
            'nasib-akhir-arsip.view',
            'nasib-akhir-arsip.delete',
            'kelola-arsip.view',
            'kelola-arsip.create',
            'kelola-arsip.update',
            'kelola-arsip.delete',
            'kelola-arsip.upload-file',
            'verifikasi-arsip.view',
            'verifikasi-arsip.verify',
            'verifikasi-arsip.reject',
            'kelola-tte.view',
            'kelola-tte.sign',
            'peminjaman.view',
            'peminjaman.approve',
            'peminjaman.reject',
            'peminjaman.return',
            'master-unit-organisasi.view',
            'master-jabatan.view',
            'master-klasifikasi-arsip.view',
            'master-lokasi-arsip.view',
            'master-jenis-arsip.view',
            'master-kategori-arsip.view',
            'master-sifat-arsip.view',
            'master-tingkat-akses-arsip.view',
            'master-tingkat-perkembangan-arsip.view',
            'master-kondisi-arsip.view',
            'master-nasib-akhir.view',
        ]);

        $pimpinanRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'repositori-arsip.view',
            'repositori-arsip.download',
            'repositori-arsip.delete',
            'arsip-inaktif.view',
            'nasib-akhir-arsip.view',
            'nasib-akhir-arsip.delete',
            'verifikasi-arsip.view',
            'verifikasi-arsip.verify',
            'verifikasi-arsip.reject',
            'kelola-tte.view',
            'kelola-tte.sign',
            'peminjaman.view',
            'peminjaman.approve',
            'peminjaman.reject',
        ]);

        $operatorUnitRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'repositori-arsip.view',
            'repositori-arsip.download',
            'kelola-arsip.view',
            'kelola-arsip.create',
            'kelola-arsip.update',
            'kelola-arsip.upload-file',
            'peminjaman.view',
            'peminjaman.create',
        ]);

        // 4. Hapus permission lama yang tidak dipakai lagi
        $oldPermissions = [
            'arsip.view', 'arsip.create', 'arsip.update', 'arsip.delete', 'arsip.restore',
            'dokumen.view', 'dokumen.upload', 'dokumen.download', 'dokumen.delete',
            'workflow.view', 'workflow.verify', 'workflow.approve', 'workflow.reject', 'workflow.tte',
            'master.view', 'master.create', 'master.update', 'master.delete',
            'user.view', 'user.create', 'user.update', 'user.delete',
            'role.view', 'role.create', 'role.update', 'role.delete',
            'permission.view', 'permission.create', 'permission.update', 'permission.delete',
            'auditlog.view',
        ];

        Permission::whereIn('name', $oldPermissions)->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down operation needed for permission upgrade
    }
};
