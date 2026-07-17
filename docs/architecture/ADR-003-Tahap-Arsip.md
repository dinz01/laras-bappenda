# ADR-003-Tahap-Arsip: Penamaan "Tahap Arsip" untuk Workflow Siklus Hidup Arsip

## Keputusan
Seluruh tampilan antarmuka (UI) menggunakan istilah **"Tahap Arsip"** untuk menggambarkan siklus hidup dokumen arsip. Istilah teknis di sisi backend (nama kolom database, nama method, nama class) boleh tetap menggunakan `workflow_status`, `WorkflowService`, `WorkflowStatus`, dsb., karena ini merupakan konvensi umum dalam domain pemrograman.

Urutan tahap:
```
Draft → Review → Disetujui → Arsip Aktif → Retensi → Record Center → Pemusnahan
```

Kolom teknis: `arsip.workflow_status` (string, enum `WorkflowStatus`)

## Alasan
1. **Bahasa Domain**: Pengguna sistem BAPPENDA lebih familiar dengan istilah "tahap" daripada istilah teknis "workflow" dalam konteks administrasi kearsipan.
2. **Konsistensi UI**: Memisahkan terminologi tampilan dari terminologi internal mencegah kebingungan bagi operator arsip.
3. **Backward Compatibility**: Perubahan hanya menyentuh label UI, tidak ada perubahan database atau API sehingga tidak ada breaking change.

## Konsekuensi
- Setiap penambahan halaman atau komponen baru yang menampilkan status tahap arsip harus menggunakan istilah "Tahap Arsip", "Tahap Saat Ini", "Lanjutkan Tahap", "Riwayat Tahap".
- Nama teknis (`workflow_status`, `WorkflowService`) tetap dipertahankan di backend.
