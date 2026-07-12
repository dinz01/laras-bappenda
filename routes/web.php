<?php

use App\Http\Controllers\ArsipController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Custom File Management Routes for Repository Arsip
    Route::get('arsip/{arsip}/download', [ArsipController::class, 'download'])->name('arsip.download');
    Route::post('arsip/{arsip}/upload', [ArsipController::class, 'uploadFile'])->name('arsip.upload-file');
    Route::post('arsip/{arsip}/replace', [ArsipController::class, 'replaceFile'])->name('arsip.replace-file');
    Route::delete('arsip/{arsip}/file', [ArsipController::class, 'deleteFile'])->name('arsip.delete-file');

    Route::resource('arsip', ArsipController::class);
});

require __DIR__.'/settings.php';
