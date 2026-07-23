# LARAS

# Coding Standard

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi standar penulisan kode pada Sistem LARAS.

Seluruh pengembangan Backend dan Frontend wajib mengikuti standar ini agar kode tetap konsisten, mudah dibaca, mudah diuji, mudah dipelihara, dan mudah dikembangkan.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Dashboard
- Modul baru

---

# Prinsip

Seluruh kode harus memenuhi prinsip berikut:

- Clean Code
- Readable
- Maintainable
- Reusable
- Consistent
- Secure
- Testable

---

# Standar Laravel

Seluruh kode Backend mengikuti Laravel Convention.

Gunakan fitur bawaan Laravel apabila tersedia.

Contoh:

- Form Request
- Policy
- Resource
- Service Container
- Eloquent Relationship
- Queue
- Event
- Notification

Tidak membuat solusi sendiri apabila Laravel telah menyediakan implementasi yang baik.

---

# Clean Code

Kode harus:

- Mudah dibaca.
- Mudah dipahami.
- Tidak memiliki duplikasi.
- Tidak memiliki logika yang berlebihan.

---

# Single Responsibility Principle

Satu class memiliki satu tanggung jawab.

Contoh:

Controller

↓

Mengatur request dan response.

---

Service

↓

Berisi proses bisnis.

---

Repository (jika digunakan)

↓

Mengakses database.

---

# Controller

Controller harus tetap tipis (Thin Controller).

Controller hanya bertugas:

- Memanggil Request
- Memanggil Service atau Model
- Mengembalikan Response

Controller tidak boleh berisi logika bisnis yang kompleks.

---

# Model

Model bertanggung jawab terhadap:

- Relationship
- Scope
- Accessor
- Mutator
- Cast

Model tidak boleh menangani proses bisnis yang kompleks.

---

# Validation

Seluruh validasi dilakukan melalui Form Request.

Tidak menulis validasi langsung di Controller.

---

# Relationship

Gunakan Relationship Eloquent.

Hindari query manual apabila relationship sudah tersedia.

Contoh:

```php
$arsip->klasifikasi;
```

lebih baik daripada:

```php
KlasifikasiArsip::find($arsip->klasifikasi_arsip_id);
```

---

# Query

Gunakan:

- Eager Loading
- Pagination
- Scope

Hindari:

- N+1 Query
- Query berulang
- Raw Query tanpa alasan

---

# Transaction

Gunakan Database Transaction pada proses yang melibatkan lebih dari satu tabel.

Contoh:

- Membuat Arsip
- Upload Dokumen
- Workflow Approval

---

# Error Handling

Gunakan Exception Handling.

Jangan menyembunyikan error.

Seluruh exception penting harus tercatat pada log.

---

# Logging

Gunakan logging untuk:

- Error
- Exception
- Aktivitas penting
- Debugging (selama development)

Hapus log debugging sebelum production.

---

# Security

Seluruh endpoint wajib menggunakan:

- Validation
- Authorization
- Policy
- Middleware

Tidak mempercayai input dari Frontend.

---

# Frontend

Frontend mengikuti:

- React Standard
- TypeScript
- Component Reusable
- Separation of Concern

---

# Comment

Gunakan komentar hanya apabila diperlukan.

Kode yang baik seharusnya dapat dipahami tanpa banyak komentar.

---

# Naming

Seluruh penamaan mengikuti:

NAMING_CONVENTION.md

---

# Formatting

Gunakan:

Laravel Pint

untuk Backend.

Gunakan:

ESLint

Prettier

untuk Frontend.

---

# Git Commit

Gunakan pesan commit yang jelas.

Contoh:

```
feat: add arsip workflow

fix: validation upload dokumen

refactor: simplify arsip controller

docs: update audit documentation

test: add workflow feature test
```

---

# Branch Strategy

Gunakan branch berikut:

```
main

develop

feature/<nama-fitur>

hotfix/<nama-perbaikan>

release/<versi>
```

---

# Testing

Seluruh fitur baru wajib memiliki pengujian.

Minimal:

- Unit Test
- Feature Test
- Manual Test

Bug yang telah diperbaiki wajib diuji ulang.

---

# Code Review

Sebelum merge:

☐ Tidak ada error.

☐ Tidak ada warning penting.

☐ Tidak ada kode duplikat.

☐ Sudah menggunakan Pint.

☐ Sudah lulus Testing.

☐ Dokumentasi diperbarui jika diperlukan.

---

# Checklist

## Backend

☐ Controller tipis

☐ Form Request

☐ Policy

☐ Resource

☐ Relationship

☐ Transaction

☐ Logging

---

## Frontend

☐ Component Reusable

☐ TypeScript

☐ Service Layer

☐ Permission

☐ Responsive

---

## Database

☐ Foreign Key

☐ Index

☐ Soft Delete sesuai kebutuhan

☐ Migration konsisten

---

## Testing

☐ Unit Test

☐ Feature Test

☐ Manual Test

☐ Regression Test

---

## Quality

☐ Laravel Pint

☐ ESLint

☐ Prettier

☐ Tidak ada Dead Code

☐ Tidak ada Duplicate Code

---

# Referensi

- DATABASE_PRINCIPLES.md
- FOREIGN_KEY_GUIDE.md
- INDEXING_GUIDE.md
- NAMING_CONVENTION.md
- RBAC_GUIDE.md
- API_STANDARD.md
- REACT_STANDARD.md

---

# Keputusan Final

1. Seluruh pengembangan mengikuti standar Laravel dan React yang telah ditetapkan.
2. Kode harus mengutamakan keterbacaan, konsistensi, dan kemudahan pemeliharaan.
3. Setiap perubahan wajib melalui pengujian sebelum digabungkan.
4. Dokumentasi harus diperbarui apabila terdapat perubahan arsitektur atau implementasi.
5. Dokumen ini menjadi pedoman resmi penulisan kode pada Sistem LARAS.