<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\RecycleBinService;
use Illuminate\Console\Command;

class DeleteExpiredArchivesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'arsip:delete-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Force delete arsip yang sudah melampaui 24 jam sejak di-soft-delete.';

    public function handle(RecycleBinService $recycleBinService): int
    {
        $this->info('Memeriksa arsip yang kadaluarsa...');

        $result = $recycleBinService->deleteExpired();

        $this->info("Selesai. Berhasil dihapus: {$result['deleted']}, Gagal: {$result['errors']}.");

        return Command::SUCCESS;
    }
}
