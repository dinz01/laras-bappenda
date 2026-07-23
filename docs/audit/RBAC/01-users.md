# LARAS

# Audit Database

Modul : RBAC

Nomor : 01

Nama : Users

Status :

✅ FINAL

---

# Tujuan

Tabel Users digunakan untuk menyimpan data pengguna yang dapat mengakses sistem LARAS.

Setiap pengguna memiliki identitas akun yang terhubung dengan struktur organisasi, jabatan, role, dan permission.

Tabel ini menjadi pusat autentikasi (Authentication) sekaligus dasar penerapan Role Based Access Control (RBAC).

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_users_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| name |
| email |
| email_verified_at |
| password |
| unit_organisasi_id |
| jabatan_id |
| status |
| remember_token |
| created_at |
| updated_at |

---

# Relasi

Users

belongsTo

- Unit Organisasi
- Jabatan

hasMany

- Arsip (created_by)
- Dokumen Arsip (uploaded_by)
- Workflow (user_id)
- Audit Log (user_id)

hasRoles

- Roles

hasPermissions

- Permissions

---

# Hasil Audit

## Yang Sudah Sesuai

- Menggunakan struktur autentikasi standar Laravel.
- Menggunakan email sebagai identitas login.
- Mendukung verifikasi email.
- Menggunakan remember_token.
- Kompatibel dengan Laravel Authentication.
- Kompatibel dengan Spatie Permission.

---

## Temuan Audit

### RBAC-001 (High)

Belum terdapat relasi

unit_organisasi_id

Padahal setiap pengguna berasal dari satu Unit Organisasi.

Keputusan:

Menambahkan Foreign Key

unit_organisasi_id

---

### RBAC-002 (High)

Belum terdapat relasi

jabatan_id

Padahal struktur organisasi membutuhkan informasi jabatan pengguna.

Keputusan:

Menambahkan Foreign Key

jabatan_id

---

### RBAC-003 (Medium)

Belum terdapat status akun.

Keputusan:

Menambahkan kolom

status

Contoh nilai:

- aktif
- nonaktif

User tidak dihapus apabila sudah tidak bertugas, tetapi cukup dinonaktifkan.

---

### RBAC-004 (Low)

Kolom foto/avatar tidak diperlukan.

Sistem LARAS merupakan aplikasi administrasi pemerintahan sehingga identitas visual pengguna bukan merupakan kebutuhan utama.

Keputusan:

Tidak menambahkan kolom avatar.

---

### RBAC-005 (Informasi)

Kolom

name

dipertahankan mengikuti standar Laravel.

Tidak diperlukan perubahan menjadi

nama_lengkap

agar tetap kompatibel dengan ekosistem Laravel dan package pendukung.

---

# Keputusan Audit

Disetujui melakukan perubahan berikut:

- Menambahkan unit_organisasi_id.
- Menambahkan jabatan_id.
- Menambahkan status.
- Mempertahankan kolom name.
- Tidak menambahkan avatar.

---

# Dampak Implementasi

Migration

☑

Model

☑

Seeder

☑

Factory

☑

Request

☑

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

# Matriks Relasi

Users

↓

Unit Organisasi

↓

Jabatan

↓

Role

↓

Permission

↓

Menu

↓

Aksi

---

# Keputusan Final

1. Users tetap menggunakan struktur autentikasi bawaan Laravel.
2. Menambahkan relasi ke Unit Organisasi.
3. Menambahkan relasi ke Jabatan.
4. Menambahkan status akun.
5. Tidak menambahkan avatar.
6. Kolom name tetap dipertahankan mengikuti standar Laravel.
7. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.