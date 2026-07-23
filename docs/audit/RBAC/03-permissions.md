# LARAS

# Audit Database

Modul : RBAC

Nomor : 03

Nama : Permissions

Status :

✅ FINAL

---

# Tujuan

Permissions digunakan untuk mengatur hak akses terhadap setiap fitur dalam sistem LARAS.

Permission merupakan unit otorisasi terkecil yang menentukan apakah seorang pengguna dapat melihat, membuat, mengubah, menghapus, menyetujui, atau melakukan tindakan tertentu pada suatu modul.

Implementasi menggunakan package Spatie Laravel Permission.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_permissions_table.php
- create_role_has_permissions_table.php

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

Permissions

belongsToMany

- Roles

belongsToMany

- Users

---

# Hasil Audit

## Yang Sudah Sesuai

- Menggunakan struktur bawaan Spatie Laravel Permission.
- Menggunakan relasi Many-to-Many dengan Roles.
- Mendukung pemberian Permission langsung kepada User apabila diperlukan.
- Tidak memerlukan perubahan struktur tabel.

---

## Temuan Audit

### PERMISSION-001 (High)

Belum terdapat standar penamaan Permission.

Keputusan:

Menggunakan format

modul.aksi

Contoh:

arsip.view

arsip.create

arsip.update

arsip.delete

workflow.approve

workflow.reject

---

### PERMISSION-002 (High)

Permission harus menggambarkan aksi bisnis, bukan menu.

Contoh yang benar:

arsip.create

Bukan:

menu_arsip

---

### PERMISSION-003 (Medium)

Permission harus mengikuti prinsip Least Privilege.

Setiap Role hanya diberikan Permission yang benar-benar diperlukan.

Keputusan:

Permission tidak diberikan secara berlebihan.

---

### PERMISSION-004 (Medium)

Tidak menggunakan wildcard permission.

Contoh yang tidak disarankan:

arsip.*

Keputusan:

Permission diberikan secara eksplisit.

---

### PERMISSION-005 (Informasi)

Permission dapat diberikan langsung kepada User apabila terdapat kebutuhan khusus.

Namun implementasi utama tetap melalui Role.

---

# Keputusan Audit

Disetujui:

- Menggunakan struktur standar Spatie.
- Tidak menambahkan kolom baru.
- Menggunakan format penamaan modul.aksi.
- Permission menjadi dasar seluruh proses otorisasi.
- Role hanya berfungsi sebagai pengelompokan Permission.

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

# Standar Penamaan Permission

Format

modul.aksi

Contoh:

arsip.view

arsip.create

arsip.update

arsip.delete

arsip.restore

workflow.view

workflow.verify

workflow.approve

workflow.reject

dokumen.view

dokumen.upload

dokumen.download

dokumen.delete

auditlog.view

master.view

master.create

master.update

master.delete

user.view

user.create

user.update

user.delete

role.view

role.create

permission.view

permission.create

---

# Matriks Permission

## Arsip

- view
- create
- update
- delete
- restore

## Dokumen

- view
- upload
- download
- delete

## Workflow

- view
- verify
- approve
- reject

## Master Data

- view
- create
- update
- delete

## User

- view
- create
- update
- delete

## Role

- view
- create
- update
- delete

## Permission

- view
- create
- update
- delete

## Audit Log

- view

---

# Keputusan Final

1. Menggunakan tabel Permissions bawaan Spatie.
2. Tidak ada perubahan struktur tabel.
3. Permission menggunakan format modul.aksi.
4. Seluruh otorisasi sistem menggunakan Permission.
5. Role hanya sebagai pengelompokan Permission.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.