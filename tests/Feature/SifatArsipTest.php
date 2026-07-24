<?php

use App\Models\Arsip;
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

it('stores a new sifat arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.sifat-arsip.store'), [
            'kode' => 'SA-001',
            'nama' => 'Biasa Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('sifat_arsip', [
        'kode' => 'SA-001',
        'nama' => 'Biasa Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.sifat-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a sifat arsip', function () {
    $sifatArsip = SifatArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.sifat-arsip.update', $sifatArsip), [
            'kode' => $sifatArsip->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('sifat_arsip', [
        'id' => $sifatArsip->id,
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

it('prevents deleting sifat arsip in use by arsip', function () {
    $sifatArsip = SifatArsip::factory()->create();
    Arsip::factory()->create(['sifat_arsip_id' => $sifatArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.sifat-arsip.destroy', $sifatArsip))
        ->assertSessionHasErrors('sifat_arsip');

    $this->assertDatabaseHas('sifat_arsip', ['id' => $sifatArsip->id]);
});

it('searches sifat arsip by kode', function () {
    SifatArsip::factory()->create(['kode' => 'SA-001', 'nama' => 'Pertama']);
    SifatArsip::factory()->create(['kode' => 'SB-002', 'nama' => 'Kedua']);

    $this->actingAs($this->user)
        ->get(route('master.sifat-arsip.index', ['search' => 'SA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('sifatArsips.data', 1)
        );
});
