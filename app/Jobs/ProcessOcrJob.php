<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\NotificationType;
use App\Enums\OcrStatus;
use App\Interfaces\OcrServiceInterface;
use App\Models\DokumenArsip;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessOcrJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Tentukan jumlah percobaan jika job gagal.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public DokumenArsip $dokumen
    ) {}

    /**
     * Execute the job.
     */
    public function handle(OcrServiceInterface $ocrService): void
    {
        Log::info('OCR Started', [
            'dokumen_id' => $this->dokumen->id,
            'file_name' => $this->dokumen->nama_original,
        ]);

        // 1. Update status ke processing
        $this->dokumen->update([
            'ocr_status' => OcrStatus::Processing,
        ]);

        try {
            // 2. Lakukan OCR analisis menggunakan service
            $result = $ocrService->analyze($this->dokumen->path_penyimpanan);

            // Capture old values
            $oldValues = $this->dokumen->only(['ocr_status', 'ocr_text', 'ocr_confidence', 'ocr_language', 'ocr_pages', 'ocr_processed_at']);

            // 3. Simpan hasil OCR ke database
            $this->dokumen->update([
                'ocr_status' => OcrStatus::Completed,
                'ocr_text' => $result->text,
                'ocr_confidence' => $result->confidence,
                'ocr_language' => $result->language,
                'ocr_pages' => $result->pages,
                'ocr_processed_at' => now(),
            ]);

            resolve(AuditLogService::class)->log(
                'ocr.completed',
                $this->dokumen,
                $oldValues,
                $this->dokumen->only(['ocr_status', 'ocr_text', 'ocr_confidence', 'ocr_language', 'ocr_pages', 'ocr_processed_at']),
                $this->dokumen->uploader,
                null
            );

            Log::info('OCR Completed', [
                'dokumen_id' => $this->dokumen->id,
                'confidence' => $result->confidence,
                'pages' => $result->pages,
                'processing_time_ms' => $result->processingTimeMs,
            ]);

            if ($this->dokumen->uploader) {
                $arsip = $this->dokumen->arsip;
                resolve(NotificationService::class)->create(
                    $this->dokumen->uploader,
                    NotificationType::OcrSelesai,
                    'OCR Selesai',
                    "Proses OCR untuk dokumen \"{$this->dokumen->nama_original}\" (arsip: {$arsip->nomor_arsip}) telah selesai.",
                    route('arsip.index'),
                );
            }

        } catch (Throwable $e) {
            $this->handleFailure($e);
            // Jangan lempar exception agar job tidak terus bertengger di failed_jobs
            // tapi ditandai gagal secara anggun.
        }
    }

    /**
     * Tangani kegagalan proses OCR.
     */
    protected function handleFailure(Throwable $e): void
    {
        if ($this->dokumen->ocr_status === OcrStatus::Failed) {
            return;
        }

        $oldValues = $this->dokumen->only(['ocr_status']);

        $this->dokumen->update([
            'ocr_status' => OcrStatus::Failed,
        ]);

        resolve(AuditLogService::class)->log(
            'ocr.failed',
            $this->dokumen,
            $oldValues,
            $this->dokumen->only(['ocr_status']),
            $this->dokumen->uploader,
            null
        );

        Log::error('OCR Failed', [
            'dokumen_id' => $this->dokumen->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        if ($this->dokumen->uploader) {
            $arsip = $this->dokumen->arsip;
            resolve(NotificationService::class)->create(
                $this->dokumen->uploader,
                NotificationType::OcrGagal,
                'OCR Gagal',
                "Proses OCR untuk dokumen \"{$this->dokumen->nama_original}\" (arsip: {$arsip->nomor_arsip}) gagal: ".$e->getMessage(),
                route('arsip.index'),
            );
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $this->handleFailure($exception);
    }
}
