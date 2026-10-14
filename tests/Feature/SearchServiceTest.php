<?php

use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\LokasiArsip;
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

    $arsip = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-ADV-001',
        'judul' => 'Laporan Target Akhir Tahun',
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'unit_organisasi_id' => $unit->id,
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

it('filters archive by lokasi_arsip_id including all descendant locations', function () {
    // Structure: Gedung -> Lantai -> Ruang -> Box
    $gedung = LokasiArsip::factory()->create(['nama' => 'Gedung A', 'parent_id' => null]);
    $lantai = LokasiArsip::factory()->create(['nama' => 'Lantai 1', 'parent_id' => $gedung->id]);
    $ruang = LokasiArsip::factory()->create(['nama' => 'Ruang Arsip', 'parent_id' => $lantai->id]);
    $box = LokasiArsip::factory()->create(['nama' => 'Box 01', 'parent_id' => $ruang->id]);

    $gedungLain = LokasiArsip::factory()->create(['nama' => 'Gedung B', 'parent_id' => null]);

    $arsipGedung = Arsip::factory()->create(['lokasi_arsip_id' => $gedung->id]);
    $arsipLantai = Arsip::factory()->create(['lokasi_arsip_id' => $lantai->id]);
    $arsipBox = Arsip::factory()->create(['lokasi_arsip_id' => $box->id]);
    $arsipLain = Arsip::factory()->create(['lokasi_arsip_id' => $gedungLain->id]);

    // Filter by root (Gedung A) should match archives in Gedung, Lantai, and Box
    $resultsGedung = $this->searchService->advancedSearch(['lokasi_arsip_id' => $gedung->id])->get();
    expect($resultsGedung->pluck('id'))
        ->toContain($arsipGedung->id, $arsipLantai->id, $arsipBox->id)
        ->not->toContain($arsipLain->id);

    // Filter by turunan ke-1 (Lantai 1) should match archives in Lantai and Box
    $resultsLantai = $this->searchService->advancedSearch(['lokasi_arsip_id' => $lantai->id])->get();
    expect($resultsLantai->pluck('id'))
        ->toContain($arsipLantai->id, $arsipBox->id)
        ->not->toContain($arsipGedung->id, $arsipLain->id);

    // Filter by turunan ke-2 (Ruang) which has no direct archives but has child Box
    $resultsRuang = $this->searchService->advancedSearch(['lokasi_arsip_id' => $ruang->id])->get();
    expect($resultsRuang->pluck('id'))
        ->toContain($arsipBox->id)
        ->not->toContain($arsipGedung->id, $arsipLantai->id, $arsipLain->id);

    // Filter by leaf/turunan terakhir (Box 01) should match only Box archive
    $resultsBox = $this->searchService->advancedSearch(['lokasi_arsip_id' => $box->id])->get();
    expect($resultsBox->pluck('id'))
        ->toContain($arsipBox->id)
        ->not->toContain($arsipGedung->id, $arsipLantai->id, $arsipLain->id);

    // Filter by Gedung B should match only Gedung B archive
    $resultsLain = $this->searchService->advancedSearch(['lokasi_arsip_id' => $gedungLain->id])->get();
    expect($resultsLain->pluck('id'))
        ->toContain($arsipLain->id)
        ->not->toContain($arsipGedung->id, $arsipLantai->id, $arsipBox->id);
});

