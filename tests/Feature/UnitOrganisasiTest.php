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

it('stores a new root unit organisasi with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [
            'nama' => 'Sekretariat Test',
            'singkatan' => 'SEKR',
            'parent_id' => null,
            'tipe' => 'bidang',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'kode' => 'BID-001',
        'nama' => 'Sekretariat Test',
        'singkatan' => 'SEKR',
        'parent_id' => null,
    ]);
});

it('stores a new child unit organisasi with auto-generated kode', function () {
    $parent = UnitOrganisasi::factory()->create(['tipe' => 'bidang']);

    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [
            'nama' => 'Sub Bagian Umum',
            'singkatan' => 'UMUM',
            'parent_id' => $parent->id,
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'kode' => 'SUB-001',
        'nama' => 'Sub Bagian Umum',
        'parent_id' => $parent->id,
    ]);
});

it('stores a new upt unit organisasi with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [
            'nama' => 'UPT Pajak Daerah Cibinong',
            'singkatan' => 'UPT-CBN',
            'parent_id' => null,
            'tipe' => 'upt',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'kode' => 'UPT-001',
        'nama' => 'UPT Pajak Daerah Cibinong',
        'tipe' => 'upt',
    ]);
});

it('increments sequential auto-generated kode for same tipe', function () {
    UnitOrganisasi::factory()->create(['kode' => 'BID-001', 'tipe' => 'bidang']);

    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [
            'nama' => 'Bidang Pajak Daerah',
            'tipe' => 'bidang',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('unit_organisasi', [
        'kode' => 'BID-002',
        'nama' => 'Bidang Pajak Daerah',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.unit-organisasi.store'), [])
        ->assertSessionHasErrors(['nama', 'status', 'tipe']);
});

it('prevents setting self as parent on update', function () {
    $unit = UnitOrganisasi::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.unit-organisasi.update', $unit), [
            'kode' => $unit->kode,
            'nama' => $unit->nama,
            'singkatan' => $unit->singkatan,
            'parent_id' => $unit->id,
            'tipe' => 'bidang',
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
            'tipe' => 'bidang',
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
    UnitOrganisasi::factory()->create(['kode' => 'BID-001', 'nama' => 'Sekretariat']);
    UnitOrganisasi::factory()->create(['kode' => 'BID-002', 'nama' => 'Pendataan']);

    $this->actingAs($this->user)
        ->get(route('master.unit-organisasi.index', ['search' => 'BID-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('units', 1)
        );
});
