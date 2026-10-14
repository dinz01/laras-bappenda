<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Merge retensi_arsip into klasifikasi_arsip dan tambah hierarki parent-child.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }
        // 1. Tambah kolom baru ke klasifikasi_arsip jika belum ada
        Schema::table('klasifikasi_arsip', function (Blueprint $table) {
            if (! Schema::hasColumn('klasifikasi_arsip', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable()->after('id');
            }
            if (! Schema::hasColumn('klasifikasi_arsip', 'retensi_aktif')) {
                $table->unsignedInteger('retensi_aktif')->nullable()->after('deskripsi');
            }
            if (! Schema::hasColumn('klasifikasi_arsip', 'retensi_inaktif')) {
                $table->unsignedInteger('retensi_inaktif')->nullable()->after('retensi_aktif');
            }
            if (! Schema::hasColumn('klasifikasi_arsip', 'nasib_akhir_id')) {
                $table->foreignId('nasib_akhir_id')
                    ->nullable()
                    ->after('retensi_inaktif')
                    ->constrained('nasib_akhir')
                    ->nullOnDelete();
            }
        });

        // 2. Migrasi data retensi dari retensi_arsip ke klasifikasi_arsip (jika retensi_arsip_id masih ada & retensi_arsip table ada)
        if (Schema::hasTable('retensi_arsip') && Schema::hasColumn('klasifikasi_arsip', 'retensi_arsip_id')) {
            DB::statement('
                UPDATE klasifikasi_arsip
                SET
                    retensi_aktif   = (SELECT ra.retensi_aktif   FROM retensi_arsip ra WHERE ra.id = klasifikasi_arsip.retensi_arsip_id),
                    retensi_inaktif = (SELECT ra.retensi_inaktif FROM retensi_arsip ra WHERE ra.id = klasifikasi_arsip.retensi_arsip_id),
                    nasib_akhir_id  = (SELECT ra.nasib_akhir_id  FROM retensi_arsip ra WHERE ra.id = klasifikasi_arsip.retensi_arsip_id)
                WHERE retensi_arsip_id IS NOT NULL
            ');
        }

        // 3. Drop FK & kolom retensi_arsip_id dari klasifikasi_arsip jika ada
        if (Schema::hasColumn('klasifikasi_arsip', 'retensi_arsip_id')) {
            Schema::table('klasifikasi_arsip', function (Blueprint $table) {
                try {
                    $table->dropForeign(['retensi_arsip_id']);
                } catch (Throwable) {
                }
                $table->dropColumn('retensi_arsip_id');
            });
        }

        // 4. Drop FK & kolom retensi_arsip_id dari arsip jika ada
        if (Schema::hasColumn('arsip', 'retensi_arsip_id')) {
            Schema::table('arsip', function (Blueprint $table) {
                try {
                    $table->dropForeign(['retensi_arsip_id']);
                } catch (Throwable) {
                }
                $table->dropColumn('retensi_arsip_id');
            });
        }

        // 5. Foreign key parent_id
        Schema::table('klasifikasi_arsip', function (Blueprint $table) {
            try {
                $table->foreign('parent_id')
                    ->references('id')
                    ->on('klasifikasi_arsip')
                    ->nullOnDelete();
            } catch (Throwable) {
                // Ignore if foreign key already exists
            }
        });

        // 6. Drop tabel retensi_arsip
        Schema::dropIfExists('retensi_arsip');

        Schema::enableForeignKeyConstraints();
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        }
    }

    public function down(): void
    {
        // Recreate retensi_arsip table
        if (! Schema::hasTable('retensi_arsip')) {
            Schema::create('retensi_arsip', function (Blueprint $table) {
                $table->id();
                $table->string('kode', 50)->unique();
                $table->string('nama');
                $table->unsignedInteger('retensi_aktif')->default(0);
                $table->unsignedInteger('retensi_inaktif')->default(0);
                $table->foreignId('nasib_akhir_id')->nullable()->constrained('nasib_akhir')->nullOnDelete();
                $table->string('nasib_akhir', 50)->nullable();
                $table->text('keterangan')->nullable();
                $table->string('status', 20)->default('active')->index();
                $table->timestamps();
            });
        }
    }
};
