<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RecycleBinController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\ArsipController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ForgotUsernameController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KelolaArsipController;
use App\Http\Controllers\Master\JabatanController;
use App\Http\Controllers\Master\JenisArsipController;
use App\Http\Controllers\Master\KategoriArsipController;
use App\Http\Controllers\Master\KlasifikasiArsipController;
use App\Http\Controllers\Master\KondisiArsipController;
use App\Http\Controllers\Master\LokasiArsipController;
use App\Http\Controllers\Master\NasibAkhirController;
use App\Http\Controllers\Master\SifatArsipController;
use App\Http\Controllers\Master\TingkatAksesArsipController;
use App\Http\Controllers\Master\TingkatPerkembanganArsipController;
use App\Http\Controllers\Master\UnitOrganisasiController;
use App\Http\Controllers\Pengelolaan\ArsipInaktifController;
use App\Http\Controllers\Pengelolaan\NasibAkhirArsipController;
use App\Http\Controllers\Pengelolaan\PeminjamanController;
use App\Http\Controllers\TteController;
use App\Http\Controllers\VerifikasiArsipController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('forgot-username', [ForgotUsernameController::class, 'create'])->name('forgot-username.request');
    Route::post('forgot-username', [ForgotUsernameController::class, 'store'])->name('forgot-username.email');
    Route::post('forgot-password', [ForgotPasswordController::class, 'store'])->name('password.email');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // ── Kelola Arsip & Verifikasi ────────────────────────────────────────
    Route::get('kelola-arsip', [KelolaArsipController::class, 'index'])->name('kelola-arsip.index');
    Route::get('verifikasi-arsip', [VerifikasiArsipController::class, 'index'])->name('verifikasi-arsip.index');
    Route::get('kelola-tte', [TteController::class, 'index'])->name('kelola-tte.index');
    Route::post('arsip/bulk-ajukan-tte', [TteController::class, 'bulkAjukan'])->name('arsip.bulk-ajukan-tte');
    Route::post('arsip/{arsip}/ajukan-tte', [TteController::class, 'ajukan'])->name('arsip.ajukan-tte');

    // ── Repositori Arsip ──────────────────────────────────────────────────
    Route::post('arsip/bulk-verify', [ArsipController::class, 'bulkVerify'])->name('arsip.bulk-verify');
    Route::post('arsip/bulk-reject', [ArsipController::class, 'bulkReject'])->name('arsip.bulk-reject');
    Route::post('arsip/bulk-delete', [ArsipController::class, 'bulkDelete'])->name('arsip.bulk-delete');
    Route::get('arsip/{arsip}/detail-json', [ArsipController::class, 'detailJson'])->name('arsip.detail-json');
    Route::get('arsip/{arsip}/download', [ArsipController::class, 'download'])->name('arsip.download');
    Route::post('arsip/{arsip}/upload', [ArsipController::class, 'uploadFile'])->name('arsip.upload-file');
    Route::post('arsip/{arsip}/replace', [ArsipController::class, 'replaceFile'])->name('arsip.replace-file');
    Route::delete('arsip/{arsip}/file', [ArsipController::class, 'deleteFile'])->name('arsip.delete-file');
    Route::get('arsip/version/{version}/download', [ArsipController::class, 'downloadVersion'])->name('arsip.download-version');
    Route::post('arsip/{arsip}/verify', [ArsipController::class, 'verify'])->name('arsip.verify');
    Route::post('arsip/{arsip}/reject', [ArsipController::class, 'reject'])->name('arsip.reject');
    Route::post('arsip/{arsip}/resubmit', [ArsipController::class, 'resubmit'])->name('arsip.resubmit');

    Route::resource('arsip', ArsipController::class)->except(['show']);
    Route::post('arsip/{arsip}/workflow/advance', [ArsipController::class, 'advanceWorkflow'])->name('arsip.workflow.advance');

    // ── Pengelolaan ───────────────────────────────────────────────────────
    Route::get('arsip-inaktif', [ArsipInaktifController::class, 'index'])->name('arsip-inaktif.index');
    Route::get('nasib-akhir-arsip', [NasibAkhirArsipController::class, 'index'])->name('nasib-akhir-arsip.index');
    Route::redirect('record-center', '/arsip-inaktif');
    Route::redirect('pemusnahan', '/nasib-akhir-arsip');
    Route::get('peminjaman', [PeminjamanController::class, 'index'])->name('peminjaman.index');
    Route::post('peminjaman/{arsip}/ajukan', [PeminjamanController::class, 'store'])->name('peminjaman.store');
    Route::post('peminjaman/{peminjaman}/approve', [PeminjamanController::class, 'approve'])->name('peminjaman.approve');
    Route::post('peminjaman/{peminjaman}/reject', [PeminjamanController::class, 'reject'])->name('peminjaman.reject');
    Route::post('peminjaman/bulk-approve', [PeminjamanController::class, 'bulkApprove'])->name('peminjaman.bulk-approve');
    Route::post('peminjaman/bulk-reject', [PeminjamanController::class, 'bulkReject'])->name('peminjaman.bulk-reject');

    // ── Master Data ───────────────────────────────────────────────────────
    Route::prefix('master')->name('master.')->group(function () {
        Route::resource('unit-organisasi', UnitOrganisasiController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['unit-organisasi' => 'unitOrganisasi']);
        Route::resource('jabatan', JabatanController::class)
            ->only(['index', 'store', 'update', 'destroy']);
        Route::resource('klasifikasi-arsip', KlasifikasiArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['klasifikasi-arsip' => 'klasifikasiArsip']);
        Route::resource('lokasi-arsip', LokasiArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['lokasi-arsip' => 'lokasiArsip']);
        Route::resource('jenis-arsip', JenisArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['jenis-arsip' => 'jenisArsip']);
        Route::resource('kategori-arsip', KategoriArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['kategori-arsip' => 'kategoriArsip']);
        Route::resource('sifat-arsip', SifatArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['sifat-arsip' => 'sifatArsip']);
        Route::resource('tingkat-akses-arsip', TingkatAksesArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['tingkat-akses-arsip' => 'tingkatAksesArsip']);
        Route::resource('tingkat-perkembangan-arsip', TingkatPerkembanganArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['tingkat-perkembangan-arsip' => 'tingkatPerkembanganArsip']);
        Route::resource('kondisi-arsip', KondisiArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['kondisi-arsip' => 'kondisiArsip']);
        Route::resource('nasib-akhir', NasibAkhirController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['nasib-akhir' => 'nasibAkhir']);
    });

    // ── Administrasi ──────────────────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('pengguna', PenggunaController::class)
            ->only(['index', 'store', 'update', 'destroy']);
        Route::resource('role', RoleController::class)
            ->only(['index', 'store', 'update', 'destroy']);
        Route::get('permission', [PermissionController::class, 'index'])->name('permission.index');
        Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');

        // Recycle Bin
        Route::get('recycle-bin', [RecycleBinController::class, 'index'])->name('recycle-bin.index');
        Route::post('recycle-bin/{id}/restore', [RecycleBinController::class, 'restore'])->name('recycle-bin.restore');
        Route::delete('recycle-bin/{id}/force-delete', [RecycleBinController::class, 'forceDelete'])->name('recycle-bin.force-delete');
    });
});

require __DIR__.'/settings.php';
