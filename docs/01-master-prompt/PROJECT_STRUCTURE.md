# PROJECT STRUCTURE — SISTEM LARAS

Dokumen ini menjadi acuan struktur folder proyek. AI wajib mengikuti struktur ini pada setiap phase.

---

# Root Project

```
laras-bappenda/
│
├── app/
├── bootstrap/
├── config/
├── database/
├── docs/
├── public/
├── resources/
├── routes/
├── storage/
├── tests/
└── vendor/
```

---

# Folder app

```
app
│
├── Actions
├── Console
├── Enums
├── Exceptions
├── Helpers
├── Http
│   ├── Controllers
│   ├── Middleware
│   └── Requests
│
├── Interfaces
├── Models
├── Policies
├── Providers
├── Services
├── Traits
└── View
```

---

# Folder resources

```
resources
└── js
    ├── Components
    │   ├── Common
    │   ├── Forms
    │   ├── Tables
    │   ├── Dialogs
    │   └── Layout
    │
    ├── Hooks
    ├── Layouts
    ├── Pages
    ├── Services
    ├── Types
    └── Utils
```

---

# Folder Pages

```
Pages
│
├── Auth
├── Dashboard
├── MasterData
├── RepositoryArsip
├── RecordCenter
├── Retensi
├── Pemusnahan
├── Permohonan
├── Pengguna
├── Role
├── AuditLog
├── Statistik
├── Pengaturan
└── Profil
```

---

# Folder Components

```
Components
│
├── Common
├── Forms
├── Tables
├── Dialogs
├── Cards
├── Badges
├── Breadcrumb
├── EmptyState
├── Loading
└── Layout
```

---

# Folder Services

```
app/Services

ArchiveService

ArchiveRequestService

AuthenticationService

DashboardService

MasterDataService

PermissionService

QRCodeService

PdfService

TteService

OcrService

AiService

SearchService

AuditLogService
```

---

# Folder Interfaces

```
app/Interfaces

TteServiceInterface

OcrServiceInterface

AiServiceInterface

SearchServiceInterface
```

---

# Folder Models

```
User

Archive

ArchiveRequest

Classification

RetentionSchedule

Unit

AuditLog

Role

Permission
```

---

# Folder Routes

```
routes

web.php

auth.php

settings.php
```

Seluruh route modul dikelompokkan menggunakan Route::prefix() dan Route::name().

---

# Folder Database

```
database

factories

migrations

seeders
```

---

# Folder Tests

```
tests

Feature

Unit

Pest.php
```

---

# Folder Storage

```
storage/app/private

archives

requests

generated

temporary

backups
```

Seluruh dokumen disimpan menggunakan Storage Laravel dan tidak boleh diakses langsung melalui URL publik.

---

# Penamaan

## Controller

```
ArchiveController
```

## Service

```
ArchiveService
```

## Request

```
StoreArchiveRequest

UpdateArchiveRequest
```

## Policy

```
ArchivePolicy
```

## Model

```
Archive
```

## Migration

```
create_archives_table
```

## React Page

```
Index.tsx

Create.tsx

Edit.tsx

Show.tsx
```

## React Component

```
ArchiveTable.tsx

ArchiveForm.tsx

ArchiveCard.tsx
```

---

# Aturan

- Jangan mengubah struktur folder tanpa instruksi.
- Seluruh fitur baru mengikuti struktur ini.
- Gunakan penamaan yang konsisten.
- Hindari folder yang tidak diperlukan.
- Semua business logic berada pada folder `app/Services`.
- Semua validasi berada pada folder `app/Http/Requests`.
- Semua komponen React harus reusable apabila memungkinkan.

---

# Kesimpulan

Struktur proyek ini menjadi acuan tetap selama pengembangan Sistem LARAS. AI wajib menjaga konsistensi struktur folder dan penamaan file pada setiap phase.