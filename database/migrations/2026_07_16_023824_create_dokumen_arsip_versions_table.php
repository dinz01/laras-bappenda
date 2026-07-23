<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dokumen_arsip_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokumen_arsip_id')
                ->constrained('dokumen_arsip')
                ->cascadeOnDelete();
            $table->integer('versi');
            $table->string('nama_file');
            $table->string('path_file');
            $table->unsignedBigInteger('ukuran_file');
            $table->string('mime_type');
            $table->string('hash_file');
            $table->text('catatan_perubahan')->nullable();
            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen_arsip_versions');
    }
};
