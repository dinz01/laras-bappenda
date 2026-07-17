# Laras Bappenda

Sistem Pengelolaan Arsip Daerah berbasis web untuk BAPPENDA.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 13, PHP 8.4 |
| Frontend | React 19 + Inertia.js v3, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MySQL |
| Queue | Database Queue |
| Auth | Laravel Fortify |

## Menjalankan Lokal

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
composer run dev        # Jalankan server + queue + vite sekaligus
```

Aplikasi tersedia di: `https://laras-bappenda.test` (Laravel Herd)

---

## Architecture Overview

### Struktur Direktori

```
app/
├── Enums/             # Enum types (WorkflowStatus, OcrStatus, dll.)
├── Events/            # Domain events (WorkflowTransitioned, dll.)
├── Http/
│   ├── Controllers/   # Thin controllers — validasi + panggil service + return response
│   └── Requests/      # Form Request untuk validasi input
├── Interfaces/        # Interface untuk external services (OCR, Search, TTE, AI)
├── Jobs/              # Queue jobs (ProcessOcrJob)
├── Listeners/         # Event listeners (belum diimplementasikan)
├── Models/            # Eloquent models
├── Policies/          # Authorization policies
├── Providers/         # Service providers + binding interface ke implementasi
└── Services/          # Business logic services
    ├── DocumentUploadService.php   # Upload + ganti file arsip
    ├── DocumentVersionService.php  # Versi dokumen
    ├── WorkflowService.php         # Siklus hidup / tahap arsip
    ├── SearchService.php           # Pencarian arsip full-text
    ├── MockOcrService.php          # Mock OCR (development)
    └── ...                         # Null-object implementations untuk services
```

### Prinsip Arsitektur

1. **Thin Controller** — Controller hanya bertugas menerima request, memanggil service, dan mengembalikan response. Tidak ada business logic di dalam controller.

2. **Service Pattern** — Semua business logic berada di dalam `app/Services/`. Services diinjeksikan ke controller melalui constructor.

3. **Interface Segregation** — External services (OCR, Search, TTE, AI) didaftarkan melalui Interface di `app/Interfaces/`, dan di-bind ke implementasi konkret di `AppServiceProvider`.

4. **Null Object Pattern** — Seluruh external service memiliki implementasi `Null*Service` sehingga fitur tidak rusak saat service sesungguhnya belum dikonfigurasi.

5. **Domain Events** — Setiap transisi status penting (contoh: tahap arsip berubah) mendispatch Event yang dapat didengarkan oleh Listener untuk notifikasi, audit, dll.

6. **Document Versioning** — File dokumen tidak pernah dihapus saat diganti. Versi baru ditambahkan ke tabel `dokumen_arsip_versions`.

7. **Tahap Arsip (Workflow)** — Siklus hidup arsip: `Draft → Review → Disetujui → Arsip Aktif → Retensi → Record Center → Pemusnahan`. Dikendalikan oleh `WorkflowService` menggunakan transition matrix di `WorkflowStatus` enum.

### Keputusan Arsitektur (ADR)

Lihat [`docs/architecture/`](docs/architecture/) untuk dokumentasi keputusan arsitektur:

- [ADR-001: Service Layer](docs/architecture/ADR-001-Service-Layer.md)
- [ADR-002: Document Versioning](docs/architecture/ADR-002-Document-Versioning.md)
- [ADR-003: Tahap Arsip (UI Terminology)](docs/architecture/ADR-003-Tahap-Arsip.md)

---

## Testing

```bash
php artisan test --compact
```

## Code Quality

```bash
vendor/bin/pint --dirty          # PHP code formatter (Laravel Pint)
composer types:check             # Static analysis (Larastan level 7)
npm run lint                     # ESLint untuk TypeScript/React
```
