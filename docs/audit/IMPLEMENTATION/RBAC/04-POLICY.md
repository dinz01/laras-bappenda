# LARAS

# Implementasi

Modul : RBAC

Tahap : Policy

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Laravel Policy pada Sistem LARAS.

Policy digunakan sebagai lapisan utama Authorization sehingga setiap proses bisnis memiliki aturan akses yang jelas, konsisten, dan mudah dipelihara.

Seluruh pengecekan hak akses harus menggunakan Policy.

---

# Referensi

- docs/audit/RBAC/
- docs/audit/SUMMARY/PERMISSION_MATRIX.md
- docs/architecture/RBAC_GUIDE.md
- docs/architecture/API_STANDARD.md
- docs/architecture/CODING_STANDARD.md
- implementation/03-RBAC/03-MODEL.md

---

# Ruang Lingkup

Implementasi meliputi:

- Registrasi Policy
- Authorization
- Resource Policy
- Controller Integration
- Testing

---

# Policy yang Diimplementasikan

Minimal:

☑ ArsipPolicy

☑ DokumenArsipPolicy

☑ WorkflowPolicy

☑ UserPolicy

Policy lain dapat ditambahkan sesuai kebutuhan modul.

---

# Struktur Policy

Gunakan method standar Laravel.

Contoh:

```php
viewAny()

view()

create()

update()

delete()

restore()

forceDelete()
```

Apabila diperlukan dapat menambahkan method khusus.

Contoh:

```php
approve()

reject()

download()

upload()
```

---

# Authorization

Hak akses ditentukan berdasarkan Permission.

Contoh:

```php
return $user->can('arsip.view');
```

atau

```php
return $user->can('workflow.approve');
```

Tidak melakukan pengecekan Role secara langsung.

---

# Controller Integration

Controller menggunakan:

```php
$this->authorize('view', $arsip);
```

atau

```php
$this->authorize('create', Arsip::class);
```

Controller tidak boleh melakukan:

```php
if ($user->hasRole(...))
```

atau

```php
if ($user->id == ...)
```

untuk otorisasi.

---

# Resource Authorization

Gunakan:

```php
authorizeResource()
```

untuk Controller Resource apabila memungkinkan.

Checklist

☐ Resource Authorization digunakan

☐ Policy terhubung

---

# Policy Registration

Pastikan seluruh Policy terdaftar.

Checklist

☐ ArsipPolicy

☐ DokumenArsipPolicy

☐ WorkflowPolicy

☐ UserPolicy

---

# Alur Authorization

```text
User Login
        ↓
Authentication
        ↓
Middleware
        ↓
Policy
        ↓
Controller
        ↓
Response
```

Policy menjadi pusat keputusan hak akses.

---

# Integrasi

Policy terhubung dengan:

☑ User

☑ Permission

☑ Controller

☑ API

☑ React Permission

---

# Validasi

Pastikan:

☐ User tanpa Permission ditolak

☐ User dengan Permission diizinkan

☐ Policy berjalan pada seluruh Controller

☐ Tidak ada pengecekan Role manual

---

# Testing

## Authorization

☐ view

☐ create

☐ update

☐ delete

---

## Workflow

☐ approve

☐ reject

---

## User

☐ manage

☐ assign role

---

## API

☐ Endpoint mengikuti Policy

☐ Response sesuai

---

# Output

Output implementasi:

- Seluruh Authorization menggunakan Laravel Policy.
- Controller tidak lagi berisi logika hak akses.
- Permission dikelola melalui Policy.
- Sistem siap memasuki implementasi Middleware.

---

# Checklist Penyelesaian

☐ Registrasi Policy

☐ Implementasi Method

☐ Controller Integration

☐ API Integration

☐ Testing

☐ Review

☐ Final

---

# Keputusan Final

1. Seluruh Authorization menggunakan Laravel Policy.
2. Controller tidak melakukan pengecekan Role secara langsung.
3. Permission menjadi dasar keputusan pada Policy.
4. Policy menjadi pusat aturan akses seluruh modul.
5. Dokumen ini menjadi pedoman implementasi Policy pada Sistem LARAS.