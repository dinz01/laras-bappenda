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
        Schema::table('dokumen_arsip', function (Blueprint $table) {
            $table->string('ocr_status', 20)->default('pending')->after('uploaded_by');
            $table->longText('ocr_text')->nullable()->after('ocr_status');
            $table->decimal('ocr_confidence', 5, 2)->nullable()->after('ocr_text');
            $table->string('ocr_language', 10)->nullable()->after('ocr_confidence');
            $table->unsignedSmallInteger('ocr_pages')->nullable()->after('ocr_language');
            $table->timestamp('ocr_processed_at')->nullable()->after('ocr_pages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokumen_arsip', function (Blueprint $table) {
            $table->dropColumn([
                'ocr_status',
                'ocr_text',
                'ocr_confidence',
                'ocr_language',
                'ocr_pages',
                'ocr_processed_at',
            ]);
        });
    }
};
