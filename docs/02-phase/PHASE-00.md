# PHASE 00 — FONDASI SISTEM

## Tujuan

Membangun fondasi proyek Sistem LARAS sehingga siap digunakan untuk pengembangan seluruh modul berikutnya.

Phase ini hanya berfokus pada setup dan fondasi aplikasi, bukan implementasi fitur bisnis.

---

# Sebelum Mulai

Baca dan pahami terlebih dahulu dokumen berikut secara berurutan.

docs/00-blueprint/*
docs/01-master-prompt/MASTER_PROMPT.md
docs/01-master-prompt/AI_RULES.md
docs/01-master-prompt/PROJECT_STRUCTURE.md

Seluruh implementasi WAJIB mengikuti dokumen tersebut.

---

# Scope Phase

Kerjakan HANYA pekerjaan berikut.

## Backend

- Konfigurasi Laravel Starter Kit
- Konfigurasi Authentication
- Konfigurasi Inertia
- Konfigurasi React
- Konfigurasi TypeScript
- Konfigurasi Storage
- Konfigurasi Queue
- Konfigurasi Cache
- Konfigurasi Mail

---

## Package

Install dan konfigurasi package berikut.

- spatie/laravel-permission
- simplesoftwareio/simple-qrcode
- spatie/browsershot
- meilisearch/meilisearch-php

Siapkan struktur OCR Ready.

Siapkan struktur AI Ready.

Siapkan struktur TTE Ready menggunakan Service Interface.

Belum mengimplementasikan OCR, AI, maupun TTE.

---

## Frontend

Gunakan

- React
- TypeScript
- Inertia
- Tailwind
- shadcn/ui
- Lucide
- Geist Font

Buat layout dasar aplikasi.

- App Layout
- Guest Layout

---

## Dashboard

Buat Dashboard sederhana berisi.

- Header
- Breadcrumb
- Sidebar
- Topbar
- Placeholder Card

Belum membuat statistik.

---

## Permission

Implementasikan

Spatie Laravel Permission

Role bawaan

- Super Administrator
- Administrator
- Arsiparis
- Pimpinan
- Pegawai

Seeder wajib dibuat.

---

## Struktur Folder

Sesuaikan dengan PROJECT_STRUCTURE.md

---

## Testing

Konfigurasi Pest.

Minimal buat satu Feature Test.

---

## Dokumentasi

Buat dokumentasi singkat mengenai.

- Package yang dipasang
- Struktur folder
- Cara menjalankan project

---

# Jangan Dikerjakan

JANGAN membuat:

- Repository Arsip
- Master Data
- Permohonan
- Audit Log
- Statistik
- QR Verification
- PDF
- OCR
- AI
- Meilisearch
- TTE
- Record Center
- Retensi
- Pemusnahan

Semua itu akan dikerjakan pada phase berikutnya.

---

# Output Wajib

Sesuai kebutuhan phase, hasil implementasi dapat mencakup:

- Migration
- Model
- Seeder
- Factory
- Controller
- Form Request
- Service
- Interface
- Middleware
- Policy
- React Pages
- React Components
- Layout
- Route
- Test
- Dokumentasi

Tidak perlu membuat komponen yang belum digunakan.

---

# Acceptance Criteria

Phase dianggap selesai apabila:

✅ Login berjalan

✅ Logout berjalan

✅ Dashboard tampil

✅ Sidebar tampil

✅ Topbar tampil

✅ Role berhasil dibuat

✅ Permission berhasil dikonfigurasi

✅ Seeder berhasil dijalankan

✅ Inertia berjalan

✅ React berjalan

✅ TypeScript berjalan

✅ shadcn/ui berjalan

✅ Geist Font digunakan

✅ Lucide Icon berjalan

✅ Layout responsif

✅ Pest dapat dijalankan

Tidak boleh mengimplementasikan fitur phase berikutnya.

---

# Instruksi Implementasi

Anda adalah Senior Laravel Architect dan Senior React Engineer.

Ikuti Laravel Best Practice.

Gunakan Clean Architecture.

Gunakan Service Layer.

Business Logic tidak boleh berada di Controller.

Gunakan Form Request untuk validasi.

Gunakan Policy apabila diperlukan.

Gunakan Bahasa Indonesia yang baik dan benar pada seluruh antarmuka.

Gunakan Bahasa Inggris pada kode program.

Jangan melakukan over-engineering.

Apabila terdapat beberapa pilihan implementasi, pilih yang paling sederhana, mudah dipelihara, dan sesuai standar Laravel modern.

Di akhir implementasi, tampilkan:

- Ringkasan pekerjaan
- Daftar file yang dibuat
- Daftar package yang dipasang
- Daftar migration
- Cara menjalankan project
- Catatan apabila terdapat pekerjaan yang belum dapat diselesaikan