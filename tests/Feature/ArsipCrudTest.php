<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\KlasifikasiArsip;
use App\Models\User;
use Carbon\CarbonImmutable;
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
    expect($arsip)->not->toBeNull();

    $this->assertDatabaseHas('dokumen_arsip', [
        'arsip_id' => $arsip->id,
        'nama_original' => 'document.pdf',
    ]);

    $dokumen = DokumenArsip::where('arsip_id', $arsip->id)->first();
    Storage::assertExists($dokumen->path_penyimpanan);
});

it('allows storing an archive without file', function () {
    $klasifikasi = KlasifikasiArsip::factory()->create();

    $data = [
        'nomor_arsip' => 'ARS/2026/00200',
        'judul' => 'Arsip Tanpa File',
        'tanggal_arsip' => '2026-07-11',
        'klasifikasi_arsip_id' => $klasifikasi->id,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('arsip.store'), $data);

    $response->assertRedirect(route('arsip.index'));
    $this->assertDatabaseHas('arsip', ['nomor_arsip' => 'ARS/2026/00200']);
    $this->assertDatabaseCount('dokumen_arsip', 0);
});

it('allows viewing archive details', function () {
    $createdAt = CarbonImmutable::parse('2026-07-19 21:20:00', config('app.timezone'));
    $arsip = Arsip::factory()->create([
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);
    $dokumen = DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'uploaded_at' => $createdAt,
        'ocr_processed_at' => $createdAt,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);
    DokumenArsipVersion::factory()->create([
        'dokumen_arsip_id' => $dokumen->id,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);
    $history = ArsipWorkflowHistory::create([
        'arsip_id' => $arsip->id,
        'status_lama' => WorkflowStatus::Draft->value,
        'status_baru' => WorkflowStatus::Review->value,
        'user_id' => $this->user->id,
    ]);
    $history->forceFill([
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ])->save();

    $response = $this->actingAs($this->user)
        ->get(route('arsip.show', $arsip));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip/show')
            ->where('arsip.created_at', '19 Jul 2026 21:20 WIB')
            ->where('arsip.updated_at', '19 Jul 2026 21:20 WIB')
            ->where('arsip.dokumen.uploaded_at', '19 Jul 2026 21:20 WIB')
            ->where('arsip.dokumen.ocr_processed_at', '19 Jul 2026 21:20 WIB')
            ->where('arsip.dokumen.versions.0.created_at', '19 Jul 2026 21:20 WIB')
            ->where('workflowHistory.0.created_at', '19 Jul 2026 21:20 WIB')
        );
});

it('allows viewing edit form', function () {
    $arsip = Arsip::factory()->create();

    $response = $this->actingAs($this->user)
        ->get(route('arsip.edit', $arsip));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip/edit')->has('arsip'));
});

it('allows updating an archive without changing file', function () {
    $klasifikasi = KlasifikasiArsip::factory()->create();
    $arsip = Arsip::factory()->create(['klasifikasi_arsip_id' => $klasifikasi->id]);

    $data = [
        'nomor_arsip' => $arsip->nomor_arsip,
        'judul' => 'Judul Baru Diperbarui',
        'tanggal_arsip' => $arsip->tanggal_arsip->format('Y-m-d'),
        'klasifikasi_arsip_id' => $klasifikasi->id,
    ];

    $response = $this->actingAs($this->user)
        ->put(route('arsip.update', $arsip), $data);

    $response->assertRedirect(route('arsip.show', $arsip));
    $this->assertDatabaseHas('arsip', [
        'id' => $arsip->id,
        'judul' => 'Judul Baru Diperbarui',
    ]);
});

it('allows replacing document via update', function () {
    Storage::fake('local');
    $klasifikasi = KlasifikasiArsip::factory()->create();
    $arsip = Arsip::factory()->create(['klasifikasi_arsip_id' => $klasifikasi->id]);

    $oldPath = 'arsip/old-file.pdf';
    Storage::put($oldPath, 'old content');

    DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'path_penyimpanan' => $oldPath,
    ]);

    $newFile = UploadedFile::fake()->create('new.pdf', 800, 'application/pdf');

    $data = [
        'nomor_arsip' => $arsip->nomor_arsip,
        'judul' => $arsip->judul,
        'tanggal_arsip' => $arsip->tanggal_arsip->format('Y-m-d'),
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'file' => $newFile,
    ];

    $response = $this->actingAs($this->user)
        ->put(route('arsip.update', $arsip), $data);

    $response->assertRedirect(route('arsip.show', $arsip));

    Storage::assertExists($oldPath);

    $dokumen = DokumenArsip::where('arsip_id', $arsip->id)->first();
    expect($dokumen->nama_original)->toBe('new.pdf');
    Storage::assertExists($dokumen->path_penyimpanan);
});

it('allows deleting a document file', function () {
    Storage::fake('local');
    $arsip = Arsip::factory()->create();

    $path = 'arsip/test-file.pdf';
    Storage::put($path, 'content');

    DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'path_penyimpanan' => $path,
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('arsip.delete-file', $arsip));

    $response->assertRedirect();
    $this->assertDatabaseCount('dokumen_arsip', 0);
    Storage::assertMissing($path);
});

it('allows replacing document via replace route', function () {
    Storage::fake('local');
    $arsip = Arsip::factory()->create();

    $oldPath = 'arsip/replaced.pdf';
    Storage::put($oldPath, 'old');

    DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'path_penyimpanan' => $oldPath,
    ]);

    $newFile = UploadedFile::fake()->create('replaced.pdf', 600, 'application/pdf');

    $response = $this->actingAs($this->user)
        ->post(route('arsip.replace-file', $arsip), ['file' => $newFile]);

    $response->assertRedirect();
    Storage::assertExists($oldPath);

    $dokumen = DokumenArsip::where('arsip_id', $arsip->id)->first();
    Storage::assertExists($dokumen->path_penyimpanan);
});

it('allows downloading a document file', function () {
    Storage::fake('local');
    $arsip = Arsip::factory()->create();

    $path = 'arsip/download-test.pdf';
    Storage::put($path, '%PDF-1.4 test content');

    DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'path_penyimpanan' => $path,
        'nama_original' => 'download-test.pdf',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.download', $arsip));

    $response->assertOk();
    $response->assertHeader('Content-Disposition');
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
