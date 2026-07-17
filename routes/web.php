<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\ArsipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Master\JabatanController;
use App\Http\Controllers\Master\JenisArsipController;
use App\Http\Controllers\Master\KlasifikasiArsipController;
use App\Http\Controllers\Master\LokasiArsipController;
use App\Http\Controllers\Master\MediaArsipController;
use App\Http\Controllers\Master\RetensiArsipController;
use App\Http\Controllers\Master\UnitOrganisasiController;
use App\Http\Controllers\Pengelolaan\PemusnahanController;
use App\Http\Controllers\Pengelolaan\PermohonanController;
use App\Http\Controllers\Pengelolaan\RecordCenterController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // ── Repositori Arsip ──────────────────────────────────────────────────
    Route::get('arsip/{arsip}/download', [ArsipController::class, 'download'])->name('arsip.download');
    Route::post('arsip/{arsip}/upload', [ArsipController::class, 'uploadFile'])->name('arsip.upload-file');
    Route::post('arsip/{arsip}/replace', [ArsipController::class, 'replaceFile'])->name('arsip.replace-file');
    Route::delete('arsip/{arsip}/file', [ArsipController::class, 'deleteFile'])->name('arsip.delete-file');
    Route::get('arsip/version/{version}/download', [ArsipController::class, 'downloadVersion'])->name('arsip.download-version');
    Route::post('arsip/{arsip}/ocr-reprocess', [ArsipController::class, 'reprocessOcr'])->name('arsip.ocr-reprocess');

    Route::resource('arsip', ArsipController::class);

    // ── Pengelolaan ───────────────────────────────────────────────────────
    Route::get('record-center', [RecordCenterController::class, 'index'])->name('record-center.index');
    Route::get('pemusnahan', [PemusnahanController::class, 'index'])->name('pemusnahan.index');
    Route::get('permohonan', [PermohonanController::class, 'index'])->name('permohonan.index');

    // ── Master Data ───────────────────────────────────────────────────────
    Route::prefix('master')->name('master.')->group(function () {
        Route::get('unit-organisasi', [UnitOrganisasiController::class, 'index'])->name('unit-organisasi.index');
        Route::get('jabatan', [JabatanController::class, 'index'])->name('jabatan.index');
        Route::get('klasifikasi-arsip', [KlasifikasiArsipController::class, 'index'])->name('klasifikasi-arsip.index');
        Route::get('lokasi-arsip', [LokasiArsipController::class, 'index'])->name('lokasi-arsip.index');
        Route::get('jenis-arsip', [JenisArsipController::class, 'index'])->name('jenis-arsip.index');
        Route::get('media-arsip', [MediaArsipController::class, 'index'])->name('media-arsip.index');
        Route::get('retensi-arsip', [RetensiArsipController::class, 'index'])->name('retensi-arsip.index');
    });

    // ── Administrasi ──────────────────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('pengguna', [PenggunaController::class, 'index'])->name('pengguna.index');
        Route::get('role', [RoleController::class, 'index'])->name('role.index');
        Route::get('permission', [PermissionController::class, 'index'])->name('permission.index');
        Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
    });
});

require __DIR__.'/settings.php';
