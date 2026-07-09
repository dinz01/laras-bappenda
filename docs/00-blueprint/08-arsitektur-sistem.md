---
kode: BP-08
judul: Arsitektur Sistem
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-08 — Arsitektur Sistem

## 1. Pendahuluan

Dokumen ini menjelaskan arsitektur teknis Sistem LARAS sebagai acuan pengembangan menggunakan Laravel, React, Inertia.js, dan MySQL. Arsitektur dirancang modular, mudah dipelihara, serta siap dikembangkan pada masa mendatang.

---

# 2. Arsitektur Tingkat Tinggi

```
Browser
    │
    ▼
React + Inertia.js
    │
    ▼
Laravel Application
    │
    ├── Controller
    ├── Request
    ├── Service
    ├── Policy
    ├── Model
    └── Resource
    │
    ▼
MySQL Database
    │
    ├── Local Storage
    ├── Queue
    ├── Cache
    ├── Meilisearch
    ├── OCR (Ready)
    ├── AI (Ready)
    └── TTE (Ready)
```

---

# 3. Teknologi

## Backend

- Laravel 13
- PHP 8.4

## Frontend

- React 19
- Inertia.js
- Vite

## Database

- MySQL

## CSS

- Tailwind CSS
- shadcn/ui

## Icon

- Lucide

## Font

- Geist

## Permission

- Spatie Laravel Permission

## Search

- Meilisearch

## PDF

- Browsershot

## QR Code

- Simple QR Code

## Testing

- Pest

---

# 4. Arsitektur Backend

Struktur backend menggunakan pola:

```
Controller
    │
Request
    │
Service
    │
Model
    │
Database
```

Keterangan:

- Controller menangani HTTP Request.
- Request menangani validasi.
- Service menangani logika bisnis.
- Model menangani interaksi database.

---

# 5. Arsitektur Frontend

Frontend menggunakan React dengan Inertia.js.

Struktur halaman:

```
Layouts

Pages

Components

Hooks

Utils

Types
```

Komponen dibuat reusable dan dipisahkan berdasarkan fungsi.

---

# 6. Arsitektur Database

Database menggunakan MySQL.

Kategori tabel:

- Master Data
- Arsip
- Permohonan
- Pengguna
- Role & Permission
- Audit Log
- Konfigurasi Sistem

Relasi menggunakan Foreign Key.

---

# 7. Penyimpanan Dokumen

Versi pertama menggunakan:

- Local Storage Laravel

Struktur penyimpanan:

```
storage/app/private

├── archives
├── requests
├── generated
├── temporary
└── backups
```

Seluruh file diakses melalui aplikasi dan tidak dapat diakses langsung dari browser.

---

# 8. Keamanan Sistem

Sistem menerapkan:

- Authentication
- Authorization
- CSRF Protection
- Password Hashing
- Request Validation
- Policy
- Middleware
- Audit Log

---

# 9. Integrasi Eksternal

## Email

Digunakan untuk:

- Notifikasi
- Reset Password
- Informasi Permohonan

---

## OCR

Status:

OCR Ready

Disiapkan agar dapat membaca metadata dokumen pada phase berikutnya.

---

## AI

Status:

AI Ready

Disiapkan sebagai modul klasifikasi arsip otomatis.

---

## Meilisearch

Digunakan untuk:

- Full Text Search
- Metadata Search

---

## TTE

Status:

Mock Provider

Disiapkan agar dapat diintegrasikan dengan BSrE atau PSrE melalui API.

---

# 10. Prinsip Pengembangan

- Modular
- Reusable
- Maintainable
- Secure
- Scalable
- Service Layer
- Clean Code
- Laravel Best Practice

---

# 11. Struktur Folder Laravel

```
app/

├── Actions
├── Http
├── Models
├── Policies
├── Providers
├── Services
└── Traits
```

---

# 12. Struktur Folder React

```
resources/js

├── Components
├── Layouts
├── Pages
├── Hooks
├── Types
├── Utils
└── Services
```

---

# 13. Kesimpulan

Arsitektur Sistem LARAS dirancang menggunakan Laravel dan React dengan pendekatan modular, service layer, serta pemisahan tanggung jawab yang jelas. Struktur ini memudahkan pengembangan bertahap, integrasi layanan eksternal, dan pemeliharaan sistem dalam jangka panjang.