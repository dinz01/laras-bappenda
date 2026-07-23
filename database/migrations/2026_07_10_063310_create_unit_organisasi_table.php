<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Membuat tabel master 'unit_organisasi' untuk menyimpan struktur hirarki organisasi.
     */
    public function up(): void
    {
        Schema::create('unit_organisasi', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('kode', 30)->unique()->index();
            $table->string('nama');
            $table->string('singkatan', 50)->nullable();

            // Self-referencing hierarchical relation
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('unit_organisasi')
                ->nullOnDelete();

            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_organisasi');
    }
};
