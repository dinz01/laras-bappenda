---
kode: BP-04
judul: Proses Bisnis
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-04 — Proses Bisnis

## 1. Pendahuluan

Dokumen ini menjelaskan alur proses bisnis utama dalam Sistem LARAS. Seluruh proses dirancang mengikuti prosedur pengelolaan arsip digital serta pelayanan permohonan arsip sesuai kebutuhan organisasi.

---

# 2. Proses Bisnis Utama

Sistem LARAS terdiri atas dua kelompok proses bisnis utama, yaitu:

1. Pengelolaan Arsip Digital (Portal Internal)
2. Pelayanan Permohonan Arsip (Portal Publik)

---

# 3. Proses Pengelolaan Arsip Digital

Alur proses pengelolaan arsip sebagai berikut:

1. Arsiparis login ke sistem.
2. Arsiparis membuat data arsip baru.
3. Metadata arsip diisi secara lengkap.
4. Dokumen arsip diunggah ke sistem.
5. Sistem menyimpan dokumen ke media penyimpanan.
6. Sistem mencatat Audit Log.
7. Arsip dapat dicari melalui fitur pencarian.
8. Arsip dapat diperbarui apabila diperlukan.
9. Arsip dapat dipindahkan ke Record Center.
10. Arsip mengikuti jadwal retensi.
11. Arsip dapat dimusnahkan sesuai prosedur.

---

# 4. Proses Permohonan Arsip Publik

Alur proses permohonan arsip oleh masyarakat atau instansi:

1. Pemohon membuka Portal Publik.
2. Pemohon mengisi formulir permohonan.
3. Pemohon mengunggah dokumen persyaratan.
4. Sistem membuat Nomor Permohonan.
5. Sistem menyimpan data permohonan.
6. Pemohon menerima bukti permohonan.
7. Petugas melakukan verifikasi.
8. Permohonan dapat disetujui atau ditolak.
9. Jika disetujui, arsip disiapkan.
10. Dokumen dapat ditandatangani secara elektronik (jika diterapkan).
11. Pemohon menerima pemberitahuan.
12. Pemohon mengunduh arsip melalui Portal Publik.

---

# 5. Proses Persetujuan Permohonan

1. Petugas menerima permohonan baru.
2. Petugas memverifikasi kelengkapan.
3. Petugas memeriksa hak akses arsip.
4. Petugas memberikan keputusan.
5. Sistem mencatat Audit Log.
6. Sistem memperbarui status permohonan.
7. Sistem mengirimkan notifikasi kepada pemohon.

---

# 6. Proses Retensi Arsip

1. Sistem memantau masa retensi.
2. Arsip yang memasuki masa retensi ditandai.
3. Arsiparis melakukan peninjauan.
4. Arsip dipindahkan ke Record Center atau dimusnahkan sesuai ketentuan.
5. Sistem mencatat seluruh aktivitas.

---

# 7. Proses Pencarian Arsip

1. Pengguna memasukkan kata kunci.
2. Sistem melakukan pencarian.
3. Sistem menampilkan hasil sesuai hak akses pengguna.
4. Pengguna membuka detail arsip.
5. Sistem mencatat aktivitas akses.

---

# 8. Proses Audit Log

Audit Log mencatat aktivitas penting, antara lain:

- Login
- Logout
- Menambah arsip
- Mengubah arsip
- Menghapus arsip
- Mengunduh arsip
- Membuat permohonan
- Menyetujui permohonan
- Menolak permohonan
- Mengubah pengaturan
- Mengelola pengguna

Audit Log tidak dapat diubah oleh pengguna.

---

# 9. Status Permohonan Arsip

Status permohonan terdiri atas:

- Menunggu Verifikasi
- Sedang Diverifikasi
- Disetujui
- Ditolak
- Arsip Sedang Disiapkan
- Siap Diunduh
- Selesai
- Dibatalkan

---

# 10. Status Arsip

Status arsip terdiri atas:

- Aktif
- Inaktif
- Record Center
- Musnah

---

# 11. Aturan Bisnis

Sistem menerapkan aturan bisnis berikut:

- Seluruh aktivitas dicatat pada Audit Log.
- Arsip hanya dapat diakses sesuai hak akses pengguna.
- Arsip yang telah dimusnahkan tidak dapat dipulihkan melalui aplikasi.
- Nomor permohonan dibuat otomatis dan bersifat unik.
- Setiap perubahan data arsip dicatat sebagai riwayat aktivitas.
- Dokumen permohonan wajib lengkap sebelum diverifikasi.
- Arsip yang telah disetujui dapat diunduh oleh pemohon sesuai masa berlaku akses.
- Integrasi TTE, OCR, AI, dan Meilisearch bersifat modular sehingga dapat diaktifkan tanpa mengubah proses bisnis utama.

---

# 12. Diagram Alur Sederhana

## Pengelolaan Arsip

```
Login
   │
Tambah Arsip
   │
Upload Dokumen
   │
Simpan Metadata
   │
Repository Arsip
   │
Retensi
   │
Record Center
   │
Pemusnahan
```

---

## Permohonan Arsip

```
Portal Publik
      │
Isi Formulir
      │
Upload Persyaratan
      │
Verifikasi
      │
Disetujui / Ditolak
      │
TTE (Opsional)
      │
Siap Diunduh
```

---

# 13. Kesimpulan

Proses bisnis Sistem LARAS dibagi menjadi dua kelompok utama, yaitu pengelolaan arsip digital oleh pengguna internal dan pelayanan permohonan arsip melalui Portal Publik. Seluruh proses didukung oleh mekanisme audit, pengendalian hak akses, serta kesiapan integrasi dengan layanan eksternal sehingga sistem dapat dikembangkan secara bertahap tanpa mengubah alur bisnis utama.