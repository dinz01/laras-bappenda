# LARAS

# Implementasi

Modul : RBAC

Tahap : Model

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Model pada modul RBAC.

Model bertanggung jawab menghubungkan User dengan Role dan Permission menggunakan package Spatie Laravel Permission.

Implementasi harus mengikuti hasil Audit dan Architecture yang telah ditetapkan.

---

# Referensi

- docs/audit/RBAC/
- docs/audit/SUMMARY/RBAC_SUMMARY.md
- docs/audit/SUMMARY/PERMISSION_MATRIX.md
- docs/architecture/RBAC_GUIDE.md
- docs/architecture/CODING_STANDARD.md
- implementation/03-RBAC/01-SPATIE.md
- implementation/03-RBAC/02-SEEDER.md

---

# Ruang Lingkup

Implementasi meliputi:

- User Model
- HasRoles Trait
- Relationship
- Attribute
- Scope
- Helper Method

---

# User Model

Model User menjadi pusat autentikasi dan otorisasi sistem.

Checklist

☐ Menggunakan HasRoles

☐ Namespace benar

☐ Fillable diperbarui

☐ Hidden diperbarui

☐ Cast diperbarui

---

# Trait

Tambahkan trait berikut:

```php
use HasRoles;
```

Contoh:

```php
class User extends Authenticatable
{
    use HasRoles;
}
```

Checklist

☐ Trait berhasil digunakan

☐ Tidak terjadi konflik trait

---

# Fillable

Pastikan field berikut dapat diisi:

☑ nama

☑ email

☑ password

☑ unit_organisasi_id

☑ jabatan_id

☑ status

Field lain disesuaikan dengan hasil audit.

---

# Hidden

Minimal sembunyikan:

☑ password

☑ remember_token

---

# Cast

Gunakan cast bawaan Laravel.

Contoh:

```php
protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
];
```

Checklist

☐ Cast benar

☐ Password menggunakan hashed

---

# Relationship

User memiliki relasi:

BelongsTo

↓

Unit Organisasi

BelongsTo

↓

Jabatan

Role dan Permission tidak dibuat manual karena sudah disediakan oleh Spatie.

Checklist

☐ Relationship Unit Organisasi

☐ Relationship Jabatan

☐ HasRoles aktif

---

# Scope

Apabila diperlukan, gunakan Scope.

Contoh:

```php
scopeActive()

scopeByUnit()

scopeByRole()
```

Checklist

☐ Scope konsisten

☐ Tidak membuat query berulang

---

# Helper Method

Tambahkan helper apabila diperlukan.

Contoh:

```php
isSuperAdmin()

isAdministrator()

isPimpinan()

hasPermission()
```

Gunakan helper seperlunya.

Hindari logika yang berlebihan pada Model.

---

# Authorization

Model tidak melakukan pengecekan hak akses.

Authorization dilakukan melalui:

☑ Policy

☑ Middleware

☑ authorize()

---

# Integrasi

Model terhubung dengan:

☑ Authentication

☑ Role

☑ Permission

☑ Unit Organisasi

☑ Jabatan

---

# Validasi

Pastikan:

☐ User dapat memiliki Role

☐ User memperoleh Permission

☐ Relationship berjalan

☐ Fillable benar

☐ Cast benar

---

# Testing

## User

☐ CRUD User

☐ Assign Role

☐ Remove Role

☐ Sync Role

---

## Permission

☐ hasRole()

☐ hasPermissionTo()

☐ can()

---

## Relationship

☐ Unit Organisasi

☐ Jabatan

---

# Output

Output implementasi:

- User terhubung dengan Spatie.
- Relationship User lengkap.
- Helper tersedia.
- Model siap digunakan oleh Policy dan Middleware.

---

# Checklist Penyelesaian

☐ Update User Model

☐ Tambah HasRoles

☐ Relationship

☐ Scope

☐ Helper

☐ Testing

☐ Review

☐ Final

---

# Keputusan Final

1. User menjadi pusat autentikasi dan otorisasi.
2. Role dan Permission dikelola melalui Spatie.
3. Relationship User mengikuti hasil Audit Database.
4. Authorization tidak ditulis pada Model.
5. Dokumen ini menjadi pedoman implementasi Model RBAC.