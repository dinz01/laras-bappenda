<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RecycleBinController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\ArsipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Master\JabatanController;
use App\Http\Controllers\Master\JenisArsipController;
use App\Http\Controllers\Master\KlasifikasiArsipController;
use App\Http\Controllers\Master\LokasiArsipController;
use App\Http\Controllers\Master\MediaArsipController;
use App\Http\Controllers\Master\RetensiArsipController;
use App\Http\Controllers\Master\SifatArsipController;
use App\Http\Controllers\Master\StatusArsipController;
use App\Http\Controllers\Master\UnitOrganisasiController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Pengelolaan\PemusnahanController;
use App\Http\Controllers\Pengelolaan\PermohonanController;
use App\Http\Controllers\Pengelolaan\RecordCenterController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // ── Notifications ─────────────────────────────────────────────────────
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.mark-read');
    Route::get('notifications/{notification}/redirect', [NotificationController::class, 'redirect'])->name('notifications.redirect');

    // ── Repositori Arsip ──────────────────────────────────────────────────
    Route::get('arsip/{arsip}/download', [ArsipController::class, 'download'])->name('arsip.download');
    Route::post('arsip/{arsip}/upload', [ArsipController::class, 'uploadFile'])->name('arsip.upload-file');
    Route::post('arsip/{arsip}/replace', [ArsipController::class, 'replaceFile'])->name('arsip.replace-file');
    Route::delete('arsip/{arsip}/file', [ArsipController::class, 'deleteFile'])->name('arsip.delete-file');
    Route::get('arsip/version/{version}/download', [ArsipController::class, 'downloadVersion'])->name('arsip.download-version');
    Route::post('arsip/{arsip}/ocr-reprocess', [ArsipController::class, 'reprocessOcr'])->name('arsip.ocr-reprocess');
    Route::post('arsip/{arsip}/workflow/advance', [ArsipController::class, 'advanceWorkflow'])->name('arsip.workflow.advance');

    Route::resource('arsip', ArsipController::class);

    // ── Pengelolaan ───────────────────────────────────────────────────────
    Route::get('record-center', [RecordCenterController::class, 'index'])->name('record-center.index');
    Route::get('pemusnahan', [PemusnahanController::class, 'index'])->name('pemusnahan.index');
    Route::get('permohonan', [PermohonanController::class, 'index'])->name('permohonan.index');

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
        Route::get('lokasi-arsip', [LokasiArsipController::class, 'index'])->name('lokasi-arsip.index');
        Route::resource('jenis-arsip', JenisArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['jenis-arsip' => 'jenisArsip']);
        Route::resource('media-arsip', MediaArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['media-arsip' => 'mediaArsip']);
        Route::resource('retensi-arsip', RetensiArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['retensi-arsip' => 'retensiArsip']);
        Route::resource('sifat-arsip', SifatArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['sifat-arsip' => 'sifatArsip']);
        Route::resource('status-arsip', StatusArsipController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['status-arsip' => 'statusArsip']);
    });

    // ── Administrasi ──────────────────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('pengguna', [PenggunaController::class, 'index'])->name('pengguna.index');
        Route::get('role', [RoleController::class, 'index'])->name('role.index');
        Route::get('permission', [PermissionController::class, 'index'])->name('permission.index');
        Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');

        // Recycle Bin
        Route::get('recycle-bin', [RecycleBinController::class, 'index'])->name('recycle-bin.index');
        Route::post('recycle-bin/{id}/restore', [RecycleBinController::class, 'restore'])->name('recycle-bin.restore');
        Route::delete('recycle-bin/{id}/force-delete', [RecycleBinController::class, 'forceDelete'])->name('recycle-bin.force-delete');
    });
});

require __DIR__.'/settings.php';
