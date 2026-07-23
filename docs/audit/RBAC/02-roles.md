# LARAS

# Audit Database

Modul : RBAC

Nomor : 02

Nama : Roles

Status :

✅ FINAL

---

# Tujuan

Roles digunakan untuk mengelompokkan hak akses pengguna berdasarkan fungsi dan tanggung jawab dalam organisasi.

Role tidak menyimpan hak akses secara langsung, tetapi menjadi kumpulan (grouping) dari beberapa permission.

Implementasi Role menggunakan package Spatie Laravel Permission.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_roles_table.php
- create_model_has_roles_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| name |
| guard_name |
| created_at |
| updated_at |

---

# Relasi

Roles

belongsToMany

- Permissions

belongsToMany

- Users

---

# Hasil Audit

## Yang Sudah Sesuai

- Menggunakan struktur bawaan Spatie Laravel Permission.
- Menggunakan guard_name.
- Relasi Many-to-Many dengan Users.
- Relasi Many-to-Many dengan Permissions.
- Tidak memerlukan perubahan struktur tabel.

---

## Temuan Audit

### ROLE-001 (Informasi)

Tidak diperlukan penambahan kolom:

- deskripsi
- status
- warna
- icon

Role hanya berfungsi sebagai pengelompokan permission.

Keputusan:

Tetap menggunakan struktur standar Spatie.

---

### ROLE-002 (Informasi)

Nama role harus menggunakan format konsisten.

Contoh:

- Super Admin
- Admin Arsip
- Kepala Bidang
- Kepala Sub Bidang
- Petugas Arsip
- Peminjam

Tidak menggunakan singkatan yang sulit dipahami.

---

### ROLE-003 (Medium)

Role tidak boleh digunakan sebagai dasar logika bisnis.

Contoh yang tidak disarankan:

if (role == "Admin")

Yang disarankan:

if (user->can('arsip.create'))

Keputusan:

Seluruh pengecekan hak akses menggunakan Permission.

Role hanya sebagai grouping.

---

### ROLE-004 (Informasi)

Satu User dapat memiliki lebih dari satu Role apabila dibutuhkan.

Namun pada implementasi LARAS disarankan menggunakan satu Role utama agar administrasi lebih sederhana.

---

# Keputusan Audit

Disetujui:

- Tetap menggunakan struktur standar Spatie.
- Tidak menambah kolom baru.
- Role hanya sebagai grouping Permission.
- Seluruh otorisasi menggunakan Permission.

---

# Dampak Implementasi

Migration

☑

Model

☑

Seeder

☑

Factory

☒

Request

☒

Controller

☑

Policy

☑

Middleware

☑

React

☑

Testing

☑

---

# Matriks Role

| Role | Deskripsi |
|------|-----------|
| Super Admin | Mengelola seluruh sistem |
| Admin Arsip | Mengelola arsip dan master data |
| Kepala Bidang | Menyetujui proses sesuai kewenangan |
| Kepala Sub Bidang | Verifikasi dan monitoring |
| Petugas Arsip | Input dan pengelolaan arsip |
| Peminjam | Mengajukan permohonan peminjaman arsip |

---

# Keputusan Final

1. Menggunakan tabel Roles bawaan Spatie.
2. Tidak ada perubahan struktur tabel.
3. Role digunakan sebagai pengelompokan Permission.
4. Otorisasi sistem menggunakan Permission.
5. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.