<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\OcrResult;
use App\Interfaces\OcrServiceInterface;
use Illuminate\Support\Carbon;

/**
 * Mock OCR Service untuk development dan testing.
 *
 * Menghasilkan data OCR realistis tanpa provider eksternal.
 * Ganti dengan implementasi nyata (Tesseract, Google Vision, dll.) di production.
 */
class MockOcrService implements OcrServiceInterface
{
    /**
     * Teks dummy berbahasa Indonesia yang digunakan untuk simulasi.
     *
     * @var list<string>
     */
    private const DUMMY_TEXTS = [
        'Surat Permohonan ini dibuat sehubungan dengan kebutuhan administrasi perkantoran yang bersangkutan. Dengan hormat kami sampaikan bahwa berdasarkan peraturan yang berlaku, permohonan ini diajukan kepada pihak yang berwenang untuk diproses lebih lanjut sesuai prosedur yang ditetapkan.',
        'Berdasarkan hasil rapat koordinasi pada tanggal yang telah ditentukan, diperoleh kesepakatan bahwa pelaksanaan kegiatan akan dilakukan sesuai dengan jadwal yang telah ditetapkan. Adapun anggaran yang diperlukan telah dialokasikan dalam DIPA tahun anggaran berjalan.',
        'Dalam rangka meningkatkan kualitas pelayanan publik, kami menyampaikan laporan kegiatan triwulan ini sebagai pertanggungjawaban atas pelaksanaan program dan anggaran. Realisasi anggaran mencapai target yang telah ditetapkan dalam rencana kerja.',
        'Nota Dinas ini ditujukan kepada seluruh kepala bagian untuk segera menindaklanjuti instruksi yang telah disampaikan dalam rapat pimpinan. Setiap unit kerja wajib menyampaikan laporan progress pekerjaan paling lambat pada akhir bulan berjalan.',
        'Sehubungan dengan pelaksanaan audit internal yang akan dilaksanakan pada bulan mendatang, dimohon kepada seluruh unit kerja untuk mempersiapkan dokumen pendukung yang diperlukan sesuai dengan standar yang telah ditetapkan oleh tim audit.',
    ];

    /**
     * Ekstrak teks mentah dari file dokumen.
     */
    public function extractText(string $filePath): string
    {
        return $this->generateDummyText($filePath);
    }

    /**
     * Analisis dokumen dan kembalikan hasil OCR lengkap.
     */
    public function analyze(string $filePath): OcrResult
    {
        $startTime = microtime(true);

        // Simulasi waktu processing (50–300ms)
        usleep(random_int(50_000, 300_000));

        $text = $this->generateDummyText($filePath);
        $pages = $this->estimatePages($filePath);
        $confidence = round(random_int(8500, 9900) / 100, 2);
        $processingTimeMs = (int) round((microtime(true) - $startTime) * 1000);

        return new OcrResult(
            text: $text,
            pages: $pages,
            language: 'id',
            confidence: $confidence,
            processedAt: Carbon::now()->toIso8601String(),
            processingTimeMs: $processingTimeMs,
        );
    }

    /**
     * Cek apakah OCR service tersedia dan siap digunakan.
     */
    public function health(): bool
    {
        return true;
    }

    /**
     * Generate teks dummy berdasarkan path file.
     * Deterministik berdasarkan nama file agar hasil konsisten dalam test.
     */
    private function generateDummyText(string $filePath): string
    {
        $index = abs(crc32(basename($filePath))) % count(self::DUMMY_TEXTS);
        $baseText = self::DUMMY_TEXTS[$index];

        // Tambah paragraf kedua untuk realisme
        $secondIndex = ($index + 1) % count(self::DUMMY_TEXTS);

        return $baseText.' '.self::DUMMY_TEXTS[$secondIndex];
    }

    /**
     * Estimasi jumlah halaman berdasarkan ukuran file.
     */
    private function estimatePages(string $filePath): int
    {
        $fullPath = storage_path('app/'.$filePath);

        if (! file_exists($fullPath)) {
            return random_int(1, 5);
        }

        $sizeKb = filesize($fullPath) / 1024;

        // ~100KB per halaman sebagai estimasi kasar
        return max(1, (int) ceil($sizeKb / 100));
    }
}
