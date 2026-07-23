<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel 'arsip' sebagai repositori penyimpanan arsip utama.
     */
    public function up(): void
    {
        Schema::create('arsip', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('nomor_arsip', 100)->unique()->index();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->date('tanggal_arsip');

            // Relasi ke Master References
            $table->foreignId('jenis_arsip_id')
                ->nullable()
                ->constrained('jenis_arsip')
                ->nullOnDelete();

            $table->foreignId('klasifikasi_arsip_id')
                ->constrained('klasifikasi_arsip')
                ->restrictOnDelete();

            $table->foreignId('sifat_arsip_id')
                ->nullable()
                ->constrained('sifat_arsip')
                ->nullOnDelete();

            $table->foreignId('lokasi_arsip_id')
                ->nullable()
                ->constrained('lokasi_arsip')
                ->nullOnDelete();

            $table->foreignId('media_arsip_id')
                ->nullable()
                ->constrained('media_arsip')
                ->nullOnDelete();

            $table->foreignId('kondisi_arsip_id')
                ->nullable()
                ->constrained('kondisi_arsip')
                ->nullOnDelete();

            $table->foreignId('status_arsip_id')
                ->nullable()
                ->constrained('status_arsip')
                ->nullOnDelete();

            $table->foreignId('tingkat_akses_arsip_id')
                ->nullable()
                ->constrained('tingkat_akses_arsip')
                ->nullOnDelete();

            $table->foreignId('tingkat_perkembangan_arsip_id')
                ->nullable()
                ->constrained('tingkat_perkembangan_arsip')
                ->nullOnDelete();

            $table->foreignId('retensi_arsip_id')
                ->nullable()
                ->constrained('retensi_arsip')
                ->nullOnDelete();

            $table->foreignId('unit_organisasi_id')
                ->nullable()
                ->constrained('unit_organisasi')
                ->nullOnDelete();

            // Relasi ke Pencipta Arsip (User)
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->softDeletes(); // Mendukung pemulihan data (SOP/konvensi)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('arsip');
    }
};
