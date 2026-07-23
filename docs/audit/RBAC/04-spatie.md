# LARAS

# Audit Database

Modul : RBAC

Nomor : 04

Nama : Spatie Laravel Permission

Status :

✅ FINAL

---

# Tujuan

Package Spatie Laravel Permission digunakan sebagai implementasi Role Based Access Control (RBAC) pada sistem LARAS.

Package ini bertugas mengelola Role, Permission, relasi User dengan Role, serta relasi Role dengan Permission secara terstandarisasi.

Implementasi mengikuti struktur bawaan package tanpa melakukan perubahan pada tabel inti.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya
- Dokumentasi Package Spatie Laravel Permission

## File yang Diaudit

Migration

- create_permission_tables.php

Konfigurasi

- config/permission.php

---

# Struktur Final

Tabel bawaan yang digunakan:

| Tabel |
|--------|
| roles |
| permissions |
| model_has_roles |
| model_has_permissions |
| role_has_permissions |

---

# Relasi

User

↓

model_has_roles

↓

Roles

↓

role_has_permissions

↓

Permissions

User

↓

model_has_permissions

↓

Permissions

---

# Hasil Audit

## Yang Sudah Sesuai

- Menggunakan struktur tabel bawaan Spatie.
- Mendukung pemberian Role kepada User.
- Mendukung pemberian Permission langsung kepada User.
- Mendukung Permission melalui Role.
- Mendukung multiple guard apabila diperlukan.
- Kompatibel dengan Laravel Authorization.

---

## Temuan Audit

### SPATIE-001 (Informasi)

Tidak diperlukan modifikasi tabel bawaan Spatie.

Keputusan:

Menggunakan seluruh struktur bawaan package.

---

### SPATIE-002 (Medium)

Seluruh pengecekan hak akses harus menggunakan helper Spatie.

Contoh:

can()

hasRole()

hasPermissionTo()

Tidak melakukan query manual ke tabel.

Keputusan:

Menggunakan API resmi Spatie.

---

### SPATIE-003 (Medium)

Role tidak digunakan untuk pengecekan hak akses.

Contoh yang tidak disarankan:

if ($user->hasRole('Admin'))

Apabila yang ingin dicek adalah hak akses.

Yang disarankan:

$user->can('arsip.create')

Role hanya digunakan apabila memang logika bisnis bergantung pada jabatan atau peran tertentu.

---

### SPATIE-004 (High)

Permission wajib dibuat melalui Seeder.

Tidak diperbolehkan membuat Permission secara manual di database production.

Keputusan:

Seluruh Permission dibuat menggunakan PermissionSeeder.

---

### SPATIE-005 (Medium)

Cache Permission wajib dibersihkan setiap selesai Seeder.

Menggunakan:

php artisan permission:cache-reset

atau

PermissionRegistrar::class

Keputusan:

Menambahkan proses reset cache pada Seeder.

---

### SPATIE-006 (Informasi)

Seluruh menu React menggunakan Permission.

Menu tidak ditampilkan apabila User tidak memiliki Permission yang sesuai.

Contoh:

Arsip

↓

arsip.view

Master

↓

master.view

Audit Log

↓

auditlog.view

---

# Keputusan Audit

Disetujui:

- Menggunakan struktur bawaan Spatie.
- Tidak mengubah migration bawaan package.
- Menggunakan helper resmi Spatie.
- Seluruh Permission dibuat melalui Seeder.
- Menggunakan cache reset setelah Seeder.
- Seluruh menu menggunakan Permission.

---

# Dampak Implementasi

Migration

☑

Seeder

☑

Model

☑

Middleware

☑

Policy

☑

Controller

☑

React

☑

Testing

☑

---

# Best Practice

Authentication

↓

User

↓

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

# Keputusan Final

1. Menggunakan package Spatie Laravel Permission tanpa modifikasi struktur tabel.
2. Seluruh Role dan Permission dikelola melalui Seeder.
3. Permission menjadi dasar seluruh otorisasi sistem.
4. Role digunakan sebagai pengelompokan Permission.
5. Seluruh pengecekan hak akses menggunakan API resmi Spatie.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.