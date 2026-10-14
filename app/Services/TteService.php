<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
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
    ): ?DokumenArsipVersion {
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
            $this->generatePdfCertificate($arsip, $dokumen, $qrPath, $outputAbsolutePath, $verificationCode, $pimpinan);
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

        $writer = new PngWriter;
        $result = $writer->write($qrCode);

        $tempPath = sys_get_temp_dir().'/'.Str::uuid().'.png';
        $result->saveToFile($tempPath);

        return $tempPath;
    }

    /**
     * Generate PDF sertifikat TTE dummy (bukan menempel ke PDF asli),
     * supaya tidak bergantung pada parsing struktur PDF sumber.
     */
    private function generatePdfCertificate(
        Arsip $arsip,
        DokumenArsip $dokumen,
        string $qrImagePath,
        string $outputPath,
        string $verificationCode,
        User $pimpinan,
    ): void {
        $pdf = new Fpdi; // dipakai sebagai Fpdf biasa, tanpa setSourceFile()

        $pdf->AddPage('P', 'A4');
        $pdf->SetMargins(20, 20, 20);

        // Header
        $pdf->SetFont('Helvetica', 'B', 14);
        $pdf->Cell(0, 8, 'LARAS BAPPENDA', 0, 1, 'C');
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->Cell(0, 6, 'Sertifikat Tanda Tangan Elektronik (Dummy)', 0, 1, 'C');
        $pdf->Ln(6);
        $pdf->SetDrawColor(180, 180, 180);
        $pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(8);

        // Info dokumen
        $pdf->SetFont('Helvetica', 'B', 11);
        $pdf->Cell(50, 8, 'Nomor Arsip', 0, 0);
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->Cell(0, 8, ': '.$arsip->nomor_arsip, 0, 1);

        $pdf->SetFont('Helvetica', 'B', 11);
        $pdf->Cell(50, 8, 'Judul', 0, 0);
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->MultiCell(0, 8, ': '.$arsip->judul);

        $pdf->SetFont('Helvetica', 'B', 11);
        $pdf->Cell(50, 8, 'Nama File Asli', 0, 0);
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->Cell(0, 8, ': '.$dokumen->nama_original, 0, 1);

        $pdf->SetFont('Helvetica', 'B', 11);
        $pdf->Cell(50, 8, 'Ditandatangani oleh', 0, 0);
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->Cell(0, 8, ': '.$pimpinan->name, 0, 1);

        $pdf->SetFont('Helvetica', 'B', 11);
        $pdf->Cell(50, 8, 'Tanggal', 0, 0);
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->Cell(0, 8, ': '.now()->translatedFormat('d F Y, H:i').' WIB', 0, 1);

        $pdf->SetFont('Helvetica', 'B', 11);
        $pdf->Cell(50, 8, 'Kode Verifikasi', 0, 0);
        $pdf->SetFont('Helvetica', '', 11);
        $pdf->Cell(0, 8, ': '.$verificationCode, 0, 1);

        $pdf->Ln(10);

        // QR code
        $qrSize = 45; // mm
        $pdf->Image($qrImagePath, 20, $pdf->GetY(), $qrSize, $qrSize, 'PNG');
        $pdf->SetXY(20 + $qrSize + 8, $pdf->GetY());
        $pdf->SetFont('Helvetica', 'I', 9);
        $pdf->MultiCell(0, 5, "Pindai QR code di samping untuk memverifikasi\nkeabsahan dokumen ini secara elektronik.");

        $pdf->Ln($qrSize + 5);
        $pdf->SetFont('Helvetica', 'I', 8);
        $pdf->SetTextColor(120, 120, 120);
        $pdf->MultiCell(0, 5, 'Dokumen ini merupakan sertifikat TTE dummy yang dihasilkan otomatis oleh sistem untuk keperluan pengujian/simulasi, bukan tanda tangan elektronik resmi bersertifikat.');

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

        $resizedQr = imagecreatetruecolor(max(1, $qrTargetSize), max(1, $qrTargetSize));
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
