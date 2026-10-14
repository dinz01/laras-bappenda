<?php

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\JenisArsip;
use App\Models\KategoriArsip;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\SifatArsip;
use App\Models\TingkatAksesArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    $this->user = User::factory()->create();
    $this->user->givePermissionTo([
        'repositori-arsip.view',
        'dokumen-arsip.download',
        'kelola-arsip.view',
        'kelola-arsip.create',
        'kelola-arsip.update',
        'kelola-arsip.delete',
    ]);
});

it('renders archive list for authenticated users with permission', function () {
    $response = $this->actingAs($this->user)
        ->get(route('arsip.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip/index'));
});

it('validates required fields on store', function () {
    $response = $this->actingAs($this->user)
        ->post(route('arsip.store'), []);

    $response->assertSessionHasErrors([
        'judul',
        'tanggal_arsip',
        'klasifikasi_arsip_id',
        'file',
    ]);

    $response->assertSessionDoesntHaveErrors(['nomor_arsip']);
});

it('allows storing an archive with file upload and auto-generates nomor_arsip', function () {
    Storage::fake('local');
    $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');
    $klasifikasi = KlasifikasiArsip::factory()->create();
    $lokasi = LokasiArsip::factory()->create();
    $jenis = JenisArsip::factory()->create();
    $sifat = SifatArsip::factory()->create();
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create();
    $kondisi = KondisiArsip::factory()->create();
    $tingkatAkses = TingkatAksesArsip::factory()->create();
    $unit = UnitOrganisasi::factory()->create();

    $data = [
        'judul' => 'Arsip Keuangan Baru',
        'deskripsi' => 'Deskripsi arsip',
        'tanggal_arsip' => '2026-07-11',
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'lokasi_arsip_id' => $lokasi->id,
        'jenis_arsip_id' => $jenis->id,
        'sifat_arsip_id' => $sifat->id,
        'tingkat_perkembangan_arsip_id' => $tingkatPerkembangan->id,
        'kondisi_arsip_id' => $kondisi->id,
        'tingkat_akses_arsip_id' => $tingkatAkses->id,
        'unit_organisasi_id' => $unit->id,
        'file' => $file,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('arsip.store'), $data);

    $response->assertRedirect();

    $arsip = Arsip::where('judul', 'Arsip Keuangan Baru')->first();
    expect($arsip)->not->toBeNull();
    expect($arsip->nomor_arsip)->toMatch('/^ARS-\d{4}-\d{5}$/');
    expect($arsip->created_by)->toBe($this->user->id);

    $this->assertDatabaseHas('dokumen_arsip', [
        'arsip_id' => $arsip->id,
        'nama_original' => 'document.pdf',
    ]);

    $dokumen = DokumenArsip::where('arsip_id', $arsip->id)->first();
    Storage::assertExists($dokumen->path_penyimpanan);
});

it('stores kategori arsip and pajak daerah fields', function () {
    Storage::fake('local');
    $file = UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');
    $klasifikasi = KlasifikasiArsip::factory()->create();
    $kategori = KategoriArsip::factory()->create([
        'kode' => 'KAT-002',
        'nama' => 'Arsip Pelayanan Pajak Daerah',
    ]);
    $lokasi = LokasiArsip::factory()->create();
    $jenis = JenisArsip::factory()->create();
    $sifat = SifatArsip::factory()->create();
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create();
    $kondisi = KondisiArsip::factory()->create();
    $tingkatAkses = TingkatAksesArsip::factory()->create();
    $unit = UnitOrganisasi::factory()->create();

    $response = $this->actingAs($this->user)->post(route('arsip.store'), [
        'judul' => 'Arsip Pajak Test',
        'tanggal_arsip' => '2026-08-01',
        'kategori_arsip_id' => $kategori->id,
        'no_register' => 'REG-001',
        'nop' => '12.34.567.890.0',
        'npwpd' => '01.234.567.8-901.000',
        'nama_wajib_pajak' => 'PT Test Pajak',
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'lokasi_arsip_id' => $lokasi->id,
        'jenis_arsip_id' => $jenis->id,
        'sifat_arsip_id' => $sifat->id,
        'tingkat_perkembangan_arsip_id' => $tingkatPerkembangan->id,
        'kondisi_arsip_id' => $kondisi->id,
        'tingkat_akses_arsip_id' => $tingkatAkses->id,
        'unit_organisasi_id' => $unit->id,
        'file' => $file,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('arsip', [
        'judul' => 'Arsip Pajak Test',
        'kategori_arsip_id' => $kategori->id,
        'no_register' => 'REG-001',
        'nop' => '12.34.567.890.0',
        'npwpd' => '01.234.567.8-901.000',
        'nama_wajib_pajak' => 'PT Test Pajak',
    ]);
});

it('allows viewing archive detail json', function () {
    $createdAt = CarbonImmutable::parse('2026-07-19 21:20:00', config('app.timezone'));
    $arsip = Arsip::factory()->create([
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('arsip.detail-json', $arsip));

    $response->assertOk()
        ->assertJsonStructure(['arsip', 'workflowHistory', 'allowedTransitions']);
});

it('allows updating an archive without changing file', function () {
    $klasifikasi = KlasifikasiArsip::factory()->create();
    $lokasi = LokasiArsip::factory()->create();
    $jenis = JenisArsip::factory()->create();
    $sifat = SifatArsip::factory()->create();
    $tingkatPerkembangan = TingkatPerkembanganArsip::factory()->create();
    $kondisi = KondisiArsip::factory()->create();
    $tingkatAkses = TingkatAksesArsip::factory()->create();
    $unit = UnitOrganisasi::factory()->create();

    $arsip = Arsip::factory()->create(['klasifikasi_arsip_id' => $klasifikasi->id]);

    $data = [
        'nomor_arsip' => $arsip->nomor_arsip,
        'judul' => 'Judul Baru Diperbarui',
        'tanggal_arsip' => $arsip->tanggal_arsip->format('Y-m-d'),
        'klasifikasi_arsip_id' => $klasifikasi->id,
        'lokasi_arsip_id' => $lokasi->id,
        'jenis_arsip_id' => $jenis->id,
        'sifat_arsip_id' => $sifat->id,
        'tingkat_perkembangan_arsip_id' => $tingkatPerkembangan->id,
        'kondisi_arsip_id' => $kondisi->id,
        'tingkat_akses_arsip_id' => $tingkatAkses->id,
        'unit_organisasi_id' => $unit->id,
    ];

    $response = $this->actingAs($this->user)
        ->put(route('arsip.update', $arsip), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('arsip', [
        'id' => $arsip->id,
        'judul' => 'Judul Baru Diperbarui',
    ]);
});
