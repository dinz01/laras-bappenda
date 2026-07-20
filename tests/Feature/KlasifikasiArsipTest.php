<?php

use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
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
            ->has('klasifikasiArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new klasifikasi arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.klasifikasi-arsip.store'), [
            'kode' => 'KA-TEST',
            'nama' => 'Test Klasifikasi',
            'deskripsi' => 'Deskripsi test',
            'retensi_aktif' => 5,
            'retensi_inaktif' => 10,
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('klasifikasi_arsip', [
        'kode' => 'KA-TEST',
        'nama' => 'Test Klasifikasi',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.klasifikasi-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'retensi_aktif', 'retensi_inaktif', 'status']);
});

it('updates a klasifikasi arsip', function () {
    $klasifikasiArsip = KlasifikasiArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.klasifikasi-arsip.update', $klasifikasiArsip), [
            'kode' => $klasifikasiArsip->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'retensi_aktif' => 3,
            'retensi_inaktif' => 7,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('klasifikasi_arsip', [
        'id' => $klasifikasiArsip->id,
        'nama' => 'Nama Diperbarui',
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

it('searches klasifikasi arsip by kode', function () {
    KlasifikasiArsip::factory()->create(['kode' => 'KA-001', 'nama' => 'Pertama']);
    KlasifikasiArsip::factory()->create(['kode' => 'KB-002', 'nama' => 'Kedua']);

    $this->actingAs($this->user)
        ->get(route('master.klasifikasi-arsip.index', ['search' => 'KA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('klasifikasiArsips.data', 1)
        );
});
