<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel master 'retensi_arsip' untuk menyimpan aturan retensi jangka waktu penyimpanan arsip aktif & inaktif.
     */
    public function up(): void
    {
        Schema::create('retensi_arsip', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->integer('retensi_aktif')->default(0);
            $table->integer('retensi_inaktif')->default(0);
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
        Schema::dropIfExists('retensi_arsip');
    }
};
