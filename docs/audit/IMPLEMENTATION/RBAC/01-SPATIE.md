# LARAS

# Implementasi

Modul : RBAC

Tahap : Spatie Laravel Permission

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi package **Spatie Laravel Permission** sebagai dasar sistem Role Based Access Control (RBAC) pada Sistem LARAS.

Seluruh fitur otorisasi sistem menggunakan package ini dan mengacu pada hasil Audit serta Architecture yang telah disusun sebelumnya.

---

# Referensi

- docs/audit/RBAC/
- docs/audit/SUMMARY/RBAC_SUMMARY.md
- docs/audit/SUMMARY/PERMISSION_MATRIX.md
- docs/architecture/RBAC_GUIDE.md
- docs/architecture/CODING_STANDARD.md

---

# Ruang Lingkup

Implementasi meliputi:

- Install Package
- Publish Migration
- Publish Config
- Konfigurasi User Model
- Konfigurasi Guard
- Permission Cache
- Testing

---

# Install Package

## Install

```bash
composer require spatie/laravel-permission
```

Status

☐ Belum

☐ Selesai

---

## Publish Migration

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

Status

☐ Belum

☐ Selesai

---

## Publish Config

```bash
php artisan vendor:publish --tag="permission-config"
```

Status

☐ Belum

☐ Selesai

---

# Migration

Pastikan migration menghasilkan tabel:

☐ roles

☐ permissions

☐ model_has_roles

☐ model_has_permissions

☐ role_has_permissions

Tidak diperbolehkan mengubah struktur bawaan kecuali terdapat keputusan audit.

---

# User Model

Tambahkan trait:

```php
use HasRoles;
```

```php
class User extends Authenticatable
{
    use HasRoles;
}
```

Checklist

☐ Trait ditambahkan

☐ Namespace benar

☐ Tidak terjadi konflik trait

---

# Authentication Guard

Gunakan guard:

```php
web
```

Apabila API menggunakan Sanctum, sesuaikan konfigurasi guard tanpa mengubah struktur Role dan Permission.

Checklist

☐ Guard sesuai

☐ Config telah diperbarui

---

# Permission Cache

Gunakan cache bawaan Spatie.

Saat perubahan Role atau Permission:

```bash
php artisan permission:cache-reset
```

Checklist

☐ Cache berhasil direset

☐ Permission diperbarui

---

# Seeder Dependency

Urutan implementasi:

```text
Spatie
    ↓
Permission Seeder
    ↓
Role Seeder
    ↓
Assign Permission
    ↓
Assign Role
```

Seeder tidak boleh dijalankan sebelum instalasi Spatie selesai.

---

# Integrasi Model

Model yang menggunakan Permission:

☐ User

Model lain tidak menggunakan trait HasRoles.

---

# Integrasi Backend

Pastikan:

☐ Controller menggunakan authorize()

☐ Policy aktif

☐ Middleware aktif

☐ Permission tidak dicek manual

---

# Integrasi Frontend

React hanya menggunakan Permission untuk:

☐ Menu

☐ Button

☐ Route

☐ Action

Frontend bukan lapisan keamanan utama.

---

# Testing

## Instalasi

☐ Package berhasil diinstal

☐ Config berhasil dipublish

☐ Migration berhasil

---

## Database

☐ Tabel roles tersedia

☐ Tabel permissions tersedia

☐ Pivot table tersedia

---

## User

☐ User memiliki Role

☐ User memiliki Permission melalui Role

---

## Permission

☐ Permission dapat diberikan

☐ Permission dapat dicabut

☐ Cache berjalan

---

## Authorization

☐ Policy berjalan

☐ Middleware berjalan

☐ authorize() berjalan

---

# Output

Output implementasi:

- Package Spatie berhasil diinstal.
- Struktur database RBAC tersedia.
- User dapat memiliki Role.
- Role dapat memiliki Permission.
- Sistem siap memasuki tahap Seeder.

---

# Checklist Penyelesaian

☐ Install Package

☐ Publish Migration

☐ Publish Config

☐ Update User Model

☐ Konfigurasi Guard

☐ Reset Cache

☐ Testing

☐ Review

☐ Final

---

# Keputusan Final

1. Sistem RBAC menggunakan Spatie Laravel Permission.
2. Tidak membuat tabel Role dan Permission sendiri.
3. User memperoleh hak akses melalui Role.
4. Permission dikelola melalui Seeder.
5. Dokumen ini menjadi dasar implementasi seluruh modul RBAC.