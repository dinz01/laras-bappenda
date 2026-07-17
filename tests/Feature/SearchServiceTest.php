<?php

use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\StatusArsip;
use App\Models\UnitOrganisasi;
use App\Services\SearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->searchService = new SearchService;
});

it('can search archive by nomor_arsip, judul, and deskripsi', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'NOMOR-12345',
        'judul' => 'Arsip Keuangan Penting',
        'deskripsi' => 'Deskripsi laporan bulanan',
    ]);

    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'NOMOR-99999',
        'judul' => 'Surat Undangan Dinas',
        'deskripsi' => 'Undangan rapat dinas',
    ]);

    // Search by nomor_arsip
    $results = $this->searchService->search('12345')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip1->id);

    // Search by judul
    $results = $this->searchService->search('Dinas')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip2->id);

    // Search by deskripsi
    $results = $this->searchService->search('laporan')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip1->id);
});

it('can search archive by relationship names and codes', function () {
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'kode' => 'KLAS-XYZ',
        'nama' => 'Klasifikasi Khusus',
    ]);

    $unit = UnitOrganisasi::factory()->create([
        'kode' => 'UNIT-ABC',
        'nama' => 'Unit Keuangan',
    ]);

    $arsip = Arsip::factory()->create([
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'unit_organisasi_id' => $unit->id,
    ]);

    // Search by klasifikasi kode
    $results = $this->searchService->search('XYZ')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip->id);

    // Search by unit nama
    $results = $this->searchService->search('Keuangan')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip->id);
});

it('can search archive by year of tanggal_arsip', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS/2024/00001',
        'tanggal_arsip' => '2024-05-10',
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS/2025/00002',
        'tanggal_arsip' => '2025-07-16',
    ]);

    // Search by year '2024'
    $results = $this->searchService->search('2024')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip1->id);

    // Search by year '2025'
    $results = $this->searchService->search('2025')->get();
    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($arsip2->id);
});

it('can advancedSearch archives by specific filters', function () {
    $klasifikasi = KlasifikasiArsip::factory()->create();
    $unit = UnitOrganisasi::factory()->create();
    $status = StatusArsip::factory()->create();

    $arsip = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-ADV-001',
        'judul' => 'Laporan Target Akhir Tahun',
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'unit_organisasi_id' => $unit->id,
        'status_arsip_id' => $status->id,
        'tanggal_arsip' => '2026-12-31',
    ]);

    $arsipLain = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-ADV-002',
        'judul' => 'Surat Pengantar Biasa',
        'tanggal_arsip' => '2025-01-01',
    ]);

    // Filter by nomor_arsip
    $results = $this->searchService->advancedSearch(['nomor_arsip' => 'ADV-001'])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);

    // Filter by judul
    $results = $this->searchService->advancedSearch(['judul' => 'Target'])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);

    // Filter by status_arsip_id
    $results = $this->searchService->advancedSearch(['status_arsip_id' => $status->id])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);

    // Filter by unit_organisasi_id
    $results = $this->searchService->advancedSearch(['unit_organisasi_id' => $unit->id])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);

    // Filter by klasifikasi_arsip_id
    $results = $this->searchService->advancedSearch(['klasifikasi_arsip_id' => $klasifikasi->id])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);

    // Filter by tahun
    $results = $this->searchService->advancedSearch(['tahun' => 2026])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);

    // Filter combined
    $results = $this->searchService->advancedSearch([
        'tahun' => 2026,
        'unit_organisasi_id' => $unit->id,
    ])->get();
    expect($results)->toHaveCount(1)->and($results->first()->id)->toBe($arsip->id);
});
