<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    $this->user = User::factory()->create();
    $this->user->givePermissionTo([
        'kelola-tte.view',
        'kelola-tte.sign',
    ]);
});

it('renders kelola tte page without errors', function () {
    $unit = UnitOrganisasi::factory()->create();
    $klasifikasi = KlasifikasiArsip::factory()->create();

    Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::WaitingTte,
        'unit_organisasi_id' => $unit->id,
        'klasifikasi_arsip_id' => $klasifikasi->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('kelola-tte.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('kelola-tte/index')
            ->has('filterKlasifikasis')
            ->has('filterUnitOrganisasis')
        );
});
