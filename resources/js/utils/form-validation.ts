import { toast } from 'sonner';

/**
 * Fokuskan dan scroll ke elemen input/select/textarea pertama
 * dalam container yang dianggap invalid atau bertanda error.
 */
export function focusFirstInvalidField(container?: HTMLElement | null): void {
    const root = container ?? document;

    const selectors = [
        '[aria-invalid="true"]',
        '[data-invalid="true"]',
        '.border-destructive input',
        '.border-destructive',
        'input:invalid',
        'select:invalid',
        'textarea:invalid',
    ].join(', ');

    const el = root.querySelector<HTMLElement>(selectors);

    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.focus(), 100);
    }
}

/**
 * Tampilkan toast peringatan validasi kolom wajib dan
 * fokus ke field pertama yang bermasalah.
 */
export function toastValidationError(
    fieldLabel: string,
    container?: HTMLElement | null,
): void {
    toast.warning(`Harap isi kolom "${fieldLabel}" yang wajib diisi.`, {
        description: 'Periksa kembali data yang telah Anda masukkan.',
    });
    setTimeout(() => focusFirstInvalidField(container), 50);
}

/**
 * Tampilkan toast error umum validasi (mis. setelah server 422)
 * dan fokuskan ke field pertama yang bermasalah.
 */
export function toastFormError(
    message = 'Terdapat kesalahan pada data yang dimasukkan.',
    container?: HTMLElement | null,
): void {
    toast.error(message, {
        description: 'Periksa kembali kolom yang ditandai merah.',
    });
    setTimeout(() => focusFirstInvalidField(container), 50);
}
