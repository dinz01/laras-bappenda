<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class DeleteExpiredNotificationsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'notifications:delete-expired';

    /**
     * @var string
     */
    protected $description = 'Hapus notifikasi yang sudah lebih dari 90 hari secara permanen.';

    public function handle(NotificationService $notificationService): void
    {
        $deleted = $notificationService->deleteExpired();

        $this->info("Selesai. Berhasil dihapus: {$deleted} notifikasi kadaluarsa.");
    }
}
