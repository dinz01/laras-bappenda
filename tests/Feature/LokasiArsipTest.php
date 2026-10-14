<?php

use App\Models\Arsip;
use App\Models\LokasiArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for lokasi arsip index', function () {
    $this->get(route('master.lokasi-arsip.index'))->assertRedirect(route('login'));
});

it('renders lokasi arsip index with correct props', function () {
    LokasiArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.lokasi-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/lokasi-arsip/index')
            ->has('lokasis')
            ->has('parentOptions')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new lokasi arsip with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.lokasi-arsip.store'), [
            'nama' => 'Ruang Arsip Test',
            'gedung' => 'Gedung A',
            'lantai' => '1',
            'ruangan' => 'Ruang 101',
            'rak' => 'Rak A-01',
            'box' => 'BOX-001',
            'keterangan' => 'Keterangan test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('lokasi_arsip', [
        'kode' => 'LOC-001',
        'nama' => 'Ruang Arsip Test',
        'gedung' => 'Gedung A',
    ]);
});

it('increments sequential auto-generated kode for lokasi arsip', function () {
    LokasiArsip::factory()->create(['kode' => 'LOC-001']);

    $this->actingAs($this->user)
        ->post(route('master.lokasi-arsip.store'), [
            'nama' => 'Gedung Depo B',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('lokasi_arsip', [
        'kode' => 'LOC-002',
        'nama' => 'Gedung Depo B',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.lokasi-arsip.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a lokasi arsip without changing kode', function () {
    $lokasiArsip = LokasiArsip::factory()->create(['kode' => 'LOC-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.lokasi-arsip.update', $lokasiArsip), [
            'nama' => 'Nama Diperbarui',
            'gedung' => 'Gedung B',
            'lantai' => null,
            'ruangan' => null,
            'rak' => null,
            'box' => null,
            'keterangan' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('lokasi_arsip', [
        'id' => $lokasiArsip->id,
        'kode' => 'LOC-001',
        'nama' => 'Nama Diperbarui',
        'gedung' => 'Gedung B',
        'status' => 'inactive',
    ]);
});

it('deletes a lokasi arsip not in use', function () {
    $lokasiArsip = LokasiArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.lokasi-arsip.destroy', $lokasiArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('lokasi_arsip', ['id' => $lokasiArsip->id]);
});

it('prevents deleting lokasi arsip in use by arsip', function () {
    $lokasiArsip = LokasiArsip::factory()->create();
    Arsip::factory()->create(['lokasi_arsip_id' => $lokasiArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.lokasi-arsip.destroy', $lokasiArsip))
        ->assertSessionHasErrors('lokasi_arsip');

    $this->assertDatabaseHas('lokasi_arsip', ['id' => $lokasiArsip->id]);
});

it('searches lokasi arsip by kode', function () {
    LokasiArsip::factory()->create(['kode' => 'LOC-001', 'nama' => 'Gedung A']);
    LokasiArsip::factory()->create(['kode' => 'LOC-002', 'nama' => 'Gedung B']);

    $this->actingAs($this->user)
        ->get(route('master.lokasi-arsip.index', ['search' => 'LOC-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('lokasis', 1)
        );
});
