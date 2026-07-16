<?php

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\User;
use App\Services\DocumentVersionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new DocumentVersionService;
    $this->user = User::factory()->create();
    $this->arsip = Arsip::factory()->create();
    $this->dokumen = DokumenArsip::factory()->create([
        'arsip_id' => $this->arsip->id,
    ]);
});

it('can create a version and compute sha256 hash', function () {
    Storage::fake('local');
    $path = 'archives/test.txt';
    Storage::put($path, 'hello world version');

    $version = $this->service->createVersion(
        $this->dokumen,
        'test.txt',
        $path,
        19,
        'text/plain',
        $this->user->id
    );

    expect($version->versi)->toBe(1)
        ->and($version->nama_file)->toBe('test.txt')
        ->and($version->path_file)->toBe($path)
        ->and($version->hash_file)->toBe(hash('sha256', 'hello world version'))
        ->and($version->uploaded_by)->toBe($this->user->id);
});

it('can get latest version', function () {
    Storage::fake('local');

    $v1 = $this->service->createVersion($this->dokumen, 'v1.txt', 'v1.txt', 10, 'text/plain');
    $v2 = $this->service->createVersion($this->dokumen, 'v2.txt', 'v2.txt', 12, 'text/plain');

    $latest = $this->service->latestVersion($this->dokumen);

    expect($latest)->not->toBeNull()
        ->and($latest->id)->toBe($v2->id)
        ->and($latest->versi)->toBe(2);
});

it('can list versions in descending order of version number', function () {
    Storage::fake('local');

    $v1 = $this->service->createVersion($this->dokumen, 'v1.txt', 'v1.txt', 10, 'text/plain');
    $v2 = $this->service->createVersion($this->dokumen, 'v2.txt', 'v2.txt', 12, 'text/plain');

    $list = $this->service->listVersions($this->dokumen);

    expect($list)->toHaveCount(2)
        ->and($list->first()->id)->toBe($v2->id)
        ->and($list->last()->id)->toBe($v1->id);
});
