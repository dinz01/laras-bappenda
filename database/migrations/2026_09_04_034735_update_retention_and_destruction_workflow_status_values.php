<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('arsip')
            ->where('workflow_status', 'destruction')
            ->update(['workflow_status' => 'musnah']);

        DB::table('arsip')
            ->where('workflow_status', 'retention')
            ->update(['workflow_status' => 'permanen']);

        DB::table('arsip_workflow_histories')
            ->where('status_lama', 'destruction')
            ->update(['status_lama' => 'musnah']);

        DB::table('arsip_workflow_histories')
            ->where('status_lama', 'retention')
            ->update(['status_lama' => 'permanen']);

        DB::table('arsip_workflow_histories')
            ->where('status_baru', 'destruction')
            ->update(['status_baru' => 'musnah']);

        DB::table('arsip_workflow_histories')
            ->where('status_baru', 'retention')
            ->update(['status_baru' => 'permanen']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('arsip')
            ->where('workflow_status', 'musnah')
            ->update(['workflow_status' => 'destruction']);

        DB::table('arsip')
            ->where('workflow_status', 'permanen')
            ->update(['workflow_status' => 'retention']);

        DB::table('arsip_workflow_histories')
            ->where('status_lama', 'musnah')
            ->update(['status_lama' => 'destruction']);

        DB::table('arsip_workflow_histories')
            ->where('status_lama', 'permanen')
            ->update(['status_lama' => 'retention']);

        DB::table('arsip_workflow_histories')
            ->where('status_baru', 'musnah')
            ->update(['status_baru' => 'destruction']);

        DB::table('arsip_workflow_histories')
            ->where('status_baru', 'permanen')
            ->update(['status_baru' => 'retention']);
    }
};
