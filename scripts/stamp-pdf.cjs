const fs = require('fs');
const { PDFDocument, degrees } = require('pdf-lib');

function detectFileType(buffer, mimeType) {
    // Check magic numbers first
    if (
        buffer.length >= 4 &&
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
    ) {
        return 'pdf';
    }

    if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    ) {
        return 'png';
    }

    if (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
    ) {
        return 'jpg';
    }

    // Check MIME type parameter fallback
    if (mimeType) {
        const lowerMime = mimeType.toLowerCase();

        if (lowerMime.includes('pdf')) {
            return 'pdf';
        }

        if (lowerMime.includes('png')) {
            return 'png';
        }

        if (lowerMime.includes('jpeg') || lowerMime.includes('jpg')) {
            return 'jpg';
        }
    }

    return 'pdf';
}

async function processDocument(sourcePath, outputPath, barcodePath, mimeType) {
    const fileBytes = fs.readFileSync(sourcePath);
    const barcodeBytes = fs.readFileSync(barcodePath);
    const fileType = detectFileType(fileBytes, mimeType);

    if (fileType === 'pdf') {
        const pdfDoc = await PDFDocument.load(fileBytes, {
            ignoreEncryption: true,
        });
        const barcodeImage = await pdfDoc.embedPng(barcodeBytes);

        // 1 cm = 72 / 2.54 = 28.346 points
        const barcodeSizePt = 28.346;
        // 5 mm = 72 * 0.5 / 2.54 = 14.173 points
        const marginPt = 14.173;

        const pages = pdfDoc.getPages();

        for (const page of pages) {
            const { width, height } = page.getSize();
            const rot = (page.getRotation().angle || 0) % 360;

            if (rot === 0) {
                page.drawImage(barcodeImage, {
                    x: marginPt,
                    y: marginPt,
                    width: barcodeSizePt,
                    height: barcodeSizePt,
                });
            } else if (rot === 90) {
                // Rotated 90 deg clockwise: visual bottom-left is top-left in unrotated coords
                page.drawImage(barcodeImage, {
                    x: marginPt,
                    y: height - marginPt,
                    width: barcodeSizePt,
                    height: barcodeSizePt,
                    rotate: degrees(-90),
                });
            } else if (rot === 180) {
                // Rotated 180 deg: visual bottom-left is top-right in unrotated coords
                page.drawImage(barcodeImage, {
                    x: width - marginPt,
                    y: height - marginPt,
                    width: barcodeSizePt,
                    height: barcodeSizePt,
                    rotate: degrees(-180),
                });
            } else if (rot === 270) {
                // Rotated 270 deg: visual bottom-left is bottom-right in unrotated coords
                page.drawImage(barcodeImage, {
                    x: width - marginPt,
                    y: marginPt,
                    width: barcodeSizePt,
                    height: barcodeSizePt,
                    rotate: degrees(-270),
                });
            }
        }

        const stampedBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, stampedBytes);

        return;
    }

    // Image (PNG / JPG) -> Convert to 1:1 matching PDF page
    const pdfDoc = await PDFDocument.create();
    const barcodeImage = await pdfDoc.embedPng(barcodeBytes);
    const isPng = fileType === 'png';
    const image = isPng
        ? await pdfDoc.embedPng(fileBytes)
        : await pdfDoc.embedJpg(fileBytes);

    const imgWidth = image.width;
    const imgHeight = image.height;

    // Add page matching the exact image dimensions (1:1 ratio)
    const page = pdfDoc.addPage([imgWidth, imgHeight]);
    page.drawImage(image, {
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
    });

    // Barcode 1cm (10mm / 210mm) and 5mm margin relative to page width
    const barcodeSize = Math.max(28.346, (10 / 210) * imgWidth);
    const margin = Math.max(14.173, (5 / 210) * imgWidth);

    page.drawImage(barcodeImage, {
        x: margin,
        y: margin,
        width: barcodeSize,
        height: barcodeSize,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
}

const [, , sourcePath, outputPath, barcodePath, mimeType] = process.argv;

if (!sourcePath || !outputPath || !barcodePath) {
    console.error(
        'Usage: node stamp-pdf.cjs <sourcePath> <outputPath> <barcodePath> [mimeType]',
    );
    process.exit(1);
}

processDocument(sourcePath, outputPath, barcodePath, mimeType)
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error('processDocument error:', err);
        process.exit(1);
    });
