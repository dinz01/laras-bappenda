# LARAS

# RBAC Guide

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi pedoman implementasi Role Based Access Control (RBAC) pada Sistem LARAS.

RBAC digunakan untuk mengatur hak akses pengguna berdasarkan Role dan Permission sehingga keamanan sistem tetap terjaga serta mudah dikembangkan.

Seluruh implementasi otorisasi harus mengacu pada dokumen ini.

---

# Ruang Lingkup

Panduan ini mencakup:

- Authentication
- Authorization
- Role
- Permission
- Policy
- Middleware
- React Permission
- API Authorization

---

# Prinsip

RBAC dibangun berdasarkan prinsip berikut:

- Authentication menentukan siapa pengguna.
- Authorization menentukan apa yang boleh dilakukan pengguna.
- Permission diberikan melalui Role.
- Tidak ada hak akses yang ditulis secara hardcode pada Controller maupun React.

---

# Teknologi

RBAC menggunakan package:

**spatie/laravel-permission**

Package ini menjadi standar resmi implementasi Role dan Permission pada LARAS.

Tidak diperbolehkan membuat tabel Role dan Permission sendiri.

---

# Struktur RBAC

```text
User
│
├── memiliki Role
│
└── Role
      │
      └── memiliki Permission
```

---

# User

Setiap User memiliki:

- Unit Organisasi
- Jabatan
- Role

Permission diperoleh dari Role yang dimiliki.

---

# Role

Role digunakan untuk mengelompokkan hak akses.

Contoh:

- Super Admin
- Administrator
- Pimpinan
- Petugas Arsip
- Pegawai

Role tidak menyimpan logika bisnis.

Role hanya menjadi kumpulan Permission.

---

# Permission

Permission harus bersifat spesifik.

Gunakan format:

```text
resource.action
```

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

---

# Penamaan Permission

Gunakan format:

```
modul.aksi
```

Aksi yang direkomendasikan:

- view
- create
- update
- delete
- approve
- reject
- upload
- download
- export
- import
- manage

---

# Policy

Seluruh proses bisnis harus menggunakan Laravel Policy.

Contoh:

```php
ArsipPolicy

WorkflowPolicy

UserPolicy
```

Policy tidak boleh digantikan dengan pengecekan Role secara langsung.

---

# Middleware

Middleware digunakan untuk:

- Authentication
- Permission
- Role

Contoh:

```php
auth

permission:arsip.view

role:Administrator
```

---

# Controller

Controller tidak boleh melakukan pengecekan Role secara manual.

Gunakan:

- authorize()
- Policy
- Middleware

---

# API

Seluruh endpoint API harus dilindungi menggunakan:

- Sanctum Authentication
- Permission
- Policy

Endpoint yang tidak memerlukan login harus ditentukan secara eksplisit.

---

# React

Frontend hanya bertugas menyembunyikan atau menampilkan fitur.

React bukan lapisan keamanan utama.

Contoh:

```tsx
<Can permission="arsip.create">
    <Button />
</Can>
```

Permission tetap harus divalidasi di Backend.

---

# Seeder

Seeder harus membuat:

- Default Role
- Default Permission
- Mapping Role-Permission

Seeder tidak boleh memberikan Permission langsung ke User.

---

# Database

RBAC menggunakan tabel bawaan Spatie:

- roles
- permissions
- model_has_roles
- model_has_permissions
- role_has_permissions

Tidak boleh dimodifikasi kecuali benar-benar diperlukan.

---

# Permission Matrix

Seluruh hak akses mengacu pada:

SUMMARY/PERMISSION_MATRIX.md

Tidak diperbolehkan membuat Permission baru tanpa dokumentasi.

---

# Audit Log

Seluruh aktivitas penting harus tercatat.

Minimal meliputi:

- Login
- Logout
- Create
- Update
- Delete
- Upload
- Download
- Approval
- Reject

---

# Checklist

## Authentication

☐ Login

☐ Logout

☐ Session

☐ Token

---

## Authorization

☐ Role

☐ Permission

☐ Policy

☐ Middleware

---

## Backend

☐ Controller

☐ API

☐ Validation

---

## Frontend

☐ Permission Component

☐ Hidden Menu

☐ Hidden Button

☐ Route Guard

---

## Testing

☐ Role

☐ Permission

☐ Policy

☐ Middleware

☐ API

☐ React

---

# Referensi

- PERMISSION_MATRIX.md
- DATABASE_FINAL.md
- API_STANDARD.md
- CODING_STANDARD.md

---

# Keputusan Final

1. Sistem menggunakan Spatie Laravel Permission sebagai standar RBAC.
2. Permission diberikan melalui Role, bukan langsung ke User.
3. Seluruh otorisasi menggunakan Policy dan Middleware.
4. Frontend hanya mengatur tampilan, bukan keamanan.
5. Dokumen ini menjadi pedoman resmi implementasi RBAC pada Sistem LARAS.