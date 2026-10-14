<?php

use App\Models\KategoriArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for kategori arsip index', function () {
    $this->get(route('master.kategori-arsip.index'))->assertRedirect(route('login'));
});

it('renders kategori arsip index with correct props', function () {
    KategoriArsip::factory()->count(2)->create();

    $this->actingAs($this->user)
        ->get(route('master.kategori-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/kategori-arsip/index')
            ->has('kategoriArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new kategori arsip with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.kategori-arsip.store'), [
            'nama' => 'Kategori Baru Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kategori_arsip', [
        'kode' => 'KAT-001',
        'nama' => 'Kategori Baru Test',
    ]);
});

it('increments sequential auto-generated kode for kategori arsip', function () {
    KategoriArsip::factory()->create(['kode' => 'KAT-001']);

    $this->actingAs($this->user)
        ->post(route('master.kategori-arsip.store'), [
            'nama' => 'Kategori Kedua Test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kategori_arsip', [
        'kode' => 'KAT-002',
        'nama' => 'Kategori Kedua Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.kategori-arsip.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a kategori arsip without changing kode', function () {
    $kategoriArsip = KategoriArsip::factory()->create(['kode' => 'KAT-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.kategori-arsip.update', $kategoriArsip), [
            'nama' => 'Nama Diperbarui',
            'deskripsi' => 'Deskripsi baru',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kategori_arsip', [
        'id' => $kategoriArsip->id,
        'kode' => 'KAT-001',
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a kategori arsip', function () {
    $kategoriArsip = KategoriArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.kategori-arsip.destroy', $kategoriArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('kategori_arsip', ['id' => $kategoriArsip->id]);
});

it('searches kategori arsip by kode', function () {
    KategoriArsip::factory()->create(['kode' => 'KAT-001', 'nama' => 'Arsip Satu']);
    KategoriArsip::factory()->create(['kode' => 'KAT-002', 'nama' => 'Arsip Dua']);

    $this->actingAs($this->user)
        ->get(route('master.kategori-arsip.index', ['search' => 'KAT-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('kategoriArsips.data', 1)
        );
});
