<?php

use App\Models\Arsip;
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

it('stores a new kondisi arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.kondisi-arsip.store'), [
            'kode' => 'KA-001',
            'nama' => 'Baik Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kondisi_arsip', [
        'kode' => 'KA-001',
        'nama' => 'Baik Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.kondisi-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a kondisi arsip', function () {
    $kondisiArsip = KondisiArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.kondisi-arsip.update', $kondisiArsip), [
            'kode' => $kondisiArsip->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('kondisi_arsip', [
        'id' => $kondisiArsip->id,
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

it('prevents deleting kondisi arsip in use by arsip', function () {
    $kondisiArsip = KondisiArsip::factory()->create();
    Arsip::factory()->create(['kondisi_arsip_id' => $kondisiArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.kondisi-arsip.destroy', $kondisiArsip))
        ->assertSessionHasErrors('kondisi_arsip');

    $this->assertDatabaseHas('kondisi_arsip', ['id' => $kondisiArsip->id]);
});

it('searches kondisi arsip by kode', function () {
    KondisiArsip::factory()->create(['kode' => 'KA-001', 'nama' => 'Baik']);
    KondisiArsip::factory()->create(['kode' => 'KA-002', 'nama' => 'Rusak']);

    $this->actingAs($this->user)
        ->get(route('master.kondisi-arsip.index', ['search' => 'KA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('kondisiArsips.data', 1)
        );
});
