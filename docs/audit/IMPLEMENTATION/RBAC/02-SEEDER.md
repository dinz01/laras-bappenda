# LARAS

# Implementasi

Modul : RBAC

Tahap : Seeder

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Seeder untuk modul RBAC.

Seeder digunakan untuk membuat data awal Role, Permission, serta relasi antara keduanya sehingga sistem siap digunakan setelah proses instalasi.

---

# Referensi

- docs/audit/RBAC/
- docs/audit/SUMMARY/PERMISSION_MATRIX.md
- docs/architecture/RBAC_GUIDE.md
- implementation/03-RBAC/01-SPATIE.md

---

# Ruang Lingkup

Implementasi meliputi:

- Permission Seeder
- Role Seeder
- Role Permission Seeder
- Default User
- Database Seeder

---

# Urutan Seeder

Seeder dijalankan dengan urutan berikut:

```text
PermissionSeeder
        ↓
RoleSeeder
        ↓
RolePermissionSeeder
        ↓
UserSeeder
        ↓
DatabaseSeeder
```

Urutan ini wajib dipertahankan.

---

# Permission Seeder

Permission dibuat berdasarkan:

PERMISSION_MATRIX.md

Contoh:

```text
arsip.view

arsip.create

arsip.update

arsip.delete

dokumen.upload

dokumen.download

workflow.approve

workflow.reject

audit.view

user.manage
```

Checklist

☐ Permission dibuat

☐ Tidak ada duplikasi

☐ Penamaan sesuai standar

---

# Role Seeder

Role default sistem:

☑ Super Admin

☑ Administrator

☑ Pimpinan

☑ Petugas Arsip

☑ Pegawai

Role lain dapat ditambahkan sesuai kebutuhan organisasi.

Checklist

☐ Role dibuat

☐ Nama konsisten

☐ Tidak ada duplikasi

---

# Role Permission Seeder

Permission diberikan kepada setiap Role sesuai:

PERMISSION_MATRIX.md

Contoh:

```text
Administrator

↓

arsip.view

arsip.create

arsip.update

arsip.delete
```

Checklist

☐ Semua Role memiliki Permission

☐ Tidak ada Permission yang belum digunakan

---

# Default User

Minimal dibuat satu akun awal.

Contoh:

```text
Nama

Administrator

Email

admin@laras.local

Password

password
```

Password harus diganti setelah implementasi awal.

Checklist

☐ Default User dibuat

☐ Role berhasil diberikan

---

# Database Seeder

DatabaseSeeder memanggil seluruh Seeder RBAC.

Contoh:

```php
PermissionSeeder::class

RoleSeeder::class

RolePermissionSeeder::class

UserSeeder::class
```

Checklist

☐ DatabaseSeeder diperbarui

☐ Urutan benar

---

# Integrasi

Seeder harus terhubung dengan:

☑ Spatie

☑ User

☑ Role

☑ Permission

---

# Validasi

Pastikan:

☐ Permission berhasil dibuat

☐ Role berhasil dibuat

☐ Role memiliki Permission

☐ User memiliki Role

☐ User memperoleh Permission melalui Role

---

# Testing

## Permission

☐ Semua Permission tersedia

☐ Tidak ada duplikasi

---

## Role

☐ Semua Role tersedia

☐ Mapping benar

---

## User

☐ Default User berhasil login

☐ Role berhasil dimuat

☐ Permission berhasil dimuat

---

## Seeder

☐ migrate:fresh --seed berhasil

☐ Tidak ada error

---

# Output

Output implementasi:

- Seluruh Permission tersedia.
- Seluruh Role tersedia.
- Mapping Role-Permission selesai.
- Default User siap digunakan.
- Database siap memasuki tahap implementasi Model.

---

# Checklist Penyelesaian

☐ Permission Seeder

☐ Role Seeder

☐ Role Permission Seeder

☐ User Seeder

☐ DatabaseSeeder

☐ Testing

☐ Review

☐ Final

---

# Keputusan Final

1. Permission dibuat terlebih dahulu sebelum Role.
2. Role memperoleh hak akses melalui Permission.
3. User memperoleh hak akses melalui Role.
4. DatabaseSeeder menjadi titik masuk seluruh Seeder RBAC.
5. Dokumen ini menjadi pedoman implementasi Seeder pada modul RBAC.