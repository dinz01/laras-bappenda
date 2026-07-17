<?php

use App\Models\Arsip;
use App\Models\StatusArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('can search archives by nomor_arsip via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-NOMOR-123',
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-NOMOR-456',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => '123']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can search archives by judul via controller', function () {
    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'judul' => 'Judul Laporan Keuangan',
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'judul' => 'Surat Edaran Dinas',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => 'Keuangan']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can filter archives by status via controller', function () {
    $status1 = StatusArsip::factory()->create();
    $status2 = StatusArsip::factory()->create();

    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'status_arsip_id' => $status1->id,
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'status_arsip_id' => $status2->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['status_arsip_id' => $status1->id]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('can filter archives by unit organisasi via controller', function () {
    $unit1 = UnitOrganisasi::factory()->create();
    $unit2 = UnitOrganisasi::factory()->create();

    $arsip1 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-1',
        'unit_organisasi_id' => $unit1->id,
    ]);
    $arsip2 = Arsip::factory()->create([
        'nomor_arsip' => 'ARS-2',
        'unit_organisasi_id' => $unit2->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['unit_organisasi_id' => $unit1->id]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            ->where('arsips.data.0.id', $arsip1->id)
            ->has('arsips.data', 1)
        );
});

it('maintains pagination and keeps filters in query string', function () {
    // Create 15 archives under unit1
    $unit = UnitOrganisasi::factory()->create();
    $archives = Arsip::factory()->count(15)->create([
        'unit_organisasi_id' => $unit->id,
    ]);

    // Request first page with filter
    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', [
            'unit_organisasi_id' => $unit->id,
            'page' => 2,
        ]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/index')
            // Page 2 should have 5 items (since total is 15, page 1 has 10)
            ->has('arsips.data', 5)
            ->where('arsips.current_page', 2)
        );
});
