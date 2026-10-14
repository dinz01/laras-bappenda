<?php

use App\Models\SifatArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for sifat arsip index', function () {
    $this->get(route('master.sifat-arsip.index'))->assertRedirect(route('login'));
});

it('renders sifat arsip index with correct props', function () {
    SifatArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.sifat-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/sifat-arsip/index')
            ->has('sifatArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new sifat arsip with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.sifat-arsip.store'), [
            'nama' => 'Sifat Rahasia Baru',
            'deskripsi' => 'Deskripsi sifat test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('sifat_arsip', [
        'kode' => 'SFT-001',
        'nama' => 'Sifat Rahasia Baru',
    ]);
});

it('increments sequential auto-generated kode for sifat arsip', function () {
    SifatArsip::factory()->create(['kode' => 'SFT-001']);

    $this->actingAs($this->user)
        ->post(route('master.sifat-arsip.store'), [
            'nama' => 'Sifat Terbuka',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('sifat_arsip', [
        'kode' => 'SFT-002',
        'nama' => 'Sifat Terbuka',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.sifat-arsip.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a sifat arsip without changing kode', function () {
    $sifatArsip = SifatArsip::factory()->create(['kode' => 'SFT-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.sifat-arsip.update', $sifatArsip), [
            'nama' => 'Nama Diperbarui',
            'deskripsi' => 'Deskripsi baru',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('sifat_arsip', [
        'id' => $sifatArsip->id,
        'kode' => 'SFT-001',
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a sifat arsip not in use', function () {
    $sifatArsip = SifatArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.sifat-arsip.destroy', $sifatArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('sifat_arsip', ['id' => $sifatArsip->id]);
});

it('searches sifat arsip by kode', function () {
    SifatArsip::factory()->create(['kode' => 'SFT-001', 'nama' => 'Biasa']);
    SifatArsip::factory()->create(['kode' => 'SFT-002', 'nama' => 'Rahasia']);

    $this->actingAs($this->user)
        ->get(route('master.sifat-arsip.index', ['search' => 'SFT-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('sifatArsips.data', 1)
        );
});
