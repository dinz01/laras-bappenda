<?php

use App\Models\LokasiArsip;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan kolom parent_id ke tabel lokasi_arsip untuk mendukung struktur hierarki.
     */
    public function up(): void
    {
        Schema::table('lokasi_arsip', function (Blueprint $table) {
            $table->foreignId('parent_id')
                ->nullable()
                ->after('id')
                ->constrained('lokasi_arsip')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lokasi_arsip', function (Blueprint $table) {
            $table->dropForeignIdFor(LokasiArsip::class, 'parent_id');
            $table->dropColumn('parent_id');
        });
    }
};
