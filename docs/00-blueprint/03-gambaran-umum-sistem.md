---
kode: BP-03
judul: Gambaran Umum Sistem
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-03 — Gambaran Umum Sistem

## 1. Deskripsi Sistem

LARAS (Layanan Arsip Digital) merupakan sistem informasi berbasis web yang dikembangkan untuk mendukung pengelolaan arsip digital secara terintegrasi. Sistem ini menyediakan fasilitas bagi pengguna internal untuk mengelola arsip, serta menyediakan layanan permohonan arsip secara daring bagi masyarakat atau instansi melalui portal publik.

Sistem dirancang menggunakan arsitektur modular sehingga mudah dikembangkan dan diintegrasikan dengan layanan eksternal seperti Tanda Tangan Elektronik (TTE), Optical Character Recognition (OCR), Artificial Intelligence (AI), dan Meilisearch.

---

# 2. Tujuan Sistem

Tujuan utama Sistem LARAS adalah:

- Mengelola arsip digital secara terpusat.
- Mempermudah penyimpanan arsip.
- Mempermudah pencarian arsip.
- Menyediakan layanan permohonan arsip secara daring.
- Menyediakan pengendalian hak akses pengguna.
- Menyediakan audit log seluruh aktivitas pengguna.
- Mendukung retensi arsip sesuai ketentuan.
- Menyediakan arsitektur yang siap dikembangkan.

---

# 3. Jenis Pengguna

Sistem digunakan oleh dua kelompok pengguna.

## 3.1 Portal Internal

Portal Internal digunakan oleh:

- Super Administrator
- Administrator
- Arsiparis
- Pimpinan
- Pegawai

Portal Internal memiliki akses untuk mengelola seluruh data sesuai hak akses masing-masing.

---

## 3.2 Portal Publik

Portal Publik digunakan oleh:

- Masyarakat
- Instansi Pemerintah
- Lembaga
- Organisasi
- Perusahaan
- Pemohon Arsip lainnya

Portal Publik hanya dapat mengakses layanan yang disediakan tanpa memiliki akses ke data internal.

---

# 4. Gambaran Modul Sistem

Sistem LARAS terdiri atas dua portal utama.

## Portal Internal

- Dashboard
- Manajemen Pengguna
- Manajemen Role dan Permission
- Unit Organisasi
- Klasifikasi Arsip
- Repository Arsip
- Record Center
- Retensi Arsip
- Pemusnahan Arsip
- Permohonan Arsip Internal
- Persetujuan Permohonan
- Audit Log
- Dashboard Statistik
- Pengaturan Sistem

---

## Portal Publik

- Beranda
- Informasi Layanan
- Pengajuan Permohonan Arsip
- Cek Status Permohonan
- Upload Dokumen Persyaratan
- Unduh Arsip
- Verifikasi QR Code
- Kontak
- Bantuan

---

# 5. Arsitektur Tingkat Tinggi

Sistem terdiri atas beberapa komponen utama.

```
Portal Publik
        │
        │
        ▼
Laravel + React (Inertia)
        │
        ▼
Business Service
        │
        ▼
MySQL Database
        │
        ├── Local Storage
        ├── Meilisearch
        ├── OCR (Ready)
        ├── AI (Ready)
        └── TTE (Ready)
```

Seluruh layanan eksternal bersifat modular sehingga dapat diaktifkan tanpa mengubah arsitektur utama sistem.

---

# 6. Teknologi yang Digunakan

## Backend

- Laravel 13
- PHP 8.4

## Frontend

- React 19
- Inertia.js
- Vite

## Database

- MySQL

## UI

- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Geist Font

## Permission

- Spatie Laravel Permission

## PDF

- Browsershot

## QR Code

- Simple QR Code

## Search

- Meilisearch

## Testing

- Pest

---

# 7. Integrasi

Integrasi yang disiapkan.

| Integrasi | Status |
|------------|---------|
| Email | Aktif |
| TTE | Ready |
| OCR | Ready |
| AI | Ready |
| Meilisearch | Ready |
| Local Storage | Aktif |

---

# 8. Prinsip Pengembangan

Pengembangan Sistem LARAS menggunakan prinsip berikut.

- Modular.
- Mudah dipelihara.
- Mudah dikembangkan.
- Aman.
- Sesuai SOP.
- Berbasis Role dan Permission.
- Mengutamakan Bahasa Indonesia.
- Menggunakan standar Laravel.
- Siap integrasi.

---

# 9. Kesimpulan

Sistem LARAS merupakan sistem pengelolaan arsip digital berbasis web yang terdiri atas Portal Internal dan Portal Publik. Sistem dirancang secara modular agar mudah dikembangkan pada masa mendatang serta mendukung integrasi dengan berbagai layanan eksternal tanpa mengubah arsitektur utama.