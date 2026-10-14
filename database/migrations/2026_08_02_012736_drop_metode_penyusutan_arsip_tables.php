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
        Schema::table('retensi_arsip', function (Blueprint $table): void {
            $table->dropForeign(['metode_penyusutan_arsip_id']);
            $table->dropColumn('metode_penyusutan_arsip_id');
        });

        Schema::dropIfExists('metode_penyusutan_arsip');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('metode_penyusutan_arsip', function (Blueprint $table): void {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->string('keterangan')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::table('retensi_arsip', function (Blueprint $table): void {
            $table->foreignId('metode_penyusutan_arsip_id')
                ->nullable()
                ->constrained('metode_penyusutan_arsip')
                ->nullOnDelete();
        });
    }
};
