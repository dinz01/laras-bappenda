<?php

use App\Models\Arsip;
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

it('stores a new tingkat perkembangan arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.tingkat-perkembangan-arsip.store'), [
            'kode' => 'TPA-001',
            'nama' => 'Asli Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_perkembangan_arsip', [
        'kode' => 'TPA-001',
        'nama' => 'Asli Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.tingkat-perkembangan-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a tingkat perkembangan arsip', function () {
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.tingkat-perkembangan-arsip.update', $tingkatPerkembangan), [
            'kode' => $tingkatPerkembangan->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_perkembangan_arsip', [
        'id' => $tingkatPerkembangan->id,
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

it('prevents deleting tingkat perkembangan arsip in use by arsip', function () {
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create();
    Arsip::factory()->create(['tingkat_perkembangan_arsip_id' => $tingkatPerkembangan->id]);

    $this->actingAs($this->user)
        ->delete(route('master.tingkat-perkembangan-arsip.destroy', $tingkatPerkembangan))
        ->assertSessionHasErrors('tingkat_perkembangan_arsip');

    $this->assertDatabaseHas('tingkat_perkembangan_arsip', ['id' => $tingkatPerkembangan->id]);
});

it('searches tingkat perkembangan arsip by kode', function () {
    TingkatPerkembanganArsip::factory()->create(['kode' => 'TPA-001', 'nama' => 'Asli']);
    TingkatPerkembanganArsip::factory()->create(['kode' => 'TPA-002', 'nama' => 'Copy']);

    $this->actingAs($this->user)
        ->get(route('master.tingkat-perkembangan-arsip.index', ['search' => 'TPA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('tingkatPerkembanganArsips.data', 1)
        );
});
