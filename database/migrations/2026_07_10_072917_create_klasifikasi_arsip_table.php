<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel master 'klasifikasi_arsip' untuk menyimpan kode klasifikasi arsip.
     */
    public function up(): void
    {
        Schema::create('klasifikasi_arsip', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->unsignedSmallInteger('retensi_aktif')->default(0);
            $table->unsignedSmallInteger('retensi_inaktif')->default(0);
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('klasifikasi_arsip');
    }
};
