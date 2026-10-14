<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Pemetaan status lama ke status baru.
     *
     * @var array<string, string>
     */
    private array $map = [
        'draft' => 'review',
        'approved' => 'waiting_tte',
        'retention' => 'inactive',
        'record_center' => 'inactive',
        'destruction' => 'inactive',
    ];

    public function up(): void
    {
        foreach ($this->map as $old => $new) {
            DB::table('arsip')
                ->where('workflow_status', $old)
                ->update(['workflow_status' => $new]);

            DB::table('arsip_workflow_histories')
                ->where('status_lama', $old)
                ->update(['status_lama' => $new]);

            DB::table('arsip_workflow_histories')
                ->where('status_baru', $old)
                ->update(['status_baru' => $new]);
        }
    }

    public function down(): void
    {
        // Tidak dapat dikembalikan dengan aman karena data lama tertimpa.
    }
};
