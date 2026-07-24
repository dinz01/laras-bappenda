<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel master 'jabatan' untuk menyimpan data jabatan pegawai.
     */
    public function up(): void
    {
        Schema::create('jabatan', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->string('singkatan', 50)->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('unit_organisasi_id')
                ->nullable()
                ->after('nama_lengkap')
                ->constrained('unit_organisasi')
                ->nullOnDelete();

            $table->foreignId('jabatan_id')
                ->nullable()
                ->after('unit_organisasi_id')
                ->constrained('jabatan')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['jabatan_id']);
            $table->dropForeign(['unit_organisasi_id']);
            $table->dropColumn(['jabatan_id', 'unit_organisasi_id']);
        });

        Schema::dropIfExists('jabatan');
    }
};
