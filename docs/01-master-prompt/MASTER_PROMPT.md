# MASTER PROMPT — SISTEM LARAS

## Identitas Proyek

Nama Sistem:

LARAS (Layanan Arsip Digital)

Jenis Sistem:

Sistem Informasi Pengelolaan Arsip Digital berbasis Web.

Tujuan:

Membangun sistem pengelolaan arsip digital yang modern, modular, aman, dan sesuai SOP organisasi serta siap digunakan pada lingkungan produksi.

---

# Stack Teknologi

Backend

- Laravel Framework 13
- PHP 8.4

Frontend

- React 19
- Inertia.js
- Vite

Database

- MySQL

Authentication

- Laravel Starter Kit

Authorization

- Spatie Laravel Permission

CSS

- Tailwind CSS
- shadcn/ui

Icon

- Lucide

Font

- Geist

Search

- Meilisearch

PDF

- Browsershot

QR Code

- Simple QR Code

Testing

- Pest

Storage

- Local Storage Laravel

OCR

- OCR Ready

AI

- AI Ready

TTE

- Mock Provider (BSrE/PSrE Ready)

---

# Bahasa

Seluruh aplikasi menggunakan Bahasa Indonesia yang baik dan benar.

Seluruh:

- Label
- Tombol
- Validasi
- Notifikasi
- Email
- Placeholder
- Tooltip
- Dialog
- Dokumentasi

menggunakan Bahasa Indonesia.

Nama class, function, variable, table, migration, dan kode program tetap menggunakan Bahasa Inggris mengikuti standar Laravel.

---

# Arsitektur

Gunakan arsitektur Laravel modern.

Controller

↓

Form Request

↓

Service

↓

Model

↓

Database

Business Logic tidak boleh ditulis di Controller.

---

# Frontend

Gunakan:

- React
- Inertia
- TypeScript
- shadcn/ui
- Tailwind CSS

Komponen harus reusable.

Pisahkan:

- Pages
- Components
- Layouts
- Hooks
- Utils
- Types

---

# Permission

Gunakan:

Spatie Laravel Permission.

Seluruh halaman harus memiliki authorization.

Jangan melakukan pengecekan Role secara manual apabila dapat menggunakan Permission.

---

# UI

Tema:

- Minimalis
- Modern
- Profesional
- Bersih
- Konsisten

Gunakan:

- Card
- Dialog
- Drawer
- Data Table
- Breadcrumb
- Toast
- Badge
- Pagination

Hindari penggunaan warna yang berlebihan.

---

# Database

Gunakan:

- Migration
- Foreign Key
- Soft Delete apabila diperlukan
- Timestamp Laravel

Seluruh relasi menggunakan Eloquent Relationship.

---

# Dokumentasi

Setiap phase harus menghasilkan dokumentasi singkat mengenai:

- Tujuan
- File yang dibuat
- Database yang berubah
- Cara penggunaan

---

# Testing

Gunakan Pest.

Minimal membuat Feature Test untuk fitur utama.

---

# Integrasi

Implementasi dilakukan bertahap.

Versi awal:

- Email aktif
- QR aktif
- PDF aktif

Sedangkan:

- OCR
- AI
- TTE
- Meilisearch

dibuat modular sehingga implementasi dapat dilakukan pada phase berikutnya.

---

# Blueprint

Seluruh implementasi WAJIB mengikuti dokumen Blueprint pada folder:

docs/00-blueprint

Apabila terdapat konflik antara implementasi dan Blueprint, maka Blueprint menjadi acuan utama.

---

# Aturan Penting

AI hanya boleh mengerjakan phase yang sedang dikerjakan.

AI tidak boleh mengimplementasikan phase berikutnya.

AI tidak boleh mengubah fitur yang telah selesai tanpa instruksi.

AI harus menjaga konsistensi struktur project.

AI harus mengikuti Laravel Best Practice.

AI harus menghasilkan kode yang bersih, mudah dipahami, dan siap production.