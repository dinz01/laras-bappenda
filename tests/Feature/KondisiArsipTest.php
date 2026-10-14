<?php

use App\Models\KondisiArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for kondisi arsip index', function () {
    $this->get(route('master.kondisi-arsip.index'))->assertRedirect(route('login'));
});

it('renders kondisi arsip index with correct props', function () {
    KondisiArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.kondisi-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/kondisi-arsip/index')
            ->has('kondisiArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new kondisi arsip with auto-generated kode', function () {
    $this->actingAs($this->user)
        ->post(route('master.kondisi-arsip.store'), [
            'nama' => 'Hancur Sebagian',
            'deskripsi' => 'Fisik hancur terkena air/banjir',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kondisi_arsip', [
        'kode' => 'KND-001',
        'nama' => 'Hancur Sebagian',
    ]);
});

it('increments sequential auto-generated kode for kondisi arsip', function () {
    KondisiArsip::factory()->create(['kode' => 'KND-001']);

    $this->actingAs($this->user)
        ->post(route('master.kondisi-arsip.store'), [
            'nama' => 'Termakan Rayap',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kondisi_arsip', [
        'kode' => 'KND-002',
        'nama' => 'Termakan Rayap',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.kondisi-arsip.store'), [])
        ->assertSessionHasErrors(['nama', 'status']);
});

it('updates a kondisi arsip without changing kode', function () {
    $kondisiArsip = KondisiArsip::factory()->create(['kode' => 'KND-001', 'nama' => 'Nama Awal']);

    $this->actingAs($this->user)
        ->put(route('master.kondisi-arsip.update', $kondisiArsip), [
            'nama' => 'Nama Diperbarui',
            'deskripsi' => 'Deskripsi baru',
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kondisi_arsip', [
        'id' => $kondisiArsip->id,
        'kode' => 'KND-001',
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a kondisi arsip not in use', function () {
    $kondisiArsip = KondisiArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.kondisi-arsip.destroy', $kondisiArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('kondisi_arsip', ['id' => $kondisiArsip->id]);
});

it('searches kondisi arsip by kode', function () {
    KondisiArsip::factory()->create(['kode' => 'KND-001', 'nama' => 'Baik']);
    KondisiArsip::factory()->create(['kode' => 'KND-002', 'nama' => 'Rusak Berat']);

    $this->actingAs($this->user)
        ->get(route('master.kondisi-arsip.index', ['search' => 'KND-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('kondisiArsips.data', 1)
        );
});
