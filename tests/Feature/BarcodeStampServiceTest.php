<?php

use App\Services\BarcodeStampService;
use Illuminate\Http\UploadedFile;
use setasign\Fpdi\Fpdi;

/**
 * Helper: buat PNG sederhana dalam memori dan return binary string.
 */
function makePngContent(int $w = 100, int $h = 100): string
{
    $img = imagecreatetruecolor($w, $h);
    $white = imagecolorallocate($img, 255, 255, 255);
    imagefill($img, 0, 0, $white);
    ob_start();
    imagepng($img);
    $content = ob_get_clean();
    imagedestroy($img);

    return $content;
}

/**
 * Helper: buat file PDF sederhana dengan N halaman.
 */
function makePdfContent(int $pages = 2): string
{
    $pdf = new Fpdi;

    for ($i = 1; $i <= $pages; $i++) {
        $pdf->AddPage();
        $pdf->SetFont('Helvetica', 'B', 16);
        $pdf->Cell(40, 10, "Halaman {$i}");
    }

    return $pdf->Output('S');
}

beforeEach(function () {
    // Pastikan dummy-barcode.png tersedia di public/images/
    $barcodePath = public_path('images/dummy-barcode.png');
    $dir = dirname($barcodePath);

    if (! is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    if (! file_exists($barcodePath)) {
        $img = imagecreatetruecolor(10, 10);
        $white = imagecolorallocate($img, 255, 255, 255);
        imagefill($img, 0, 0, $white);
        imagepng($img, $barcodePath);
        imagedestroy($img);
    }
});

test('stamp menghasilkan file PNG dengan barcode di pojok kiri bawah', function () {
    $service = app(BarcodeStampService::class);
    $file = UploadedFile::fake()->createWithContent('test.png', makePngContent(200, 200));

    $resultPath = $service->stamp($file);

    expect(file_exists($resultPath))->toBeTrue()
        ->and(filesize($resultPath))->toBeGreaterThan(0);

    @unlink($resultPath);
});

test('stamp menghasilkan file JPG dengan barcode di pojok kiri bawah', function () {
    $service = app(BarcodeStampService::class);

    $img = imagecreatetruecolor(200, 200);
    $white = imagecolorallocate($img, 255, 255, 255);
    imagefill($img, 0, 0, $white);
    ob_start();
    imagejpeg($img, null, 100);
    $content = ob_get_clean();
    imagedestroy($img);

    $file = UploadedFile::fake()->createWithContent('test.jpg', $content);
    $resultPath = $service->stamp($file);

    expect(file_exists($resultPath))->toBeTrue()
        ->and(filesize($resultPath))->toBeGreaterThan(0);

    @unlink($resultPath);
});

test('stamp menghasilkan file PDF multi-halaman dengan barcode', function () {
    $service = app(BarcodeStampService::class);
    $pdfContent = makePdfContent(3);
    $file = UploadedFile::fake()->createWithContent('multi-page.pdf', $pdfContent);

    $resultPath = $service->stamp($file);

    expect(file_exists($resultPath))->toBeTrue()
        ->and(filesize($resultPath))->toBeGreaterThan(0);

    @unlink($resultPath);
});

test('stamp fallback copy jika barcode tidak ada', function () {
    $barcodePath = public_path('images/dummy-barcode.png');
    $tempPath = $barcodePath.'.bak';
    rename($barcodePath, $tempPath);

    $service = app(BarcodeStampService::class);
    $file = UploadedFile::fake()->createWithContent('test.png', makePngContent(50, 50));
    $resultPath = $service->stamp($file);

    rename($tempPath, $barcodePath);

    expect(file_exists($resultPath))->toBeTrue()
        ->and(filesize($resultPath))->toBeGreaterThan(0);

    @unlink($resultPath);
});
