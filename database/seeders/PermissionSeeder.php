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
            // Dashboard
            'dashboard.view',

            // Repositori Arsip
            'repositori-arsip.view',
            'repositori-arsip.delete',

            // Dokumen Arsip (akses unduh berkas - berlaku global di semua halaman)
            'dokumen-arsip.download',

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
            'verifikasi-arsip.update',
            'verifikasi-arsip.verify',
            'verifikasi-arsip.reject',

            // Kelola TTE
            'kelola-tte.view',
            'kelola-tte.update',
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
            'repositori-arsip.view',
            'repositori-arsip.delete',
            'dokumen-arsip.download',
            'arsip-inaktif.view',
            'nasib-akhir-arsip.view',
            'nasib-akhir-arsip.delete',
            'kelola-arsip.view',
            'kelola-arsip.create',
            'kelola-arsip.update',
            'kelola-arsip.delete',
            'kelola-arsip.upload-file',
            'verifikasi-arsip.view',
            'verifikasi-arsip.update',
            'verifikasi-arsip.verify',
            'verifikasi-arsip.reject',
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
            'admin-recycle-bin.view',
            'admin-recycle-bin.restore',
            'admin-recycle-bin.force-delete',
        ]);

        $pimpinanRole = Role::firstOrCreate(['name' => 'Pimpinan', 'guard_name' => 'web']);
        $pimpinanRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'repositori-arsip.view',
            'repositori-arsip.delete',
            'dokumen-arsip.download',
            'arsip-inaktif.view',
            'nasib-akhir-arsip.view',
            'nasib-akhir-arsip.delete',
            'kelola-arsip.view',
            'kelola-arsip.create',
            'kelola-arsip.update',
            'kelola-arsip.delete',
            'kelola-arsip.upload-file',
            'verifikasi-arsip.view',
            'verifikasi-arsip.update',
            'verifikasi-arsip.verify',
            'verifikasi-arsip.reject',
            'kelola-tte.view',
            'kelola-tte.update',
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
            'admin-recycle-bin.view',
            'admin-recycle-bin.restore',
            'admin-recycle-bin.force-delete',
        ]);

        $operatorUnitRole = Role::firstOrCreate(['name' => 'Operator Unit', 'guard_name' => 'web']);
        $operatorUnitRole->syncPermissions([
            'dashboard.view',
            'profile.view',
            'profile.update',
            'repositori-arsip.view',
            'arsip-inaktif.view',
            'nasib-akhir-arsip.view',
            'kelola-arsip.view',
            'kelola-arsip.create',
            'kelola-arsip.update',
            'kelola-arsip.upload-file',
            'peminjaman.view',
            'peminjaman.create',
        ]);
    }
}
