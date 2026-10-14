import { startTransition, useEffect, useRef, useState } from 'react';

const BARCODE_SRC = '/images/dummy-barcode.png';

/**
 * Persentase margin dari tepi (sama dengan MARGIN_MM/210mm di backend ≈ 2.38%).
 * Dibulatkan ke 2.5% agar terlihat jelas di preview.
 */
const MARGIN_PCT = 2.5;

type Props = {
    file: File;
};

type PreviewState = {
    isPdf: boolean;
    pdfUrl: string | null;
    canvasReady: boolean;
};

/**
 * Menampilkan preview hasil barcode yang akan ditempel oleh backend.
 * - Gambar (JPG/PNG): Canvas dengan barcode di pojok kiri bawah.
 * - PDF: iframe + overlay CSS barcode di pojok kiri bawah.
 *
 * Tidak ada logika simpan di sini — murni visual preview.
 */
export function BarcodePreview({ file }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [previewState, setPreviewState] = useState<PreviewState>({
        isPdf: false,
        pdfUrl: null,
        canvasReady: false,
    });

    useEffect(() => {
        const isFilePdf = file.type === 'application/pdf';

        if (isFilePdf) {
            const url = URL.createObjectURL(file);

            startTransition(() => {
                setPreviewState({
                    isPdf: true,
                    pdfUrl: url,
                    canvasReady: false,
                });
            });

            return () => {
                URL.revokeObjectURL(url);
            };
        }

        // Gambar: render ke canvas dengan barcode overlay
        startTransition(() => {
            setPreviewState({
                isPdf: false,
                pdfUrl: null,
                canvasReady: false,
            });
        });

        const img = new Image();
        const barcodeImg = new Image();
        let destroyed = false;

        const renderCanvas = () => {
            if (destroyed) {
                return;
            }

            const canvas = canvasRef.current;

            if (!canvas || !img.complete || !barcodeImg.complete) {
                return;
            }

            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return;
            }

            // Sesuaikan ukuran canvas dengan aspek rasio gambar
            const MAX_WIDTH = canvas.parentElement?.clientWidth ?? 600;
            const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);

            canvas.width = Math.round(img.naturalWidth * scale);
            canvas.height = Math.round(img.naturalHeight * scale);

            // Gambar sumber
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Ukuran barcode: proporsional 10mm/210mm dari lebar canvas
            const barcodePx = Math.max(
                20,
                Math.round(canvas.width * (10 / 210)),
            );

            // Padding: 5mm/210mm dari lebar canvas
            const paddingPx = Math.max(2, Math.round(canvas.width * (5 / 210)));

            // Pojok kiri bawah
            const destX = paddingPx;
            const destY = canvas.height - barcodePx - paddingPx;

            ctx.drawImage(barcodeImg, destX, destY, barcodePx, barcodePx);

            startTransition(() => {
                setPreviewState((prev) => ({ ...prev, canvasReady: true }));
            });
        };

        img.onload = renderCanvas;
        barcodeImg.onload = renderCanvas;

        const reader = new FileReader();
        reader.onload = () => {
            if (!destroyed && typeof reader.result === 'string') {
                img.src = reader.result;
            }
        };
        reader.readAsDataURL(file);
        barcodeImg.src = BARCODE_SRC;

        return () => {
            destroyed = true;
            reader.onload = null;
            img.onload = null;
            barcodeImg.onload = null;
        };
    }, [file]);

    if (previewState.isPdf) {
        return (
            <div
                className="relative w-full overflow-hidden rounded border border-border/60 bg-white shadow-sm"
                style={{ aspectRatio: '1 / 1.414' }}
            >
                {previewState.pdfUrl && (
                    <iframe
                        src={`${previewState.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute inset-0 h-full w-full"
                        style={{ border: 'none' }}
                        title="Preview PDF"
                    />
                )}
                {/* Overlay barcode di pojok kiri bawah — visual preview saja */}
                <img
                    src={BARCODE_SRC}
                    alt="Posisi barcode"
                    className="absolute"
                    style={{
                        left: `${MARGIN_PCT}%`,
                        bottom: `${MARGIN_PCT}%`,
                        width: `${(10 / 210) * 100}%`,
                        height: 'auto',
                        pointerEvents: 'none',
                    }}
                />
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded border border-border/60 bg-white shadow-sm">
            <canvas
                ref={canvasRef}
                className="block w-full"
                style={{ display: previewState.canvasReady ? 'block' : 'none' }}
            />
            {!previewState.canvasReady && (
                <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                    Memuat preview…
                </div>
            )}
        </div>
    );
}
