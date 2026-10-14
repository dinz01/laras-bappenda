<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\JenisArsip;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\SifatArsip;
use App\Models\TingkatAksesArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create an archive using factory', function () {
    $arsip = Arsip::factory()->create();

    expect($arsip)->toBeInstanceOf(Arsip::class)
        ->and($arsip->nomor_arsip)->toStartWith('ARS-')
        ->and($arsip->judul)->toBeString()
        ->and($arsip->tanggal_arsip)->toBeInstanceOf(CarbonInterface::class);
});

it('has correct eloquent relationships', function () {
    $arsip = Arsip::factory()->create();

    expect($arsip->klasifikasiArsip)->toBeInstanceOf(KlasifikasiArsip::class)
        ->and($arsip->lokasiArsip)->toBeInstanceOf(LokasiArsip::class)
        ->and($arsip->jenisArsip)->toBeInstanceOf(JenisArsip::class)
        ->and($arsip->sifatArsip)->toBeInstanceOf(SifatArsip::class)
        ->and($arsip->tingkatPerkembanganArsip)->toBeInstanceOf(TingkatPerkembanganArsip::class)
        ->and($arsip->kondisiArsip)->toBeInstanceOf(KondisiArsip::class)
        ->and($arsip->tingkatAksesArsip)->toBeInstanceOf(TingkatAksesArsip::class)
        ->and($arsip->unitOrganisasi)->toBeInstanceOf(UnitOrganisasi::class)
        ->and($arsip->creator)->toBeInstanceOf(User::class);
});

it('can filter active archives using active scope', function () {
    $aktifArsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Active]);
    Arsip::factory()->create(['workflow_status' => WorkflowStatus::Review]);

    $activeArchives = Arsip::active()->get();

    expect($activeArchives)->toHaveCount(1)
        ->and($activeArchives->first()->id)->toBe($aktifArsip->id);
});

it('supports soft deletion', function () {
    $arsip = Arsip::factory()->create();

    $arsip->delete();

    expect(Arsip::withTrashed()->find($arsip->id)->trashed())->toBeTrue();
});
