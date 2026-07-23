    # LARAS

# Naming Convention

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi pedoman penamaan (Naming Convention) pada seluruh proyek Sistem LARAS.

Standar penamaan diterapkan agar seluruh kode, struktur database, API, dan Frontend memiliki konsistensi sehingga mudah dipahami, dipelihara, dan dikembangkan.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Modul baru

---

# Ruang Lingkup

Panduan ini mencakup:

- Database
- Migration
- Model
- Controller
- Request
- Resource
- Seeder
- Factory
- API
- React
- File Storage
- Variable
- Function

---

# Prinsip

Seluruh penamaan harus:

- Konsisten
- Deskriptif
- Mudah dipahami
- Mengikuti standar Laravel
- Menggunakan Bahasa Inggris untuk kode program
- Menggunakan Bahasa Indonesia untuk data bisnis apabila diperlukan

---

# Database

## Nama Tabel

Gunakan:

snake_case

jamak (plural)

Contoh:

```text
users
arsip
dokumen_arsip
versi_dokumen
workflow
audit_logs
```

---

## Nama Kolom

Gunakan:

snake_case

Contoh:

```text
nomor_arsip
kode
nama
deskripsi
created_at
updated_at
deleted_at
```

---

## Foreign Key

Gunakan:

```text
<nama_tabel_tunggal>_id
```

Contoh:

```text
jenis_arsip_id
klasifikasi_arsip_id
retensi_arsip_id
status_arsip_id
media_arsip_id
unit_organisasi_id
jabatan_id
```

---

## Pivot Table

Gunakan:

urutan alfabet.

Contoh:

```text
permission_role
role_user
```

Apabila menggunakan Spatie:

Gunakan tabel bawaan package.

---

# Migration

Format:

```text
create_users_table

create_arsip_table

add_status_arsip_id_to_arsip_table
```

---

# Model

Gunakan:

PascalCase

Singular.

Contoh:

```text
User

Arsip

DokumenArsip

VersiDokumen

Workflow

AuditLog
```

---

# Controller

Gunakan:

PascalCase

akhiran Controller.

Contoh:

```text
ArsipController

DokumenArsipController

WorkflowController
```

---

# Request

Gunakan:

Store

Update

Contoh:

```text
StoreArsipRequest

UpdateArsipRequest

StoreDokumenArsipRequest
```

---

# Resource

Gunakan:

```text
ArsipResource

ArsipCollection

WorkflowResource
```

---

# Seeder

Gunakan:

```text
ArsipSeeder

WorkflowSeeder

StatusArsipSeeder
```

---

# Factory

Gunakan:

```text
ArsipFactory

WorkflowFactory
```

---

# Policy

Gunakan:

```text
ArsipPolicy

WorkflowPolicy
```

---

# Middleware

Gunakan:

```text
CheckPermission

CheckUnitOrganisasi
```

---

# Route

Gunakan:

kebab-case

Contoh:

```text
/arsip

/dokumen-arsip

/versi-dokumen

/audit-log
```

---

# API Endpoint

Gunakan:

```text
/api/v1/arsip

/api/v1/dokumen-arsip

/api/v1/workflow
```

Tidak menggunakan nama database secara langsung.

---

# React

## Folder

Gunakan:

PascalCase

Contoh:

```text
Pages/

Components/

Layouts/

Services/
```

---

## Component

Gunakan:

PascalCase

Contoh:

```text
ArsipTable

WorkflowTimeline

UploadDialog
```

---

## Hook

Gunakan:

camelCase

diawali use

Contoh:

```text
useArsip()

useWorkflow()

usePermission()
```

---

## Function

Gunakan:

camelCase

Contoh:

```text
createArsip()

updateWorkflow()

deleteDokumen()
```

---

## Variable

Gunakan:

camelCase

Contoh:

```text
arsip

workflowList

currentUser
```

---

## Constant

Gunakan:

UPPER_SNAKE_CASE

Contoh:

```text
MAX_UPLOAD_SIZE

DEFAULT_PAGE_SIZE
```

---

# File Storage

Gunakan struktur berikut:

```text
storage/

arsip/

dokumen/

versi/

thumbnail/
```

Nama file disimpan menggunakan UUID atau hash untuk menghindari benturan nama.

---

# Enum

Gunakan:

PascalCase

Contoh:

```text
StatusArsip

WorkflowStatus
```

---

# Checklist

## Database

☐ Nama tabel konsisten

☐ Nama kolom konsisten

☐ Foreign Key sesuai standar

---

## Backend

☐ Model

☐ Controller

☐ Request

☐ Resource

☐ Policy

☐ Seeder

☐ Factory

---

## Frontend

☐ Component

☐ Hook

☐ Service

☐ Page

☐ Route

---

## API

☐ Endpoint konsisten

☐ Resource konsisten

☐ Response konsisten

---

# Referensi

- DATABASE_PRINCIPLES.md
- FOREIGN_KEY_GUIDE.md
- API_STANDARD.md
- REACT_STANDARD.md
- CODING_STANDARD.md

---

# Keputusan Final

1. Seluruh proyek menggunakan standar penamaan Laravel.
2. Penamaan harus konsisten di seluruh lapisan aplikasi.
3. Nama database, backend, frontend, dan API harus saling selaras.
4. Tidak diperbolehkan menggunakan singkatan yang tidak terdokumentasi.
5. Dokumen ini menjadi pedoman resmi penamaan pada Sistem LARAS.