it('filters archive by klasifikasi_arsip_id including all descendant classifications', function () {
    // Structure: Utama -> Sub -> Rincian
    $utama = KlasifikasiArsip::factory()->create(['kode' => '000', 'nama' => 'Umum', 'parent_id' => null]);
    $sub = KlasifikasiArsip::factory()->create(['kode' => '010', 'nama' => 'Kepegawaian', 'parent_id' => $utama->id]);
    $rincian = KlasifikasiArsip::factory()->create(['kode' => '011', 'nama' => 'Mutasi', 'parent_id' => $sub->id]);

    $utamaLain = KlasifikasiArsip::factory()->create(['kode' => '100', 'nama' => 'Keuangan', 'parent_id' => null]);

    $arsipUtama = Arsip::factory()->create(['klasifikasi_arsip_id' => $utama->id]);
    $arsipSub = Arsip::factory()->create(['klasifikasi_arsip_id' => $sub->id]);
    $arsipRincian = Arsip::factory()->create(['klasifikasi_arsip_id' => $rincian->id]);
    $arsipLain = Arsip::factory()->create(['klasifikasi_arsip_id' => $utamaLain->id]);

    // Filter by root (000 Umum) should match archives in Umum, Kepegawaian, and Mutasi
    $resultsUtama = $this->searchService->advancedSearch(['klasifikasi_arsip_id' => $utama->id])->get();
    expect($resultsUtama->pluck('id'))
        ->toContain($arsipUtama->id, $arsipSub->id, $arsipRincian->id)
        ->not->toContain($arsipLain->id);

    // Filter by sub (010 Kepegawaian) should match archives in Kepegawaian and Mutasi
    $resultsSub = $this->searchService->advancedSearch(['klasifikasi_arsip_id' => $sub->id])->get();
    expect($resultsSub->pluck('id'))
        ->toContain($arsipSub->id, $arsipRincian->id)
        ->not->toContain($arsipUtama->id, $arsipLain->id);

    // Filter by leaf (011 Mutasi) should match only Mutasi archive
    $resultsRincian = $this->searchService->advancedSearch(['klasifikasi_arsip_id' => $rincian->id])->get();
    expect($resultsRincian->pluck('id'))
        ->toContain($arsipRincian->id)
        ->not->toContain($arsipUtama->id, $arsipSub->id, $arsipLain->id);

    // Filter by 100 Keuangan should match only Keuangan archive
    $resultsLain = $this->searchService->advancedSearch(['klasifikasi_arsip_id' => $utamaLain->id])->get();
    expect($resultsLain->pluck('id'))
        ->toContain($arsipLain->id)
        ->not->toContain($arsipUtama->id, $arsipSub->id, $arsipRincian->id);
});

it('filters archive by unit_organisasi_id including all descendant units', function () {
    // Structure: Bidang -> Sub Bidang
    $bidang = UnitOrganisasi::factory()->create(['nama' => 'Bidang Pajak Daerah', 'parent_id' => null, 'tipe' => 'bidang']);
    $subBidang = UnitOrganisasi::factory()->create(['nama' => 'Sub Bidang PBB', 'parent_id' => $bidang->id, 'tipe' => 'sub_bidang']);
    $bidangLain = UnitOrganisasi::factory()->create(['nama' => 'Bidang Retribusi', 'parent_id' => null, 'tipe' => 'bidang']);

    $arsipBidang = Arsip::factory()->create(['unit_organisasi_id' => $bidang->id]);
    $arsipSub = Arsip::factory()->create(['unit_organisasi_id' => $subBidang->id]);
    $arsipLain = Arsip::factory()->create(['unit_organisasi_id' => $bidangLain->id]);

    // Filter by Bidang should match both Bidang and Sub Bidang archives
    $resultsBidang = $this->searchService->advancedSearch(['unit_organisasi_id' => $bidang->id])->get();
    expect($resultsBidang->pluck('id'))
        ->toContain($arsipBidang->id, $arsipSub->id)
        ->not->toContain($arsipLain->id);

    // Filter by Sub Bidang should match only Sub Bidang archive
    $resultsSub = $this->searchService->advancedSearch(['unit_organisasi_id' => $subBidang->id])->get();
    expect($resultsSub->pluck('id'))
        ->toContain($arsipSub->id)
        ->not->toContain($arsipBidang->id, $arsipLain->id);

    // Filter by Bidang Lain should match only its archive
    $resultsLain = $this->searchService->advancedSearch(['unit_organisasi_id' => $bidangLain->id])->get();
    expect($resultsLain->pluck('id'))
        ->toContain($arsipLain->id)
        ->not->toContain($arsipBidang->id, $arsipSub->id);
});
