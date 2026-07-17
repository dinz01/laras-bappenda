<?php

use App\Models\Arsip;
use App\Models\JenisDokumen;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\MediaArsip;
use App\Models\RetensiArsip;
use App\Models\StatusArsip;
use App\Models\TingkatAksesArsip;
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

it('has correct elonquent relationships', function () {
    $arsip = Arsip::factory()->create();

    expect($arsip->klasifikasiArsip)->toBeInstanceOf(KlasifikasiArsip::class)
        ->and($arsip->lokasiArsip)->toBeInstanceOf(LokasiArsip::class)
        ->and($arsip->jenisDokumen)->toBeInstanceOf(JenisDokumen::class)
        ->and($arsip->mediaArsip)->toBeInstanceOf(MediaArsip::class)
        ->and($arsip->kondisiArsip)->toBeInstanceOf(KondisiArsip::class)
        ->and($arsip->statusArsip)->toBeInstanceOf(StatusArsip::class)
        ->and($arsip->tingkatAksesArsip)->toBeInstanceOf(TingkatAksesArsip::class)
        ->and($arsip->retensiArsip)->toBeInstanceOf(RetensiArsip::class)
        ->and($arsip->unitOrganisasi)->toBeInstanceOf(UnitOrganisasi::class)
        ->and($arsip->creator)->toBeInstanceOf(User::class);
});

it('can filter active archives using active scope', function () {
    $statusAktif = StatusArsip::factory()->create(['kode' => 'SA-00001']);
    $statusInaktif = StatusArsip::factory()->create(['kode' => 'SA-00002']);

    $aktifArsip = Arsip::factory()->create(['status_arsip_id' => $statusAktif->id]);
    $inaktifArsip = Arsip::factory()->create(['status_arsip_id' => $statusInaktif->id]);

    $activeArchives = Arsip::active()->get();

    expect($activeArchives)->toHaveCount(1)
        ->and($activeArchives->first()->id)->toBe($aktifArsip->id);
});

it('supports soft deletion', function () {
    $arsip = Arsip::factory()->create();

    $arsip->delete();

    expect(Arsip::count())->toBe(0)
        ->and(Arsip::withTrashed()->count())->toBe(1)
        ->and($arsip->trashed())->toBeTrue();
});
