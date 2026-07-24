<?php

use App\Models\Arsip;
use App\Models\StatusArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for status arsip index', function () {
    $this->get(route('master.status-arsip.index'))->assertRedirect(route('login'));
});

it('renders status arsip index with correct props', function () {
    StatusArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.status-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/status-arsip/index')
            ->has('statusArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new status arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.status-arsip.store'), [
            'kode' => 'ST-001',
            'nama' => 'Aktif Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('status_arsip', [
        'kode' => 'ST-001',
        'nama' => 'Aktif Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.status-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a status arsip', function () {
    $statusArsip = StatusArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.status-arsip.update', $statusArsip), [
            'kode' => $statusArsip->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('status_arsip', [
        'id' => $statusArsip->id,
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a status arsip not in use', function () {
    $statusArsip = StatusArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.status-arsip.destroy', $statusArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('status_arsip', ['id' => $statusArsip->id]);
});

it('prevents deleting status arsip in use by arsip', function () {
    $statusArsip = StatusArsip::factory()->create();
    Arsip::factory()->create(['status_arsip_id' => $statusArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.status-arsip.destroy', $statusArsip))
        ->assertSessionHasErrors('status_arsip');

    $this->assertDatabaseHas('status_arsip', ['id' => $statusArsip->id]);
});

it('searches status arsip by kode', function () {
    StatusArsip::factory()->create(['kode' => 'ST-001', 'nama' => 'Pertama']);
    StatusArsip::factory()->create(['kode' => 'ST-002', 'nama' => 'Kedua']);

    $this->actingAs($this->user)
        ->get(route('master.status-arsip.index', ['search' => 'ST-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('statusArsips.data', 1)
        );
});
