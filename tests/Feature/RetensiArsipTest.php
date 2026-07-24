<?php

use App\Models\KlasifikasiArsip;
use App\Models\MetodePenyusutanArsip;
use App\Models\RetensiArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login for retensi arsip index', function () {
    $this->get(route('master.retensi-arsip.index'))->assertRedirect(route('login'));
});

it('renders retensi arsip index with correct props', function () {
    RetensiArsip::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('master.retensi-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/retensi-arsip/index')
            ->has('retensiArsips')
            ->has('metodePenyusutanArsips')
            ->has('stats')
            ->has('filters')
        );
});

it('stores a new retensi arsip', function () {
    $metode = MetodePenyusutanArsip::factory()->create();

    $this->actingAs($this->user)
        ->post(route('master.retensi-arsip.store'), [
            'kode' => 'JRA-001',
            'nama' => 'Retensi Test',
            'retensi_aktif' => 5,
            'retensi_inaktif' => 10,
            'nasib_akhir' => 'Musnah',
            'metode_penyusutan_arsip_id' => $metode->id,
            'keterangan' => 'Keterangan test',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('retensi_arsip', [
        'kode' => 'JRA-001',
        'nama' => 'Retensi Test',
        'nasib_akhir' => 'Musnah',
        'metode_penyusutan_arsip_id' => $metode->id,
    ]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->user)
        ->post(route('master.retensi-arsip.store'), [])
        ->assertSessionHasErrors(['kode', 'nama', 'retensi_aktif', 'retensi_inaktif', 'status']);
});

it('updates a retensi arsip', function () {
    $retensiArsip = RetensiArsip::factory()->create();
    $metode = MetodePenyusutanArsip::factory()->create();

    $this->actingAs($this->user)
        ->put(route('master.retensi-arsip.update', $retensiArsip), [
            'kode' => $retensiArsip->kode,
            'nama' => 'Nama Diperbarui',
            'retensi_aktif' => 3,
            'retensi_inaktif' => 7,
            'nasib_akhir' => 'Permanen',
            'metode_penyusutan_arsip_id' => $metode->id,
            'keterangan' => null,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('retensi_arsip', [
        'id' => $retensiArsip->id,
        'nama' => 'Nama Diperbarui',
        'nasib_akhir' => 'Permanen',
        'metode_penyusutan_arsip_id' => $metode->id,
        'status' => 'inactive',
    ]);
});

it('deletes a retensi arsip not in use', function () {
    $retensiArsip = RetensiArsip::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('master.retensi-arsip.destroy', $retensiArsip))
        ->assertRedirect();

    $this->assertDatabaseMissing('retensi_arsip', ['id' => $retensiArsip->id]);
});

it('prevents deleting retensi arsip in use by klasifikasi arsip', function () {
    $retensiArsip = RetensiArsip::factory()->create();
    KlasifikasiArsip::factory()->create(['retensi_arsip_id' => $retensiArsip->id]);

    $this->actingAs($this->user)
        ->delete(route('master.retensi-arsip.destroy', $retensiArsip))
        ->assertSessionHasErrors('retensi_arsip');

    $this->assertDatabaseHas('retensi_arsip', ['id' => $retensiArsip->id]);
});

it('searches retensi arsip by kode', function () {
    RetensiArsip::factory()->create(['kode' => 'JRA-001', 'nama' => 'Pertama']);
    RetensiArsip::factory()->create(['kode' => 'JRB-002', 'nama' => 'Kedua']);

    $this->actingAs($this->user)
        ->get(route('master.retensi-arsip.index', ['search' => 'JRA-001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('retensiArsips.data', 1)
        );
});
