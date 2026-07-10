<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel master 'lokasi_arsip' untuk menyimpan data lokasi penyimpanan arsip fisik.
     */
    public function up(): void
    {
        Schema::create('lokasi_arsip', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->string('gedung', 100)->nullable();
            $table->string('lantai', 50)->nullable();
            $table->string('ruangan', 100)->nullable();
            $table->string('rak', 50)->nullable();
            $table->string('box', 50)->nullable();
            $table->text('keterangan')->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lokasi_arsip');
    }
};
