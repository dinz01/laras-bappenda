<?php

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = superAdmin();
});

it('redirects guest to login for jabatan index', function () {
    $this->get(route('master.jabatan.index'))->assertRedirect(route('login'));
});

it('renders jabatan index with correct props', function () {
    Jabatan::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.jabatan.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/jabatan/index')
            ->has('jabatans')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new jabatan with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.jabatan.store'), [
            'nama' => 'Kepala Badan Test',
            'singkatan' => 'KABAN',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('jabatan', [
        'kode' => 'JAB-001',
        'nama' => 'Kepala Badan Test',
        'singkatan' => 'KABAN',
    ]);
});

it('increments sequential auto-generated kode for jabatan', function () {
    Jabatan::factory()->create(['kode' => 'JAB-001']);

    $this->actingAs($this->user)
        ->post(route('master.jabatan.store'), [
            'nama' => 'Sekretaris Badan',
            'singkatan' => 'SEKBAN',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('jabatan', [
        'kode' => 'JAB-002',
        'nama' => 'Sekretaris Badan',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.jabatan.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a jabatan without changing kode', function () {
    $jabatan = Jabatan::factory()->create(['kode' => 'JAB-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.jabatan.update', $jabatan), [
            'nama' => 'Nama Diperbarui',
            'singkatan' => 'RENEW',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('jabatan', [
        'id' => $jabatan->id,
        'kode' => 'JAB-001',
        'nama' => 'Nama Diperbarui',
        'singkatan' => 'RENEW',
        'status' => 'inactive',
    ]);
});

it('deletes a jabatan not in use', function () {
    $jabatan = Jabatan::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.jabatan.destroy', $jabatan))
        ->assertRedirect();

    $this->assertDatabaseMissing('jabatan', ['id' => $jabatan->id]);
});

it('prevents deleting jabatan in use by user', function () {
    $jabatan = Jabatan::factory()->create();
    User::factory()->create(['jabatan_id' => $jabatan->id]);

    $this->actingAs($this->user)
        ->delete(route('master.jabatan.destroy', $jabatan))
        ->assertSessionHasErrors('jabatan');

    $this->assertDatabaseHas('jabatan', ['id' => $jabatan->id]);
});

it('searches jabatan by kode', function () {
    Jabatan::factory()->create(['kode' => 'JAB-001', 'nama' => 'Kepala']);
    Jabatan::factory()->create(['kode' => 'JAB-002', 'nama' => 'Sekretaris']);

    $this->actingAs($this->user)
        ->get(route('master.jabatan.index', ['search' => 'JAB-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('jabatans.data', 1)
        );
});
