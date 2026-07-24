<?php

use App\Models\Arsip;
use App\Models\MediaArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for media arsip index', function () {
    $this->get(route('master.media-arsip.index'))->assertRedirect(route('login'));
});

it('renders media arsip index with correct props', function () {
    MediaArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.media-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/media-arsip/index')
            ->has('mediaArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new media arsip', function () {
    $this->actingAs($this->user)
        ->post(route('master.media-arsip.store'), [
            'kode' => 'MA-001',
            'nama' => 'Kertas Test',
            'deskripsi' => 'Deskripsi test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('media_arsip', [
        'kode' => 'MA-001',
        'nama' => 'Kertas Test',
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.media-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'status']);
});

it('updates a media arsip', function () {
    $mediaArsip = MediaArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.media-arsip.update', $mediaArsip), [
            'kode' => $mediaArsip->kode,
            'nama' => 'Nama Diperbarui',
            'deskripsi' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('media_arsip', [
        'id' => $mediaArsip->id,
        'nama' => 'Nama Diperbarui',
        'status' => 'inactive',
    ]);
});

it('deletes a media arsip not in use', function () {
    $mediaArsip = MediaArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.media-arsip.destroy', $mediaArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('media_arsip', ['id' => $mediaArsip->id]);
});

it('prevents deleting media arsip in use by arsip', function () {
    $mediaArsip = MediaArsip::factory()->create();
    Arsip::factory()->create(['media_arsip_id' => $mediaArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.media-arsip.destroy', $mediaArsip))
        ->assertSessionHasErrors('media_arsip');

    $this->assertDatabaseHas('media_arsip', ['id' => $mediaArsip->id]);
});

it('searches media arsip by kode', function () {
    MediaArsip::factory()->create(['kode' => 'MA-001', 'nama' => 'Kertas']);
    MediaArsip::factory()->create(['kode' => 'MA-002', 'nama' => 'Digital']);

    $this->actingAs($this->user)
        ->get(route('master.media-arsip.index', ['search' => 'MA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('mediaArsips.data', 1)
        );
});
