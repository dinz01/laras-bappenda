---
kode: BP-07
judul: Modul Sistem
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-07 — Modul Sistem

## 1. Pendahuluan

Dokumen ini menjelaskan seluruh modul yang terdapat pada Sistem LARAS. Setiap modul dirancang bersifat modular sehingga dapat dikembangkan secara bertahap tanpa memengaruhi modul lainnya.

---

# 2. Modul Portal Publik

## 2.1 Beranda

Fungsi:

- Menampilkan informasi singkat mengenai LARAS.
- Menampilkan alur permohonan arsip.
- Menampilkan informasi layanan.

---

## 2.2 Informasi Layanan

Fungsi:

- Persyaratan permohonan.
- Prosedur permohonan.
- Informasi pelayanan.

---

## 2.3 Permohonan Arsip

Fungsi:

- Mengajukan permohonan arsip.
- Upload dokumen persyaratan.
- Menghasilkan kode permohonan otomatis.

---

## 2.4 Cek Status

Fungsi:

- Melihat perkembangan permohonan.
- Melihat riwayat status.
- Mengetahui alasan penolakan apabila ada.

---

## 2.5 Unduh Arsip

Fungsi:

- Mengunduh arsip yang telah disetujui.
- Membatasi akses menggunakan token atau kode permohonan.

---

## 2.6 Verifikasi QR Code

Fungsi:

- Memverifikasi keaslian dokumen.
- Menampilkan informasi dokumen.

---

# 3. Modul Portal Internal

## 3.1 Dashboard

Fungsi:

- Ringkasan statistik.
- Aktivitas terbaru.
- Informasi penting.

---

## 3.2 Master Data

Sub Modul:

- Unit Organisasi
- Klasifikasi Arsip
- Jenis Arsip
- Media Arsip
- Jadwal Retensi Arsip (JRA)

---

## 3.3 Repository Arsip

Fungsi:

- CRUD Arsip
- Upload Dokumen
- Metadata Arsip
- Riwayat Arsip
- Preview Dokumen

---

## 3.4 Record Center

Fungsi:

- Menyimpan arsip inaktif.
- Monitoring perpindahan arsip.

---

## 3.5 Retensi Arsip

Fungsi:

- Monitoring masa retensi.
- Penandaan arsip jatuh tempo.
- Riwayat retensi.

---

## 3.6 Pemusnahan Arsip

Fungsi:

- Pengajuan pemusnahan.
- Persetujuan.
- Riwayat pemusnahan.

---

## 3.7 Permohonan Arsip

Fungsi:

- Verifikasi permohonan.
- Persetujuan.
- Penolakan.
- Distribusi arsip.

---

## 3.8 Pengguna

Fungsi:

- CRUD Pengguna.
- Reset Password.
- Aktivasi akun.
- Nonaktifkan akun.

---

## 3.9 Role & Permission

Fungsi:

- CRUD Role.
- CRUD Permission.
- Mapping Role.
- Mapping Permission.

---

## 3.10 Audit Log

Fungsi:

- Mencatat aktivitas sistem.
- Filter aktivitas.
- Detail aktivitas.

---

## 3.11 Dashboard Statistik

Fungsi:

- Statistik arsip.
- Statistik permohonan.
- Statistik pengguna.
- Statistik aktivitas.

---

## 3.12 Pengaturan Sistem

Sub Modul:

- Profil Instansi
- Email
- Storage
- OCR
- AI
- TTE
- Meilisearch
- Backup
- Konfigurasi Umum

---

## 3.13 Profil Saya

Fungsi:

- Edit Profil.
- Ganti Password.
- Logout.

---

# 4. Modul Integrasi

## OCR

Status:

OCR Ready

Fungsi:

- Menyiapkan ekstraksi metadata dokumen.

---

## AI

Status:

AI Ready

Fungsi:

- Menyiapkan klasifikasi arsip otomatis.
- Menyiapkan analisis metadata.

---

## TTE

Status:

Mock Provider

Fungsi:

- Menyiapkan integrasi dengan BSrE/PSrE.
- Penandatanganan dokumen elektronik.

---

## Meilisearch

Status:

Ready

Fungsi:

- Full Text Search.
- Pencarian metadata.
- Pencarian cepat.

---

# 5. Modul Pendukung

- Email Notification
- QR Code
- PDF Generator
- Local Storage
- Logging
- Queue
- Cache

---

# 6. Prioritas Pengembangan

## Phase 00

- Authentication
- Dashboard
- Role & Permission

---

## Phase 01

- Master Data

---

## Phase 02

- Repository Arsip

---

## Phase 03

- Permohonan Arsip Publik

---

## Phase 04

- Permohonan Internal

---

## Phase 05

- Audit Log

---

## Phase 06

- Dashboard Statistik

---

## Phase 07

- Record Center

---

## Phase 08

- Retensi Arsip

---

## Phase 09

- Pemusnahan Arsip

---

## Phase 10

- QR Code
- PDF

---

## Phase 11

- Meilisearch

---

## Phase 12

- OCR Ready
- AI Ready

---

## Phase 13

- TTE Integration
- Optimasi
- Testing
- Deployment

---

# 7. Kesimpulan

Seluruh modul Sistem LARAS dikembangkan secara modular agar memudahkan pengembangan, pemeliharaan, dan integrasi dengan layanan eksternal. Pembagian modul juga menjadi dasar penyusunan roadmap pengembangan pada setiap phase implementasi.