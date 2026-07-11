<?php

use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guest to login', function () {
    $this->get(route('arsip.index'))->assertRedirect(route('login'));
    $this->get(route('arsip.create'))->assertRedirect(route('login'));
    $this->post(route('arsip.store'), [])->assertRedirect(route('login'));
});

it('allows authenticated user to view archives index', function () {
    Arsip::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->get(route('arsip.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip/index')->has('arsips'));
});

it('allows authenticated user to view create form', function () {
    $response = $this->actingAs($this->user)
        ->get(route('arsip.create'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip/create'));
});

it('validates required fields on store', function () {
    $response = $this->actingAs($this->user)
        ->post(route('arsip.store'), []);

    $response->assertSessionHasErrors([
        'nomor_arsip',
        'judul',
        'tanggal_arsip',
        'klasifikasi_arsip_id',
    ]);
});

it('allows storing an archive with file upload', function () {
    Storage::fake('local');
    $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');
    $klasifikasi = KlasifikasiArsip::factory()->create();

    $data = [
        'nomor_arsip' => 'ARS/2026/00100',
        'judul' => 'Arsip Keuangan Baru',
        'deskripsi' => 'Deskripsi arsip',
        'tanggal_arsip' => '2026-07-11',
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'file' => $file,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('arsip.store'), $data);

    $response->assertRedirect(route('arsip.index'));
    $this->assertDatabaseHas('arsip', [
        'nomor_arsip' => 'ARS/2026/00100',
        'judul' => 'Arsip Keuangan Baru',
        'created_by' => $this->user->id,
    ]);

    $arsip = Arsip::where('nomor_arsip', 'ARS/2026/00100')->first();
    expect($arsip->file_path)->not->toBeNull();
    Storage::assertExists($arsip->file_path);
});

it('allows viewing archive details', function () {
    $arsip = Arsip::factory()->create();

    $response = $this->actingAs($this->user)
        ->get(route('arsip.show', $arsip));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip/show')->has('arsip'));
});

it('allows viewing edit form', function () {
    $arsip = Arsip::factory()->create();

    $response = $this->actingAs($this->user)
        ->get(route('arsip.edit', $arsip));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip/edit')->has('arsip'));
});

it('allows updating an archive and replacing file', function () {
    Storage::fake('local');
    $oldFile = UploadedFile::fake()->create('old.pdf', 500, 'application/pdf');
    $newFile = UploadedFile::fake()->create('new.pdf', 800, 'application/pdf');

    $klasifikasi = KlasifikasiArsip::factory()->create();
    $arsip = Arsip::factory()->create([
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'file_path' => $oldFile->store('arsip'),
    ]);

    $data = [
        'nomor_arsip' => $arsip->nomor_arsip,
        'judul' => 'Judul Baru Diperbarui',
        'tanggal_arsip' => $arsip->tanggal_arsip->format('Y-m-d'),
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'file' => $newFile,
    ];

    $response = $this->actingAs($this->user)
        ->put(route('arsip.update', $arsip), $data);

    $response->assertRedirect(route('arsip.show', $arsip));
    $this->assertDatabaseHas('arsip', [
        'id' => $arsip->id,
        'judul' => 'Judul Baru Diperbarui',
    ]);

    $arsip->refresh();
    Storage::assertMissing('arsip/'.$oldFile->hashName());
    Storage::assertExists($arsip->file_path);
});

it('allows deleting (soft deleting) an archive', function () {
    $arsip = Arsip::factory()->create();

    $response = $this->actingAs($this->user)
        ->delete(route('arsip.destroy', $arsip));

    $response->assertRedirect(route('arsip.index'));
    $this->assertSoftDeleted('arsip', [
        'id' => $arsip->id,
    ]);
});

it('allows filtering and searching archives on index', function () {
    $klasifikasiA = KlasifikasiArsip::factory()->create(['kode' => 'KL-001', 'nama' => 'Klasifikasi A']);
    $klasifikasiB = KlasifikasiArsip::factory()->create(['kode' => 'KL-002', 'nama' => 'Klasifikasi B']);

    $arsip1 = Arsip::factory()->create([
        'judul' => 'Arsip Pertama',
        'nomor_arsip' => 'ARS-001',
        'klasifikasi_arsip_id' => $klasifikasiA->id,
    ]);

    $arsip2 = Arsip::factory()->create([
        'judul' => 'Dokumen Kedua',
        'nomor_arsip' => 'ARS-002',
        'klasifikasi_arsip_id' => $klasifikasiB->id,
    ]);

    // Search by title
    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['search' => 'Pertama']));

    $response->assertOk()
        ->assertInertia(function ($page) use ($arsip1) {
            $data = $page->toArray()['props']['arsips']['data'];
            expect($data)->toHaveCount(1)
                ->and($data[0]['id'])->toBe($arsip1->id);
        });

    // Filter by classification
    $response = $this->actingAs($this->user)
        ->get(route('arsip.index', ['klasifikasi_arsip_id' => $klasifikasiB->id]));

    $response->assertOk()
        ->assertInertia(function ($page) use ($arsip2) {
            $data = $page->toArray()['props']['arsips']['data'];
            expect($data)->toHaveCount(1)
                ->and($data[0]['id'])->toBe($arsip2->id);
        });
});
