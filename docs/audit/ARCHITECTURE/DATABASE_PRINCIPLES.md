# LARAS

# Database Principles

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi pedoman utama dalam perancangan, implementasi, dan pemeliharaan database Sistem LARAS.

Seluruh keputusan mengenai struktur database harus mengacu pada dokumen ini agar sistem tetap konsisten, mudah dikembangkan, mudah dipelihara, dan memiliki performa yang baik.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Modul baru di masa mendatang

---

# Prinsip Dasar

Database LARAS dibangun berdasarkan prinsip berikut:

1. Konsisten
2. Terstruktur
3. Normalisasi yang tepat
4. Mudah dipelihara
5. Mudah dikembangkan
6. Memiliki integritas data
7. Mendukung audit
8. Mendukung performa tinggi

---

# Prinsip Desain

## Single Source of Truth

Setiap informasi hanya disimpan pada satu tabel.

Tidak diperbolehkan menyimpan data yang sama pada beberapa tabel apabila dapat direlasikan menggunakan Foreign Key.

---

## Referential Integrity

Seluruh relasi antar tabel wajib menggunakan Foreign Key.

Tidak diperbolehkan menggunakan ID tanpa constraint.

---

## Normalisasi

Minimal memenuhi Third Normal Form (3NF).

Apabila diperlukan untuk performa, denormalisasi harus memiliki alasan yang jelas dan terdokumentasi.

---

## Konsistensi Struktur

Seluruh tabel mengikuti struktur yang seragam.

Contoh:

- id
- created_at
- updated_at
- deleted_at (jika menggunakan Soft Delete)

---

# Primary Key

Seluruh tabel menggunakan:

- BIGINT Unsigned
- Auto Increment

Laravel:

id()

Tidak menggunakan UUID kecuali terdapat kebutuhan khusus yang telah disetujui.

---

# Foreign Key

Seluruh relasi menggunakan:

foreignId()

constrained()

cascadeOnUpdate()

Restriksi penghapusan mengikuti kebutuhan bisnis dan hasil audit.

---

# Soft Delete

Soft Delete digunakan hanya apabila data perlu dipertahankan untuk kebutuhan audit atau riwayat.

Tidak seluruh tabel wajib menggunakan Soft Delete.

Penggunaan Soft Delete harus mengikuti hasil audit.

---

# Timestamp

Seluruh tabel wajib memiliki:

- created_at
- updated_at

Menggunakan:

timestamps()

---

# Audit Trail

Seluruh perubahan data penting harus dapat ditelusuri.

Perubahan dicatat melalui:

- Workflow
- Audit Log

Bukan dengan menambahkan kolom audit pada setiap tabel.

---

# Master Data

Master Data memiliki karakteristik:

- Data relatif stabil.
- Digunakan sebagai referensi.
- Tidak sering berubah.

Contoh:

- Klasifikasi Arsip
- Retensi Arsip
- Unit Organisasi
- Jabatan

---

# Data Operasional

Data Operasional memiliki karakteristik:

- Sering berubah.
- Memiliki riwayat.
- Memiliki relasi kompleks.
- Mendukung Workflow.
- Mendukung Audit Log.

---

# RBAC

Hak akses tidak disimpan pada tabel utama.

Seluruh Role dan Permission menggunakan Spatie Laravel Permission.

---

# Index

Index dibuat berdasarkan kebutuhan query.

Tidak seluruh kolom perlu diberi index.

Prioritas index:

- Foreign Key
- Kode
- Nomor Arsip
- Kolom pencarian
- Kolom filter

Panduan lebih lanjut terdapat pada:

INDEXING_GUIDE.md

---

# Penamaan

Penamaan tabel, kolom, relasi, model, dan migration mengikuti:

NAMING_CONVENTION.md

---

# Migration

Migration harus:

- Mudah dibaca.
- Konsisten.
- Menggunakan Laravel Convention.
- Tidak memiliki struktur duplikat.

Panduan implementasi terdapat pada:

implementation/

---

# Seeder

Seeder digunakan untuk:

- Data referensi.
- Data dummy.
- Testing.
- Demonstrasi sistem.

Seeder tidak boleh menghasilkan data yang tidak valid.

---

# Factory

Factory digunakan untuk:

- Testing.
- Dummy Data.
- Performance Testing.

Factory tidak digunakan sebagai data referensi.

---

# Performance

Prioritas optimasi:

1. Index
2. Eager Loading
3. Pagination
4. Query Optimization
5. Caching (jika diperlukan)

---

# Integritas Data

Integritas data harus dijaga melalui:

- Foreign Key
- Validation
- Transaction
- Policy
- Permission

Tidak diperbolehkan mengandalkan validasi Frontend.

---

# Keamanan

Seluruh operasi database harus:

- Menggunakan Validation
- Menggunakan Authorization
- Menggunakan Policy
- Menggunakan Middleware
- Menggunakan Database Transaction untuk proses multi-tabel

---

# Dokumentasi

Seluruh perubahan struktur database wajib:

- Melalui proses Audit.
- Didokumentasikan.
- Dicatat pada Changelog.

Tidak diperbolehkan mengubah struktur database tanpa dokumentasi.

---

# Checklist

## Database

☐ Konsisten

☐ Ternormalisasi

☐ Memiliki Foreign Key

☐ Memiliki Index

☐ Tidak ada data duplikat

☐ Mudah dipelihara

---

## Migration

☐ Laravel Standard

☐ Foreign Key

☐ Timestamp

☐ Soft Delete sesuai kebutuhan

---

## Model

☐ Relationship

☐ Scope

☐ Cast

☐ Fillable

---

## Performance

☐ Index

☐ Pagination

☐ Search

☐ Filter

☐ Eager Loading

---

## Security

☐ Validation

☐ Policy

☐ Middleware

☐ Permission

☐ Transaction

---

# Keputusan Final

1. Database mengikuti standar Laravel.
2. Seluruh relasi menggunakan Foreign Key.
3. Struktur database mengacu pada hasil Audit.
4. Seluruh implementasi mengacu pada dokumen Architecture.
5. Dokumen ini menjadi pedoman utama seluruh pengembangan database LARAS.