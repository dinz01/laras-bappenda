<?php

use App\Models\TingkatPerkembanganArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for tingkat perkembangan arsip index', function () {
    $this->get(route('master.tingkat-perkembangan-arsip.index'))->assertRedirect(route('login'));
});

it('renders tingkat perkembangan arsip index with correct props', function () {
    TingkatPerkembanganArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.tingkat-perkembangan-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/tingkat-perkembangan-arsip/index')
            ->has('tingkatPerkembanganArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new tingkat perkembangan arsip with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.tingkat-perkembangan-arsip.store'), [
            'nama' => 'Petikan',
            'deskripsi' => 'Petikan resmi dari naskah dinas',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_perkembangan_arsip', [
        'kode' => 'TPA-001',
        'nama' => 'Petikan',
    ]);
});

it('increments sequential auto-generated kode for tingkat perkembangan arsip', function () {
    TingkatPerkembanganArsip::factory()->create(['kode' => 'TPA-001']);

    $this->actingAs($this->user)
        ->post(route('master.tingkat-perkembangan-arsip.store'), [
            'nama' => 'Arsip Transkrip',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_perkembangan_arsip', [
        'kode' => 'TPA-002',
        'nama' => 'Arsip Transkrip',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.tingkat-perkembangan-arsip.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a tingkat perkembangan arsip without changing kode', function () {
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create(['kode' => 'TPA-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.tingkat-perkembangan-arsip.update', $tingkatPerkembangan), [
            'nama' => 'Nama Diperbarui',
            'deskripsi' => 'Deskripsi baru',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_perkembangan_arsip', [
        'id' => $tingkatPerkembangan->id,
        'kode' => 'TPA-001',
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a tingkat perkembangan arsip not in use', function () {
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.tingkat-perkembangan-arsip.destroy', $tingkatPerkembangan))
        ->assertRedirect();

    $this->assertDatabaseMissing('tingkat_perkembangan_arsip', ['id' => $tingkatPerkembangan->id]);
});

it('searches tingkat perkembangan arsip by kode', function () {
    TingkatPerkembanganArsip::factory()->create(['kode' => 'TPA-001', 'nama' => 'Asli']);
    TingkatPerkembanganArsip::factory()->create(['kode' => 'TPA-002', 'nama' => 'Salinan']);

    $this->actingAs($this->user)
        ->get(route('master.tingkat-perkembangan-arsip.index', ['search' => 'TPA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('tingkatPerkembanganArsips.data', 1)
        );
});
