<?php

$w = 118;
$h = 118;
$img = imagecreatetruecolor($w, $h);
$white = imagecolorallocate($img, 255, 255, 255);
$black = imagecolorallocate($img, 0, 0, 0);
imagefill($img, 0, 0, $white);
imagerectangle($img, 0, 0, $w - 1, $h - 1, $black);
imagefilledrectangle($img, 4, 4, 6, $h - 5, $black);
imagefilledrectangle($img, 8, 4, 9, $h - 5, $black);
imagefilledrectangle($img, 11, 4, 12, $h - 5, $black);
imagefilledrectangle($img, $w - 7, 4, $w - 5, $h - 5, $black);
imagefilledrectangle($img, $w - 10, 4, $w - 9, $h - 5, $black);
imagefilledrectangle($img, $w - 13, 4, $w - 12, $h - 5, $black);
$bars = [14, 16, 19, 22, 24, 27, 29, 31, 34, 37, 39, 42, 44, 46, 49, 52, 54, 57, 59, 61, 64, 67, 69, 72, 74, 76, 79, 82, 84, 87, 89, 91];
foreach ($bars as $i => $x) {
    if ($i % 2 === 0) {
        imagefilledrectangle($img, $x, 4, $x + 1, $h - 5, $black);
    }
}
$base = dirname(__DIR__);
$sp = $base.'/storage/app/barcode-placeholder.png';
$pp = $base.'/public/images/barcode-placeholder.png';
if (! is_dir(dirname($pp))) {
    mkdir(dirname($pp), 0755, true);
}
imagepng($img, $sp);
imagepng($img, $pp);
imagedestroy($img);
echo 'storage:'.(file_exists($sp) ? 'OK' : 'FAIL')."\n";
echo 'public:'.(file_exists($pp) ? 'OK' : 'FAIL')."\n";
