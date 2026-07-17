<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\OcrStatus;
use App\Interfaces\OcrServiceInterface;
use App\Models\DokumenArsip;
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

            // 3. Simpan hasil OCR ke database
            $this->dokumen->update([
                'ocr_status' => OcrStatus::Completed,
                'ocr_text' => $result->text,
                'ocr_confidence' => $result->confidence,
                'ocr_language' => $result->language,
                'ocr_pages' => $result->pages,
                'ocr_processed_at' => now(),
            ]);

            Log::info('OCR Completed', [
                'dokumen_id' => $this->dokumen->id,
                'confidence' => $result->confidence,
                'pages' => $result->pages,
                'processing_time_ms' => $result->processingTimeMs,
            ]);

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
        $this->dokumen->update([
            'ocr_status' => OcrStatus::Failed,
        ]);

        Log::error('OCR Failed', [
            'dokumen_id' => $this->dokumen->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $this->handleFailure($exception);
    }
}
