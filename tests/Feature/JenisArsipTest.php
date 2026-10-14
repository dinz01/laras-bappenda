<?php

use App\Models\JenisArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for jenis arsip index', function () {
    $this->get(route('master.jenis-arsip.index'))->assertRedirect(route('login'));
});

it('renders jenis arsip index with correct props', function () {
    JenisArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.jenis-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/jenis-arsip/index')
            ->has('jenisArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new jenis arsip with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.jenis-arsip.store'), [
            'nama' => 'Surat Masuk Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('jenis_arsip', [
        'kode' => 'JNS-001',
        'nama' => 'Surat Masuk Test',
    ]);
});

it('increments sequential auto-generated kode for jenis arsip', function () {
    JenisArsip::factory()->create(['kode' => 'JNS-001']);

    $this->actingAs($this->user)
        ->post(route('master.jenis-arsip.store'), [
            'nama' => 'Surat Keluar Test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('jenis_arsip', [
        'kode' => 'JNS-002',
        'nama' => 'Surat Keluar Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.jenis-arsip.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a jenis arsip without changing kode', function () {
    $jenisArsip = JenisArsip::factory()->create(['kode' => 'JNS-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.jenis-arsip.update', $jenisArsip), [
            'nama' => 'Nama Diperbarui',
            'deskripsi' => 'Deskripsi baru',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('jenis_arsip', [
        'id' => $jenisArsip->id,
        'kode' => 'JNS-001',
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a jenis arsip not in use', function () {
    $jenisArsip = JenisArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.jenis-arsip.destroy', $jenisArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('jenis_arsip', ['id' => $jenisArsip->id]);
});

it('searches jenis arsip by kode', function () {
    JenisArsip::factory()->create(['kode' => 'JNS-001', 'nama' => 'Surat Masuk']);
    JenisArsip::factory()->create(['kode' => 'JNS-002', 'nama' => 'Surat Keluar']);

    $this->actingAs($this->user)
        ->get(route('master.jenis-arsip.index', ['search' => 'JNS-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('jenisArsips.data', 1)
        );
});
