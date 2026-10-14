<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('arsip', function (Blueprint $table) {
            $table->dropForeign(['status_arsip_id']);
            $table->dropColumn('status_arsip_id');
        });
    }

    public function down(): void
    {
        Schema::table('arsip', function (Blueprint $table) {
            $table->foreignId('status_arsip_id')
                ->nullable()
                ->after('media_arsip_id')
                ->constrained('status_arsip')
                ->restrictOnDelete();
        });
    }
};
