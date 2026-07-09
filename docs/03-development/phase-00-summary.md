# FONDASI SISTEM (PHASE 00) — RINGKASAN IMPLEMENTASI

Dokumen ini mendokumentasikan hasil instalasi, konfigurasi, dan pembuatan komponen dasar kearsipan LARAS selama Phase 00.

---

## 1. Package yang Dipasang

### Backend (Laravel 13 + PHP 8.4)
- **spatie/laravel-permission** (Manajemen Hak Akses & RBAC)
- **simplesoftwareio/simple-qrcode** (QR Code generator)
- **spatie/browsershot** (Export PDF / Tangkapan layar)
- **meilisearch/meilisearch-php** (Driver mesin pencari Meilisearch)

### Frontend (React 19 + TypeScript + Vite)
- **geist** (Font Geist Sans & Geist Mono)

---

## 2. Struktur Layanan & Service Layer

Untuk mematuhi kaidah Clean Architecture dan Null Object Pattern, didaftarkan Service Interfaces dan Null Service Implementations pada `AppServiceProvider`:
- `OcrServiceInterface` -> `NullOcrService`
- `AiServiceInterface` -> `NullAiService`
- `TteServiceInterface` -> `NullTteService`
- `SearchServiceInterface` -> `NullSearchService`

---

## 3. Database & RBAC

### Migrasi & Konvensi
- Seluruh primary key menggunakan standar `id` (`BIGINT UNSIGNED AUTO_INCREMENT`).
- Penamaan foreign key berakhiran `_id` dan menggunakan `constrained()`.
- Setiap tabel menyertakan `$table->timestamps()`.

### Seeders
- **PermissionSeeder**: Membuat permission dasar (`dashboard.view`, `profile.view`, `profile.update`, `user.view`, `role.view`).
- **RoleSeeder**: Membuat 5 Role utama (`Super Administrator`, `Administrator`, `Arsiparis`, `Pimpinan`, `Pegawai`).
- **UserSeeder**: Mendaftarkan default akun `Super Administrator` (`admin@laras.test` / `password`).

---

## 4. Antarmuka Pengguna & Komponen Global

### Layouts
- **GuestLayout**: Digunakan untuk Landing Page dan proses Auth (Login, Lupa/Reset Password).
- **PublicLayout**: Layout minimalis tanpa sidebar untuk menu publik kearsipan.
- **AppLayout**: Layout ber-sidebar dan header navigasi interaktif.

### Komponen Reusable
- **Umum**: `EmptyState`, `SkeletonCard`, `LoadingOverlay`, `StatusBadge`, `NotFound`, `Forbidden`, `UnderDevelopment`.
- **Card**: `ContentCard`, `StatisticCard`, `QuickAccessCard`, `SystemInformationCard`.
- **Form & Tabel**: `SearchBox`, `ConfirmDialog`, `EmptyTable`, `DataToolbar`.
- **Layout**: `DashboardHeader`, `BreadcrumbComponent`, `PageHeader`, `SectionHeader`, `PageContainer`.

---

## 5. Cara Menjalankan Project

1. **Migrasi dan Seed Database**:
   ```bash
   php artisan migrate:fresh --seed
   ```
2. **Kompilasi Frontend (Development)**:
   ```bash
   npm run dev
   ```
3. **Kompilasi Frontend (Production)**:
   ```bash
   npm run build
   ```
4. **Menjalankan Pengujian**:
   ```bash
   php artisan test
   ```
