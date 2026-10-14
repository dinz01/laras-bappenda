<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tte_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('arsip_id')
                ->constrained('arsip')
                ->cascadeOnDelete();
            $table->foreignId('dokumen_arsip_version_id')
                ->nullable()
                ->constrained('dokumen_arsip_versions')
                ->nullOnDelete();
            $table->foreignId('signed_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('sandi_pimpinan');
            $table->text('catatan')->nullable();
            $table->string('verification_code')->unique();
            $table->timestamp('signed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tte_signatures');
    }
};
