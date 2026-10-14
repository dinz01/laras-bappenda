export type WorkflowStatus =
    | 'review'
    | 'revisi'
    | 'approved'
    | 'waiting_tte'
    | 'active'
    | 'inactive'
    | 'musnah'
    | 'permanen'
    | 'dinilai_kembali'
    | (string & {});

export function workflowStatusVariant(
    status: string,
): 'secondary' | 'warning' | 'info' | 'success' | 'danger' {
    switch (status) {
        case 'review':
            return 'warning';
        case 'revisi':
            return 'danger';
        case 'approved':
            return 'info';
        case 'waiting_tte':
            return 'info';
        case 'active':
            return 'success';
        case 'inactive':
            return 'secondary';
        case 'musnah':
            return 'danger'; // Fix merah sesuai permintaan!
        case 'permanen':
            return 'success';
        case 'dinilai_kembali':
            return 'warning';
        default: {
            // Warna acak / berbeda untuk setiap nasib akhir selain musnah
            const nonDangerVariants: Array<
                'info' | 'success' | 'warning' | 'secondary'
            > = ['info', 'success', 'warning', 'secondary'];
            let hash = 0;

            for (let i = 0; i < status.length; i++) {
                hash = status.charCodeAt(i) + ((hash << 5) - hash);
            }

            const index = Math.abs(hash) % nonDangerVariants.length;

            return nonDangerVariants[index];
        }
    }
}

export function workflowStatusLabel(status: string): string {
    switch (status) {
        case 'review':
            return 'Menunggu Review';
        case 'revisi':
            return 'Perlu Revisi';
        case 'approved':
            return 'Disetujui';
        case 'waiting_tte':
            return 'Menunggu TTE';
        case 'active':
            return 'Aktif';
        case 'inactive':
            return 'Inaktif';
        case 'musnah':
            return 'Musnah';
        case 'permanen':
            return 'Permanen';
        case 'dinilai_kembali':
            return 'Dinilai Kembali';
        default:
            return status
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
}

/** Status yang tidak boleh di-edit (sudah melewati proses verifikasi) */
export const NON_EDITABLE_STATUSES: string[] = [
    'active',
    'inactive',
    'musnah',
    'permanen',
    'dinilai_kembali',
];

export function isArsipEditable(status: string): boolean {
    if (['review', 'revisi', 'approved', 'waiting_tte'].includes(status)) {
        return true;
    }

    return !NON_EDITABLE_STATUSES.includes(status);
}
