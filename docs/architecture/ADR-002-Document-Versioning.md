# ADR-002-Document-Versioning: Pendekatan Document Versioning tanpa Menghapus File Lama

## Keputusan
Setiap kali berkas dokumen arsip diperbarui atau diganti, file lama yang berada di storage fisik dan record lamanya di database tidak boleh dihapus. Sistem harus membuat entri baru di tabel `dokumen_arsip_versions` dengan menaikkan penomoran versi (counter `versi` diset `+1`) dan mencatat path file barunya secara terpisah.

## Alasan
1. **Integritas Dokumen**: Mempertahankan rekam sejarah perubahan fisik dari suatu dokumen arsip demi transparansi hukum dan akuntabilitas.
2. **Kesiapan Audit & TTE**: Menjadi landasan kuat untuk audit trail masa depan serta validasi sertifikasi Tanda Tangan Elektronik (TTE) pada setiap iterasi versi file.

## Konsekuensi
- Konsumsi storage penyimpanan meningkat karena menyimpan beberapa iterasi file untuk satu arsip.
- Perlu penanganan unduhan file berdasarkan ID versi tertentu (`arsip.download-version`).
