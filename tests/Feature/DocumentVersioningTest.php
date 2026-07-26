<?php

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = superAdmin();
});

it('tracks versions correctly when uploading and replacing files', function () {
    Storage::fake('local');

    $arsip = Arsip::factory()->create();

    // 1. Upload pertama
    $file1 = UploadedFile::fake()->create('dokumen_v1.pdf', 500, 'application/pdf');
    $response = $this->actingAs($this->user)
        ->post(route('arsip.upload-file', $arsip), ['file' => $file1]);

    $response->assertRedirect();
    $this->assertDatabaseCount('dokumen_arsip', 1);
    $this->assertDatabaseCount('dokumen_arsip_versions', 1);

    $dokumen = DokumenArsip::first();
    expect($dokumen->nama_original)->toBe('dokumen_v1.pdf');

    $version1 = DokumenArsipVersion::first();
    expect($version1->versi)->toBe(1)
        ->and($version1->nama_file)->toBe('dokumen_v1.pdf')
        ->and($version1->hash_file)->not->toBeEmpty();

    // 2. Replace ke-1 (Version 2)
    $file2 = UploadedFile::fake()->create('dokumen_v2.pdf', 600, 'application/pdf');
    $response = $this->actingAs($this->user)
        ->post(route('arsip.replace-file', $arsip), ['file' => $file2]);

    $response->assertRedirect();
    $this->assertDatabaseCount('dokumen_arsip', 1);
    $this->assertDatabaseCount('dokumen_arsip_versions', 2);

    $dokumen->refresh();
    expect($dokumen->nama_original)->toBe('dokumen_v2.pdf');

    $version2 = DokumenArsipVersion::where('versi', 2)->first();
    expect($version2->nama_file)->toBe('dokumen_v2.pdf')
        ->and($version2->hash_file)->not->toBeEmpty();

    // 3. Replace ke-2 (Version 3)
    $file3 = UploadedFile::fake()->create('dokumen_v3.pdf', 700, 'application/pdf');
    $response = $this->actingAs($this->user)
        ->post(route('arsip.replace-file', $arsip), ['file' => $file3]);

    $response->assertRedirect();
    $this->assertDatabaseCount('dokumen_arsip', 1);
    $this->assertDatabaseCount('dokumen_arsip_versions', 3);

    $dokumen->refresh();
    expect($dokumen->nama_original)->toBe('dokumen_v3.pdf');

    $version3 = DokumenArsipVersion::where('versi', 3)->first();
    expect($version3->nama_file)->toBe('dokumen_v3.pdf')
        ->and($version3->hash_file)->not->toBeEmpty();

    // Pastikan seluruh file lama tetap ada di storage
    Storage::assertExists($version1->path_file);
    Storage::assertExists($version2->path_file);
    Storage::assertExists($version3->path_file);
});
