<?php

use App\Models\NasibAkhir;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for nasib akhir index', function () {
    $this->get(route('master.nasib-akhir.index'))->assertRedirect(route('login'));
});

it('renders nasib akhir index with correct props', function () {
    NasibAkhir::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.nasib-akhir.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/nasib-akhir/index')
            ->has('nasibAkhirs')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new nasib akhir with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.nasib-akhir.store'), [
            'nama' => 'Musnah',
            'keterangan' => 'Arsip dimusnahkan setelah masa retensi berakhir.',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('nasib_akhir', [
        'kode' => 'NSB-001',
        'nama' => 'Musnah',
    ]);
});

it('increments sequential auto-generated kode for nasib akhir', function () {
    NasibAkhir::factory()->create(['kode' => 'NSB-001']);

    $this->actingAs($this->user)
        ->post(route('master.nasib-akhir.store'), [
            'nama' => 'Permanen',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('nasib_akhir', [
        'kode' => 'NSB-002',
        'nama' => 'Permanen',
    ]);
});

it('validates required fields on nasib akhir store', function () {
    $this->actingAs($this->user)
        ->post(route('master.nasib-akhir.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a nasib akhir without changing kode', function () {
    $nasibAkhir = NasibAkhir::factory()->create(['kode' => 'NSB-001', 'nama' => 'Musnah']);

    $this->actingAs($this->user)
        ->put(route('master.nasib-akhir.update', $nasibAkhir), [
            'nama' => 'Musnah Permanen',
            'keterangan' => 'Keterangan baru',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('nasib_akhir', [
        'id' => $nasibAkhir->id,
        'kode' => 'NSB-001',
        'nama' => 'Musnah Permanen',
        'status' => 'inactive',
    ]);
});

it('deletes a nasib akhir not in use', function () {
    $nasibAkhir = NasibAkhir::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.nasib-akhir.destroy', $nasibAkhir))
        ->assertRedirect();

    $this->assertDatabaseMissing('nasib_akhir', ['id' => $nasibAkhir->id]);
});

it('searches nasib akhir by kode', function () {
    NasibAkhir::factory()->create(['kode' => 'NSB-001', 'nama' => 'Musnah']);
    NasibAkhir::factory()->create(['kode' => 'NSB-002', 'nama' => 'Permanen']);

    $this->actingAs($this->user)
        ->get(route('master.nasib-akhir.index', ['search' => 'NSB-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('nasibAkhirs.data', 1)
        );
});
