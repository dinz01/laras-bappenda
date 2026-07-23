# LARAS

# Implementasi

Modul : RBAC

Tahap : Middleware

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Middleware pada Sistem LARAS.

Middleware bertugas melakukan validasi awal terhadap setiap request sebelum diproses oleh Controller, termasuk Authentication, Authorization, dan pemeriksaan Permission.

Middleware tidak digunakan untuk mengimplementasikan logika bisnis.

---

# Referensi

- docs/audit/RBAC/
- docs/audit/SUMMARY/PERMISSION_MATRIX.md
- docs/architecture/RBAC_GUIDE.md
- docs/architecture/API_STANDARD.md
- docs/architecture/CODING_STANDARD.md
- implementation/03-RBAC/04-POLICY.md

---

# Ruang Lingkup

Implementasi meliputi:

- Authentication Middleware
- Permission Middleware
- Role Middleware
- Custom Middleware
- Route Protection
- Testing

---

# Middleware Default

Gunakan Middleware bawaan Laravel.

Minimal:

☑ auth

☑ guest

☑ verified (jika digunakan)

Checklist

☐ Middleware aktif

☐ Route terlindungi

---

# Middleware Spatie

Gunakan Middleware bawaan Spatie.

Contoh:

```php
permission:arsip.view

permission:arsip.create

permission:workflow.approve
```

Checklist

☐ Permission Middleware aktif

☐ Tidak ada Permission yang salah

---

# Role Middleware

Role Middleware hanya digunakan apabila benar-benar diperlukan.

Contoh:

```php
role:Super Admin
```

Prioritaskan penggunaan Permission dibandingkan Role.

Checklist

☐ Role Middleware hanya digunakan pada kasus khusus

---

# Custom Middleware

Apabila diperlukan, buat Middleware khusus.

Contoh:

- CheckUnitOrganisasi
- CheckOwnership
- CheckWorkflowState

Custom Middleware harus bersifat umum dan dapat digunakan kembali.

Checklist

☐ Reusable

☐ Tidak mengandung logika bisnis kompleks

---

# Route Protection

Seluruh Route yang memerlukan login wajib menggunakan:

```php
auth
```

Contoh:

```php
Route::middleware(['auth'])->group(function () {

});
```

Untuk Permission:

```php
Route::middleware([
'auth',
'permission:arsip.view'
]);
```

---

# API Protection

API wajib menggunakan:

☑ auth:sanctum

☑ permission

☑ policy

Urutan:

```text
Authentication
↓

Middleware

↓

Policy

↓

Controller
```

---

# Alur Middleware

```text
Request

↓

Authentication

↓

Permission Middleware

↓

Policy

↓

Controller

↓

Response
```

Middleware tidak menentukan aturan bisnis.

---

# Integrasi

Middleware terhubung dengan:

☑ Authentication

☑ Spatie

☑ Policy

☑ API

☑ React

---

# Validasi

Pastikan:

☐ User belum login ditolak

☐ User tanpa Permission ditolak

☐ User dengan Permission diterima

☐ Middleware berjalan sebelum Controller

---

# Testing

## Authentication

☐ Login

☐ Guest

☐ Logout

---

## Permission

☐ Permission benar

☐ Permission salah

---

## Route

☐ Protected Route

☐ Public Route

---

## API

☐ Auth Sanctum

☐ Permission

☐ Policy

---

# Output

Output implementasi:

- Seluruh Route terlindungi.
- Authentication berjalan.
- Permission berjalan.
- Middleware terintegrasi dengan Policy.
- Sistem siap memasuki implementasi React Permission.

---

# Checklist Penyelesaian

☐ Authentication

☐ Permission Middleware

☐ Role Middleware

☐ Custom Middleware

☐ Route Protection

☐ API Protection

☐ Testing

☐ Review

☐ Final

---

# Keputusan Final

1. Middleware bertugas memvalidasi request sebelum Controller.
2. Permission menggunakan Middleware bawaan Spatie.
3. Authentication menggunakan Middleware Laravel.
4. Logika bisnis tidak ditempatkan di Middleware.
5. Middleware bekerja bersama Policy sebagai lapisan keamanan Sistem LARAS.