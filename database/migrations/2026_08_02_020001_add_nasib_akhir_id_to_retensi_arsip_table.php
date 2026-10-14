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
            $table->foreignId('nasib_akhir_id')
                ->nullable()
                ->after('retensi_inaktif')
                ->constrained('nasib_akhir')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retensi_arsip', function (Blueprint $table): void {
            $table->dropForeign(['nasib_akhir_id']);
            $table->dropColumn('nasib_akhir_id');
        });
    }
};
