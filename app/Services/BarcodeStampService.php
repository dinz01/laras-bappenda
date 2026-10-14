<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use setasign\Fpdi\Fpdi;
use Symfony\Component\Process\Process;

class BarcodeStampService
{
    /**
     * Ukuran barcode dalam mm saat ditempel ke PDF (1 cm × 1 cm).
     */
    private const BARCODE_MM = 10.0;

    /**
     * Margin dari tepi kiri bawah halaman (dalam mm untuk PDF).
     */
    private const MARGIN_MM = 5.0;

    /**
     * Tempel barcode placeholder ke file yang diunggah.
     * Semua dokumen (PDF maupun gambar JPG/PNG) dikonversi dan disimpan dalam format PDF beresolusi tinggi.
     *
     * @return string Path absolut ke file PDF hasil stamp (temp file, wajib dihapus setelah dipakai)
     */
    public function stamp(UploadedFile $file): string
    {
        $mimeType = $this->resolveMimeType($file);
        $sourcePath = $file->getRealPath();

        if (! $sourcePath || ! file_exists($sourcePath)) {
            throw new \RuntimeException('File upload tidak ditemukan untuk proses stamp barcode.');
        }

        // Output selalu berformat .pdf
        $outputPath = sys_get_temp_dir().'/'.Str::uuid().'.pdf';

        Log::info('BarcodeStamp: memulai stamp ke format PDF', [
            'mime' => $mimeType,
            'nama' => $file->getClientOriginalName(),
            'ukuran' => $file->getSize(),
            'barcode' => $this->barcodePath(),
            'barcode_exists' => file_exists($this->barcodePath()),
        ]);

        $this->processFileToPdf($sourcePath, $outputPath, $mimeType);

        Log::info('BarcodeStamp: selesai', [
            'output_exists' => file_exists($outputPath),
            'output_size' => file_exists($outputPath) ? filesize($outputPath) : 0,
        ]);

        return $outputPath;
    }

    /**
     * Deteksi MIME type dari UploadedFile.
     */
    private function resolveMimeType(UploadedFile $file): string
    {
        $mime = $file->getMimeType();

        if ($mime === null || $mime === '' || $mime === 'application/octet-stream') {
            $ext = strtolower($file->getClientOriginalExtension());
            $mime = match ($ext) {
                'pdf' => 'application/pdf',
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                default => $mime ?? 'application/octet-stream',
            };
        }

        return $mime;
    }

    /**
     * Proses file menjadi PDF ber-barcode.
     * Menggunakan node + pdf-lib sebagai engine utama.
     */
    private function processFileToPdf(string $sourcePath, string $outputPath, string $mimeType): void
    {
        $barcodePath = $this->barcodePath();

        if (! file_exists($barcodePath)) {
            Log::warning('BarcodeStamp: barcode file tidak ada', ['path' => $barcodePath]);
            copy($sourcePath, $outputPath);

            return;
        }

        // 1. Coba menggunakan node + pdf-lib
        $nodeScript = base_path('scripts/stamp-pdf.cjs');

        if (file_exists($nodeScript)) {
            $process = new Process(['node', $nodeScript, $sourcePath, $outputPath, $barcodePath, $mimeType]);
            $process->setTimeout(60);
            $process->run();

            if ($process->isSuccessful() && file_exists($outputPath) && filesize($outputPath) > 0) {
                Log::info('BarcodeStamp: Berhasil diproses ke PDF dengan pdf-lib');

                return;
            }

            Log::warning('BarcodeStamp: pdf-lib gagal, mencoba fallback FPDI/FPDF', [
                'error' => $process->getErrorOutput(),
                'output' => $process->getOutput(),
            ]);
        }

        // 2. Fallback jika node tidak tersedia
        if ($mimeType === 'application/pdf') {
            $this->fallbackPdf($sourcePath, $outputPath, $barcodePath);
        } else {
            $this->fallbackImageToPdf($sourcePath, $outputPath, $barcodePath);
        }
    }

    /**
     * Fallback FPDI untuk PDF.
     */
    private function fallbackPdf(string $sourcePath, string $outputPath, string $barcodePath): void
    {
        try {
            $pdf = new Fpdi;
            $pageCount = $pdf->setSourceFile($sourcePath);

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $tplId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($tplId);

                if (! is_array($size)) {
                    $size = ['width' => 210.0, 'height' => 297.0];
                }

                /** @var array{width: float, height: float} $size */
                $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($tplId, 0, 0, $size['width'], $size['height']);

                $xMm = self::MARGIN_MM;
                $yMm = $size['height'] - self::BARCODE_MM - self::MARGIN_MM;

                $pdf->Image($barcodePath, $xMm, $yMm, self::BARCODE_MM, self::BARCODE_MM, 'PNG');
            }

            $pdf->Output('F', $outputPath);
        } catch (\Throwable $e) {
            Log::error('BarcodeStamp: Fallback FPDI gagal', ['error' => $e->getMessage()]);
            copy($sourcePath, $outputPath);
        }
    }

    /**
     * Fallback FPDF untuk mengonversi gambar ke PDF.
     */
    private function fallbackImageToPdf(string $sourcePath, string $outputPath, string $barcodePath): void
    {
        try {
            $imageInfo = @getimagesize($sourcePath);

            if (! $imageInfo) {
                copy($sourcePath, $outputPath);

                return;
            }

            $imgWidthPx = (float) $imageInfo[0];
            $imgHeightPx = (float) $imageInfo[1];

            // Konversi pixel ke mm (asumsi 96 DPI: 1 px = 25.4/96 mm ≈ 0.264583 mm)
            $pxToMm = 25.4 / 96.0;
            $pageWidthMm = $imgWidthPx * $pxToMm;
            $pageHeightMm = $imgHeightPx * $pxToMm;

            $pdf = new Fpdi;
            $orientation = ($pageWidthMm > $pageHeightMm) ? 'L' : 'P';
            $pdf->AddPage($orientation, [$pageWidthMm, $pageHeightMm]);
            $pdf->Image($sourcePath, 0, 0, $pageWidthMm, $pageHeightMm);

            $barcodeSizeMm = max(10.0, (10.0 / 210.0) * $pageWidthMm);
            $marginMm = max(5.0, (5.0 / 210.0) * $pageWidthMm);
            $yMm = $pageHeightMm - $barcodeSizeMm - $marginMm;

            $pdf->Image($barcodePath, $marginMm, $yMm, $barcodeSizeMm, $barcodeSizeMm, 'PNG');
            $pdf->Output('F', $outputPath);
        } catch (\Throwable $e) {
            Log::error('BarcodeStamp: Fallback Image to PDF gagal', ['error' => $e->getMessage()]);
            copy($sourcePath, $outputPath);
        }
    }

    /**
     * Kembalikan path absolut ke file barcode dummy.
     */
    private function barcodePath(): string
    {
        return public_path('images/dummy-barcode.png');
    }
}
