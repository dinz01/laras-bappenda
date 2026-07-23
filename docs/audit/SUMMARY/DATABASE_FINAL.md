# LARAS

# Database Final Specification

Status

✅ FINAL

---

# Tujuan

Dokumen ini merupakan spesifikasi final database Sistem LARAS.

Seluruh keputusan audit yang telah disepakati pada tahap audit dituangkan ke dalam dokumen ini sebagai acuan resmi implementasi.

Dokumen ini menjadi referensi utama pada proses:

- Revisi Migration
- Model
- Seeder
- Factory
- Request
- Controller
- API
- React
- Testing
- Maintenance

---

# Ruang Lingkup

Database LARAS terdiri dari tiga kelompok utama:

- Master Data
- Operasional
- RBAC

Seluruh tabel telah melalui proses audit dan review.

---

# Statistik Database

| Modul | Jumlah |
|--------|--------|
| Master | 13 |
| Operasional | 5 |
| RBAC | 4 |

Total

22 tabel utama

---

# Arsitektur Database

MASTER

↓

OPERASIONAL

↓

RBAC

↓

API

↓

React

---

# Prinsip Database

Database LARAS menerapkan prinsip:

- Third Normal Form (3NF)
- Foreign Key Constraint
- Referential Integrity
- Soft Delete pada tabel yang diperlukan
- Audit Trail
- Versioning Dokumen
- Role Based Access Control

---

# Standar Penamaan

Tabel

snake_case

Kolom

snake_case

Primary Key

id

Foreign Key

*_id

Timestamp

created_at

updated_at

Soft Delete

deleted_at

---

# Standar Relationship

One to Many

hasMany

Many to One

belongsTo

Many to Many

belongsToMany

---

# Standar Foreign Key

Master

↓

Restrict

Operasional

↓

Cascade

Pivot

↓

Cascade

Audit Log

↓

Set Null / Restrict sesuai kebutuhan

---

# Standar Index

Index digunakan pada:

- seluruh foreign key
- kode
- nomor arsip
- email
- status
- created_at

---

# Standar Soft Delete

Menggunakan Soft Delete hanya pada tabel yang memiliki nilai historis.

Master referensi dapat menggunakan hard delete apabila belum digunakan oleh data operasional.

---

# Audit Trail

Audit dilakukan menggunakan:

Audit Log

Tidak menambahkan created_by, updated_by, deleted_by pada seluruh tabel kecuali memang diperlukan oleh proses bisnis.

---

# Versioning

Versioning diterapkan pada:

Versi Dokumen

Bukan pada Arsip.

---

# RBAC

Menggunakan:

Spatie Laravel Permission

Role

↓

Permission

↓

Policy

↓

Middleware

↓

Controller

↓

React

---

# Implementasi

Implementasi dilakukan setelah seluruh audit selesai.

Tahapan implementasi:

1. Migration
2. Model
3. Seeder
4. Factory
5. Request
6. Controller
7. API
8. React
9. Testing
10. Refactor

---

# Dokumen Pendukung

Audit mengacu pada:

- README.md
- AUDIT ROADMAP
- DATABASE CHECKLIST
- MASTER
- OPERASIONAL
- RBAC
- RELATIONSHIP MATRIX
- PERMISSION MATRIX
- MASTER SUMMARY
- OPERASIONAL SUMMARY
- RBAC SUMMARY

---

# Keputusan Final

1. Seluruh audit database dinyatakan selesai.
2. Struktur database telah ditetapkan sebagai acuan resmi implementasi.
3. Seluruh implementasi wajib mengacu pada dokumen audit.
4. Perubahan struktur setelah implementasi harus melalui proses audit ulang.