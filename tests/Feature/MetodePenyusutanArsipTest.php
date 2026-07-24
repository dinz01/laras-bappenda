<?php

use App\Models\MetodePenyusutanArsip;
use App\Models\RetensiArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for metode penyusutan arsip index', function () {
    $this->get(route('master.metode-penyusutan-arsip.index'))->assertRedirect(route('login'));
});

it('renders metode penyusutan arsip index with correct props', function () {
    MetodePenyusutanArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.metode-penyusutan-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/metode-penyusutan-arsip/index')
            ->has('metodePenyusutanArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new metode penyusutan arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.metode-penyusutan-arsip.store'), [
            'kode' => 'MPA-001',
            'nama' => 'Pemusnahan Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('metode_penyusutan_arsip', [
        'kode' => 'MPA-001',
        'nama' => 'Pemusnahan Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.metode-penyusutan-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a metode penyusutan arsip', function () {
    $metodePenyusutan = MetodePenyusutanArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.metode-penyusutan-arsip.update', $metodePenyusutan), [
            'kode' => $metodePenyusutan->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('metode_penyusutan_arsip', [
        'id' => $metodePenyusutan->id,
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a metode penyusutan arsip not in use', function () {
    $metodePenyusutan = MetodePenyusutanArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.metode-penyusutan-arsip.destroy', $metodePenyusutan))
        ->assertRedirect();

    $this->assertDatabaseMissing('metode_penyusutan_arsip', ['id' => $metodePenyusutan->id]);
});

it('prevents deleting metode penyusutan arsip in use by retensi arsip', function () {
    $metodePenyusutan = MetodePenyusutanArsip::factory()->create();
    RetensiArsip::factory()->create(['metode_penyusutan_arsip_id' => $metodePenyusutan->id]);

    $this->actingAs($this->user)
        ->delete(route('master.metode-penyusutan-arsip.destroy', $metodePenyusutan))
        ->assertSessionHasErrors('metode_penyusutan_arsip');

    $this->assertDatabaseHas('metode_penyusutan_arsip', ['id' => $metodePenyusutan->id]);
});

it('searches metode penyusutan arsip by kode', function () {
    MetodePenyusutanArsip::factory()->create(['kode' => 'MPA-001', 'nama' => 'Pemusnahan']);
    MetodePenyusutanArsip::factory()->create(['kode' => 'MPA-002', 'nama' => 'Permanen']);

    $this->actingAs($this->user)
        ->get(route('master.metode-penyusutan-arsip.index', ['search' => 'MPA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('metodePenyusutanArsips.data', 1)
        );
});
