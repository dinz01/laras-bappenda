<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\NasibAkhir;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

it('redirects guest to login from arsip inaktif page', function () {
    $this->get(route('arsip-inaktif.index'))
        ->assertRedirect(route('login'));
});

it('allows super admin to see inactive archives across units in arsip inaktif', function () {
    $admin = superAdmin();

    $unitA = UnitOrganisasi::factory()->create();
    $unitB = UnitOrganisasi::factory()->create();
    $nasibPermanen = NasibAkhir::factory()->create(['nama' => 'Permanen']);
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'retensi_aktif' => 1,
        'retensi_inaktif' => 2,
        'nasib_akhir_id' => $nasibPermanen->id,
    ]);

    Arsip::factory()->create([
        'unit_organisasi_id' => $unitA->id,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subMonths(18), // aktif 1 thn lewat, inaktif belum lewat -> Inactive
        'workflow_status' => WorkflowStatus::Inactive,
        'judul' => 'Arsip Inaktif Unit A',
    ]);
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitB->id,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subYears(4), // inaktif lewat -> Musnah
        'workflow_status' => WorkflowStatus::Musnah,
        'judul' => 'Arsip Musnah Unit B',
    ]);
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitA->id,
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subMonths(2), // aktif belum lewat -> Active
        'workflow_status' => WorkflowStatus::Active,
        'judul' => 'Arsip Aktif Unit A',
    ]);

    $this->actingAs($admin)
        ->get(route('arsip-inaktif.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pengelolaan/arsip-inaktif/index')
            ->has('arsips.data', 1)
        );
});

it('restricts operator to only see inactive archives from their own unit', function () {
    $unitA = UnitOrganisasi::factory()->create();
    $unitB = UnitOrganisasi::factory()->create();

    $operator = User::factory()->create(['unit_organisasi_id' => $unitA->id]);
    $operator->assignRole('Operator Unit');

    // Arsip di unit milik operator
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitA->id,
        'workflow_status' => WorkflowStatus::Inactive,
        'judul' => 'Arsip Inaktif Unit Saya',
    ]);

    // Arsip di unit lain
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitB->id,
        'workflow_status' => WorkflowStatus::Inactive,
        'judul' => 'Arsip Inaktif Unit Lain',
    ]);

    $this->actingAs($operator)
        ->get(route('arsip-inaktif.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pengelolaan/arsip-inaktif/index')
            ->has('arsips.data', 1)
        );
});

it('automatically transitions active archive to inactive or nasib akhir when retention periods elapse', function () {
    $admin = superAdmin();

    $permanen = NasibAkhir::factory()->create(['nama' => 'Permanen']);
    $klasifikasi = KlasifikasiArsip::factory()->create([
        'retensi_aktif' => 1,
        'retensi_inaktif' => 1,
        'nasib_akhir_id' => $permanen->id,
    ]);

    // Arsip dibuat 3 tahun lalu (melewati aktif 1 thn + inaktif 1 thn)
    $arsip = Arsip::factory()->create([
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'tanggal_arsip' => now()->subYears(3),
        'workflow_status' => WorkflowStatus::Active,
    ]);

    // Buka arsip inaktif -> otomatis tersinkron ke Permanen karena nasib akhir Permanen
    $this->actingAs($admin)->get(route('arsip-inaktif.index'));
    expect($arsip->fresh()->workflow_status)->toBe(WorkflowStatus::Permanen);

    // Sekarang ubah master data nasib akhir menjadi Musnah
    $musnah = NasibAkhir::factory()->create(['nama' => 'Musnah']);
    $klasifikasi->update(['nasib_akhir_id' => $musnah->id]);

    // Buka arsip inaktif lagi -> otomatis tersinkron ulang menjadi Musnah (pindah ke Nasib Akhir Arsip)
    $this->actingAs($admin)->get(route('arsip-inaktif.index'));
    expect($arsip->fresh()->workflow_status)->toBe(WorkflowStatus::Musnah);
});
