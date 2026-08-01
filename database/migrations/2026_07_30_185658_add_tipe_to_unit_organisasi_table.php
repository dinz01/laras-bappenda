<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unit_organisasi', function (Blueprint $table) {
            $table->enum('tipe', ['bidang', 'sub_bidang', 'upt'])
                ->after('singkatan')
                ->nullable();
        });

        // Backfill data yang sudah ada berdasarkan struktur parent_id saat ini
        DB::table('unit_organisasi')
            ->whereNull('parent_id')
            ->whereIn('id', function ($query) {
                $query->select('parent_id')
                    ->from('unit_organisasi')
                    ->whereNotNull('parent_id')
                    ->distinct();
            })
            ->update(['tipe' => 'bidang']);

        DB::table('unit_organisasi')
            ->whereNotNull('parent_id')
            ->update(['tipe' => 'sub_bidang']);

        DB::table('unit_organisasi')
            ->whereNull('parent_id')
            ->whereNull('tipe')
            ->update(['tipe' => 'upt']);

        Schema::table('unit_organisasi', function (Blueprint $table) {
            $table->enum('tipe', ['bidang', 'sub_bidang', 'upt'])
                ->nullable(false)
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('unit_organisasi', function (Blueprint $table) {
            $table->dropColumn('tipe');
        });
    }
};