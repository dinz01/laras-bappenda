<?php

use App\Models\Arsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for unit organisasi index', function () {
    $this->get(route('master.unit-organisasi.index'))->assertRedirect(route('login'));
});

it('renders unit organisasi index with correct props', function () {
    UnitOrganisasi::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.unit-organisasi.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/unit-organisasi/index')
            ->has('units')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new root unit organisasi', function () {
    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [
            'kode' => 'UN-001',
            'nama' => 'Sekretariat Test',
            'singkatan' => 'SEKR',
            'parent_id' => null,
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'kode' => 'UN-001',
        'nama' => 'Sekretariat Test',
        'singkatan' => 'SEKR',
        'parent_id' => null,
    ]);
});

it('stores a new child unit organisasi', function () {
    $parent = UnitOrganisasi::factory()->create();

    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [
            'kode' => 'UN-002',
            'nama' => 'Sub Bagian Umum',
            'singkatan' => 'UMUM',
            'parent_id' => $parent->id,
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'kode' => 'UN-002',
        'parent_id' => $parent->id,
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('prevents setting self as parent on update', function () {
    $unit = UnitOrganisasi::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.unit-organisasi.update', $unit), [
            'kode' => $unit->kode,
            'nama' => $unit->nama,
            'singkatan' => $unit->singkatan,
            'parent_id' => $unit->id,
            'status' => 'active',
        ])
        ->assertSessionHasErrors('parent_id');
});

it('updates a unit organisasi', function () {
    $unit = UnitOrganisasi::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.unit-organisasi.update', $unit), [
            'kode' => $unit->kode,
            'nama' => 'Nama Diperbarui',
            'singkatan' => 'RENEW',
            'parent_id' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'id' => $unit->id,
        'nama' => 'Nama Diperbarui',
        'singkatan' => 'RENEW',
        'status' => 'inactive',
    ]);
});

it('deletes a unit organisasi without children or arsip', function () {
    $unit = UnitOrganisasi::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.unit-organisasi.destroy', $unit))
        ->assertRedirect();

    $this->assertDatabaseMissing('unit_organisasi', ['id' => $unit->id]);
});

it('prevents deleting unit organisasi with children', function () {
    $parent = UnitOrganisasi::factory()->create();
    UnitOrganisasi::factory()->create(['parent_id' => $parent->id]);

    $this->actingAs($this->user)
        ->delete(route('master.unit-organisasi.destroy', $parent))
        ->assertSessionHasErrors('unit_organisasi');

    $this->assertDatabaseHas('unit_organisasi', ['id' => $parent->id]);
});

it('prevents deleting unit organisasi in use by arsip', function () {
    $unit = UnitOrganisasi::factory()->create();
    Arsip::factory()->create(['unit_organisasi_id' => $unit->id]);

    $this->actingAs($this->user)
        ->delete(route('master.unit-organisasi.destroy', $unit))
        ->assertSessionHasErrors('unit_organisasi');

    $this->assertDatabaseHas('unit_organisasi', ['id' => $unit->id]);
});

it('searches unit organisasi by kode', function () {
    UnitOrganisasi::factory()->create(['kode' => 'UN-001', 'nama' => 'Sekretariat']);
    UnitOrganisasi::factory()->create(['kode' => 'UN-002', 'nama' => 'Pendataan']);

    $this->actingAs($this->user)
        ->get(route('master.unit-organisasi.index', ['search' => 'UN-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('units', 1)
        );
});
