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
        Schema::create('dokumen_arsip', function (Blueprint $table) {
            $table->id();
            $table->foreignId('arsip_id')
                ->unique()
                ->constrained('arsip')
                ->cascadeOnDelete();
            $table->string('nama_original');
            $table->string('nama_generated');
            $table->unsignedBigInteger('ukuran'); // file size in bytes
            $table->string('mime_type');
            $table->string('path_penyimpanan');
            $table->timestamp('uploaded_at')->nullable();
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
        Schema::dropIfExists('dokumen_arsip');
    }
};
