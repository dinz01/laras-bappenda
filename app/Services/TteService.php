<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\TteSignature;
use App\Models\User;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use setasign\Fpdi\Fpdi;

class TteService
{
    protected DocumentVersionService $documentVersionService;

    public function __construct(?DocumentVersionService $documentVersionService = null)
    {
        $this->documentVersionService = $documentVersionService ?? resolve(DocumentVersionService::class);
    }

    /**
     * Ajukan TTE dummy: generate QR, tempel ke dokumen, simpan sebagai versi baru,
     * dan catat pengajuan TTE.
     */
    public function ajukanTte(
        Arsip $arsip,
        User $pimpinan,
        string $sandiPimpinan,
        ?string $catatan,
    ): TteSignature {
        $verificationCode = 'TTE-'.strtoupper(Str::random(10));

        $dokumen = $arsip->dokumen;
        $newVersion = null;

        if ($dokumen !== null) {
            $newVersion = $this->stampDocument($arsip, $dokumen, $verificationCode, $pimpinan);
        }

        return TteSignature::create([
            'arsip_id' => $arsip->id,
            'dokumen_arsip_version_id' => $newVersion?->id,
            'signed_by' => $pimpinan->id,
            'sandi_pimpinan' => $sandiPimpinan,
            'catatan' => $catatan,
            'verification_code' => $verificationCode,
            'signed_at' => now(),
        ]);
    }

    /**
     * Tempel QR code dummy ke dokumen (PDF atau gambar), simpan sebagai versi baru.
     */
    private function stampDocument(
        Arsip $arsip,
        DokumenArsip $dokumen,
        string $verificationCode,
        User $pimpinan,
    ): ?\App\Models\DokumenArsipVersion {
        $mimeType = $dokumen->mime_type;

        if (! in_array($mimeType, ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'], true)) {
            // Format tidak didukung untuk watermark, lewati langkah ini.
            return null;
        }

        $sourcePath = Storage::disk('local')->path($dokumen->path_penyimpanan);

        if (! file_exists($sourcePath)) {
            return null;
        }

        $qrText = implode("\n", [
            'LARAS BAPPENDA',
            "Nomor Arsip: {$arsip->nomor_arsip}",
            "Ditandatangani: {$pimpinan->name}",
            'Tanggal: '.now()->translatedFormat('d F Y'),
            "Kode: {$verificationCode}",
        ]);

        $qrPath = $this->generateQrImage($qrText);

        $extension = $mimeType === 'application/pdf' ? 'pdf' : pathinfo($sourcePath, PATHINFO_EXTENSION);
        $generatedName = Str::uuid().'.'.$extension;
        $outputRelativePath = 'archives/'.$generatedName;
        $outputAbsolutePath = Storage::disk('local')->path($outputRelativePath);

        if ($mimeType === 'application/pdf') {
            $this->stampPdf($sourcePath, $qrPath, $outputAbsolutePath);
        } else {
            $this->stampImage($sourcePath, $qrPath, $outputAbsolutePath, $mimeType);
        }

        @unlink($qrPath);

        $newVersion = $this->documentVersionService->createVersion(
            $dokumen,
            $dokumen->nama_original,
            $outputRelativePath,
            (int) filesize($outputAbsolutePath),
            $mimeType,
            $pimpinan->id,
            "Dokumen ditandatangani secara elektronik (dummy) oleh {$pimpinan->name}. Kode verifikasi: {$verificationCode}.",
        );

        // Jadikan dokumen utama menunjuk ke file hasil TTE
        $dokumen->update([
            'nama_generated' => $generatedName,
            'path_penyimpanan' => $outputRelativePath,
            'ukuran' => (int) filesize($outputAbsolutePath),
        ]);

        return $newVersion;
    }

    /**
     * Generate gambar QR code sementara, return path file temp-nya.
     */
    private function generateQrImage(string $text): string
    {
        $qrCode = new QrCode(
            data: $text,
            size: 240,
            margin: 8,
        );

        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        $tempPath = sys_get_temp_dir().'/'.Str::uuid().'.png';
        $result->saveToFile($tempPath);

        return $tempPath;
    }

    /**
     * Tempelkan QR ke halaman terakhir PDF, pojok kanan bawah.
     */
    private function stampPdf(string $sourcePath, string $qrImagePath, string $outputPath): void
    {
        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($sourcePath);

        for ($i = 1; $i <= $pageCount; $i++) {
            $templateId = $pdf->importPage($i);
            $size = $pdf->getTemplateSize($templateId);

            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($templateId);

            if ($i === $pageCount) {
                $qrSize = 25; // mm
                $x = $size['width'] - $qrSize - 12;
                $y = $size['height'] - $qrSize - 12;
                $pdf->Image($qrImagePath, $x, $y, $qrSize, $qrSize, 'PNG');
            }
        }

        $pdf->Output('F', $outputPath);
    }

    /**
     * Tempelkan QR ke pojok kanan bawah gambar menggunakan GD.
     */
    private function stampImage(string $sourcePath, string $qrImagePath, string $outputPath, string $mimeType): void
    {
        $source = match ($mimeType) {
            'image/png' => imagecreatefrompng($sourcePath),
            default => imagecreatefromjpeg($sourcePath),
        };

        $qr = imagecreatefrompng($qrImagePath);

        if ($source === false || $qr === false) {
            if ($source !== false) {
                imagedestroy($source);
            }

            if ($qr !== false) {
                imagedestroy($qr);
            }

            copy($sourcePath, $outputPath);

            return;
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);

        $qrTargetSize = (int) max(80, min($sourceWidth, $sourceHeight) * 0.18);
        $margin = (int) ($qrTargetSize * 0.2);

        $resizedQr = imagecreatetruecolor($qrTargetSize, $qrTargetSize);
        imagecopyresampled(
            $resizedQr, $qr,
            0, 0, 0, 0,
            $qrTargetSize, $qrTargetSize,
            imagesx($qr), imagesy($qr),
        );

        imagecopy(
            $source, $resizedQr,
            $sourceWidth - $qrTargetSize - $margin,
            $sourceHeight - $qrTargetSize - $margin,
            0, 0,
            $qrTargetSize, $qrTargetSize,
        );

        if ($mimeType === 'image/png') {
            imagepng($source, $outputPath);
        } else {
            imagejpeg($source, $outputPath, 90);
        }

        imagedestroy($source);
        imagedestroy($qr);
        imagedestroy($resizedQr);
    }
}