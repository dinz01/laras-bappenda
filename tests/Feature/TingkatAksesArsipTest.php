<?php

use App\Models\Arsip;
use App\Models\TingkatAksesArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for tingkat akses arsip index', function () {
    $this->get(route('master.tingkat-akses-arsip.index'))->assertRedirect(route('login'));
});

it('renders tingkat akses arsip index with correct props', function () {
    TingkatAksesArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.tingkat-akses-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/tingkat-akses-arsip/index')
            ->has('tingkatAksesArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new tingkat akses arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.tingkat-akses-arsip.store'), [
            'kode' => 'TAA-001',
            'nama' => 'Terbuka Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_akses_arsip', [
        'kode' => 'TAA-001',
        'nama' => 'Terbuka Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.tingkat-akses-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a tingkat akses arsip', function () {
    $tingkatAkses = TingkatAksesArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.tingkat-akses-arsip.update', $tingkatAkses), [
            'kode' => $tingkatAkses->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tingkat_akses_arsip', [
        'id' => $tingkatAkses->id,
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a tingkat akses arsip not in use', function () {
    $tingkatAkses = TingkatAksesArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.tingkat-akses-arsip.destroy', $tingkatAkses))
        ->assertRedirect();

    $this->assertDatabaseMissing('tingkat_akses_arsip', ['id' => $tingkatAkses->id]);
});

it('prevents deleting tingkat akses arsip in use by arsip', function () {
    $tingkatAkses = TingkatAksesArsip::factory()->create();
    Arsip::factory()->create(['tingkat_akses_arsip_id' => $tingkatAkses->id]);

    $this->actingAs($this->user)
        ->delete(route('master.tingkat-akses-arsip.destroy', $tingkatAkses))
        ->assertSessionHasErrors('tingkat_akses_arsip');

    $this->assertDatabaseHas('tingkat_akses_arsip', ['id' => $tingkatAkses->id]);
});

it('searches tingkat akses arsip by kode', function () {
    TingkatAksesArsip::factory()->create(['kode' => 'TAA-001', 'nama' => 'Terbuka']);
    TingkatAksesArsip::factory()->create(['kode' => 'TAA-002', 'nama' => 'Rahasia']);

    $this->actingAs($this->user)
        ->get(route('master.tingkat-akses-arsip.index', ['search' => 'TAA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('tingkatAksesArsips.data', 1)
        );
});
