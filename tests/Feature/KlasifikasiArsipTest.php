<?php

use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\NasibAkhir;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for klasifikasi arsip index', function () {
    $this->get(route('master.klasifikasi-arsip.index'))->assertRedirect(route('login'));
});

it('renders klasifikasi arsip index with correct props', function () {
    KlasifikasiArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.klasifikasi-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/klasifikasi-arsip/index')
            ->has('klasifikasis')
            ->has('parentOptions')
            ->has('nasibAkhirs')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new klasifikasi arsip', function () {
    $nasibAkhir = NasibAkhir::factory()->create();

    $this->actingAs($this->user)
        ->post(route('master.klasifikasi-arsip.store'), [
            'kode' => 'KA-TEST',
            'nama' => 'Test Klasifikasi',
            'deskripsi' => 'Deskripsi test',
            'retensi_aktif' => 2,
            'retensi_inaktif' => 1,
            'nasib_akhir_id' => $nasibAkhir->id,
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('klasifikasi_arsip', [
        'kode' => 'KA-TEST',
        'nama' => 'Test Klasifikasi',
        'retensi_aktif' => 2,
        'retensi_inaktif' => 1,
        'nasib_akhir_id' => $nasibAkhir->id,
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.klasifikasi-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('stores a klasifikasi arsip with parent', function () {
    $parent = KlasifikasiArsip::factory()->create(['kode' => 'I', 'nama' => 'Induk']);

    $this->actingAs($this->user)
        ->post(route('master.klasifikasi-arsip.store'), [
            'parent_id' => $parent->id,
            'kode' => 'I.A',
            'nama' => 'Sub Klasifikasi',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('klasifikasi_arsip', [
        'kode' => 'I.A',
        'parent_id' => $parent->id,
    ]);
});

it('updates a klasifikasi arsip', function () {
    $klasifikasiArsip = KlasifikasiArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.klasifikasi-arsip.update', $klasifikasiArsip), [
            'kode' => $klasifikasiArsip->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'retensi_aktif' => 3,
            'retensi_inaktif' => 2,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('klasifikasi_arsip', [
        'id' => $klasifikasiArsip->id,
        'nama' => 'Nama Diperbarui',
        'retensi_aktif' => 3,
        'status' => 'inactive',
    ]);
});

it('deletes a klasifikasi arsip not in use', function () {
    $klasifikasiArsip = KlasifikasiArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.klasifikasi-arsip.destroy', $klasifikasiArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('klasifikasi_arsip', ['id' => $klasifikasiArsip->id]);
});

it('prevents deleting klasifikasi arsip in use by arsip', function () {
    $klasifikasiArsip = KlasifikasiArsip::factory()->create();
    Arsip::factory()->create(['klasifikasi_arsip_id' => $klasifikasiArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.klasifikasi-arsip.destroy', $klasifikasiArsip))
        ->assertSessionHasErrors('klasifikasi_arsip');

    $this->assertDatabaseHas('klasifikasi_arsip', ['id' => $klasifikasiArsip->id]);
});

it('prevents deleting klasifikasi arsip in use by soft deleted arsip', function () {
    $klasifikasiArsip = KlasifikasiArsip::factory()->create();
    $arsip = Arsip::factory()->create(['klasifikasi_arsip_id' => $klasifikasiArsip->id]);
    $arsip->delete();

    $this->actingAs($this->user)
        ->delete(route('master.klasifikasi-arsip.destroy', $klasifikasiArsip))
        ->assertSessionHasErrors('klasifikasi_arsip');

    $this->assertDatabaseHas('klasifikasi_arsip', ['id' => $klasifikasiArsip->id]);
});

it('prevents deleting klasifikasi arsip that has children', function () {
    $parent = KlasifikasiArsip::factory()->create(['kode' => 'P', 'nama' => 'Parent']);
    KlasifikasiArsip::factory()->create(['kode' => 'P.1', 'nama' => 'Child', 'parent_id' => $parent->id]);

    $this->actingAs($this->user)
        ->delete(route('master.klasifikasi-arsip.destroy', $parent))
        ->assertSessionHasErrors('klasifikasi_arsip');

    $this->assertDatabaseHas('klasifikasi_arsip', ['id' => $parent->id]);
});

it('searches klasifikasi arsip by kode', function () {
    KlasifikasiArsip::factory()->create(['kode' => 'KA-001', 'nama' => 'Pertama']);
    KlasifikasiArsip::factory()->create(['kode' => 'KB-002', 'nama' => 'Kedua']);

    $this->actingAs($this->user)
        ->get(route('master.klasifikasi-arsip.index', ['search' => 'KA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('klasifikasis', 1)
        );
});

it('requires retensi fields when nasib akhir is selected', function () {
    $nasibAkhir = NasibAkhir::factory()->create();

    $this->actingAs($this->user)
        ->post(route('master.klasifikasi-arsip.store'), [
            'kode' => 'KA-REQ-TEST',
            'nama' => 'Test Klasifikasi Req',
            'nasib_akhir_id' => $nasibAkhir->id,
            'status' => 'active',
        ])
        ->assertSessionHasErrors(['retensi_aktif', 'retensi_inaktif']);
});
