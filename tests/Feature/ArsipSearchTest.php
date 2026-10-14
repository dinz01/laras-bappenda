<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\KategoriArsip;
use App\Models\UnitOrganisasi;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = superAdmin();
});

it('can search archives by nomor_arsip via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-NOMOR-123',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-NOMOR-456',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => '123']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can search archives by judul via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'judul' => 'Judul Laporan Keuangan',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'judul' => 'Surat Edaran Dinas',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => 'Keuangan']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can search archives by nop via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'judul' => 'Arsip Pajak Bumi',
        'nop' => '32.73.010.001.001-0001.0',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'judul' => 'Arsip Retribusi',
        'nop' => '11.22.333.444.555-6666.0',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => '32.73.010']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can search archives by deskripsi via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'judul' => 'Dokumen Umum',
        'deskripsi' => 'Pengurusan pembayaran PBB sektor perumahan',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'judul' => 'Dokumen Lain',
        'deskripsi' => 'Pengadaan barang kantor',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => 'perumahan']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can filter archives by workflow status via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'workflow_status' => WorkflowStatus::Review,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['workflow_status' => WorkflowStatus::Active->value]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can filter archives by unit organisasi via controller', function () {
    $unit1 = UnitOrganisasi::factory()->create();
    $unit2 = UnitOrganisasi::factory()->create();

    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'unit_organisasi_id' => $unit1->id,
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'unit_organisasi_id' => $unit2->id,
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['unit_organisasi_id' => $unit1->id]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('maintains pagination and keeps filters in query string', function () {
    // Create 20 archives under unit1 (page 1 has 15, page 2 has 5)
    $unit = UnitOrganisasi::factory()->create();
    $archives = Arsip::factory()->count(20)->create([
        'unit_organisasi_id' => $unit->id,
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    // Request second page with filter
    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', [
            'unit_organisasi_id' => $unit->id,
            'page' => 2,
        ]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            // Page 2 should have 5 items (since total is 20, page 1 has 15)
            ->has('arsips.data', 5)
            ->where('arsips.current_page', 2)
        );
});

it('provides filter options containing only items present in active archives', function () {
    $usedUnit = UnitOrganisasi::factory()->create(['nama' => 'Unit Terpakai']);
    UnitOrganisasi::factory()->create(['nama' => 'Unit Tidak Terpakai']);

    $usedKategori = KategoriArsip::factory()->create(['nama' => 'Kategori Terpakai']);
    KategoriArsip::factory()->create(['nama' => 'Kategori Tidak Terpakai']);

    Arsip::factory()->create([
        'unit_organisasi_id' => $usedUnit->id,
        'kategori_arsip_id' => $usedKategori->id,
        'workflow_status' => WorkflowStatus::Active,
        'tanggal_arsip' => now(),
    ]);

    $response = $this->actingAs($this->user)->get(route('arsip.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->has('filterUnitOrganisasis', 1)
            ->where('filterUnitOrganisasis.0.id', $usedUnit->id)
            ->has('filterKategoriArsips', 1)
            ->where('filterKategoriArsips.0.id', $usedKategori->id)
        );
});
