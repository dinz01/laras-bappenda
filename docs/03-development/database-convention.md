# Konvensi Pengembangan & Database — LARAS

Dokumen ini mendefinisikan standar database, konvensi penamaan, arsitektur Service Layer, dan penerapan Null Object Pattern pada proyek **LARAS (Layanan Arsip Digital)**.

---

## 1. Standar Database

### Primary Key
- Seluruh tabel wajib menggunakan nama kolom `id`.
- Tipe data: `BIGINT UNSIGNED` (`$table->id()`).
- Bersifat `AUTO_INCREMENT`.
- Dilarang menggunakan UUID sebagai primary key utama di database.

### Foreign Key
- Penamaan kolom foreign key menggunakan format `{singular_table_name}_id`. Contoh: `user_id`, `role_id`, `archive_id`.
- Wajib menggunakan constraint foreign key (`$table->foreignId('user_id')->constrained()`).
- Relasi opsional menggunakan `nullable()` sebelum `constrained()`.

### Timestamp
- Seluruh tabel wajib memiliki kolom `created_at` dan `updated_at` via `$table->timestamps()`.

### Soft Delete
- Hanya digunakan pada tabel yang memang memerlukan mekanisme pemulihan data (misalnya data arsip utama `archives` atau permohonan `archive_requests`).
- Menggunakan `$table->softDeletes()`.
- **Dilarang** menambahkan Soft Delete pada tabel pivot (many-to-many link tables).

---

## 2. Konvensi Penamaan (Naming Conventions)

### Tabel Database (Plural / Jamak)
- Menggunakan snake_case dan berbentuk jamak (plural).
- Contoh:
  - `users`
  - `archives`
  - `archive_requests`
  - `organization_units`
  - `retention_schedules`
  - `audit_logs`

### Model Eloquent (Singular / Tunggal)
- Menggunakan PascalCase dan berbentuk tunggal (singular).
- Contoh:
  - `User`
  - `Archive`
  - `ArchiveRequest`
  - `OrganizationUnit`
  - `RetentionSchedule`
  - `AuditLog`

### Migration
- Menggunakan format standar Laravel: `create_{table_name}_table`.
- Contoh:
  - `create_archives_table`
  - `create_archive_requests_table`

### Seeder
- Menggunakan akhiran `Seeder`.
- Contoh:
  - `RoleSeeder`
  - `PermissionSeeder`
  - `UserSeeder`

### Factory
- Menggunakan akhiran `Factory`.
- Contoh:
  - `ArchiveFactory`
  - `OrganizationUnitFactory`

### Route Names (Kebab/Dot notation)
- Menggunakan dot notation dengan nama resource jamak.
- Contoh:
  - `archives.index`
  - `archives.create`
  - `archives.store`
  - `archives.show`
  - `archives.edit`
  - `archives.update`
  - `archives.destroy`

---

## 3. Arsitektur Pengembangan

### Service Layer & Interfaces
Seluruh business logic dipisahkan dari Controller dan diletakkan di dalam Service Class pada direktori `app/Services/`. 
Interface diletakkan di `app/Interfaces/`.

#### Contoh Struktur Interface & Service:
- `app/Interfaces/OcrServiceInterface` -> `app/Services/OcrService`
- `app/Interfaces/SearchServiceInterface` -> `app/Services/SearchService`

### Null Object Pattern
Untuk modul integrasi eksternal yang belum aktif pada phase awal (seperti OCR, AI, TTE, dan Meilisearch), diimplementasikan kelas "Null Service" yang mengimplementasikan interface bersangkutan tetapi mengembalikan `RuntimeException` yang jelas.

- **OCR**: `NullOcrService` (Melempar exception: `"Fitur OCR belum diimplementasikan."`)
- **AI**: `NullAiService` (Melempar exception: `"Fitur AI belum diimplementasikan."`)
- **TTE**: `NullTteService` (Melempar exception: `"Fitur TTE belum diimplementasikan."`)
- **Search**: `NullSearchService` (Melempar exception: `"Fitur pencarian belum diimplementasikan."`)

Seluruh Null Service ini di-bind ke Interfacenya di dalam `AppServiceProvider`.

---

## 4. Struktur Folder Proyek

Aplikasi mematuhi struktur folder di `PROJECT_STRUCTURE.md`:
- `app/Enums` - Folder penyimpanan PHP Enums.
- `app/Traits` - Folder penyimpanan PHP Traits.
- `app/Interfaces` - Folder penyimpanan Service Interfaces.
- `app/Services` - Folder penyimpanan implementasi Services.
- `resources/js/components/Common` - Komponen React reusable umum.
- `resources/js/components/Forms` - Komponen form input.
- `resources/js/components/Tables` - Komponen visualisasi data/tabel.
- `resources/js/components/Dialogs` - Komponen modal dialog.
- `resources/js/components/Cards` - Komponen kartu informasi.
- `resources/js/components/Layout` - Komponen pembentuk layout antarmuka.
- `resources/js/utils` - Helper / utility scripts frontend.
