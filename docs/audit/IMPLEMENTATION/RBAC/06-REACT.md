# LARAS

# Implementasi

Modul : RBAC

Tahap : React

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Role Based Access Control (RBAC) pada Frontend React.

Frontend bertanggung jawab mengatur tampilan antarmuka berdasarkan Permission yang dimiliki pengguna, sedangkan proses otorisasi utama tetap dilakukan oleh Backend menggunakan Middleware dan Policy.

---

# Referensi

- docs/audit/RBAC/
- docs/audit/SUMMARY/PERMISSION_MATRIX.md
- docs/architecture/RBAC_GUIDE.md
- docs/architecture/REACT_STANDARD.md
- docs/architecture/API_STANDARD.md
- implementation/03-RBAC/04-POLICY.md
- implementation/03-RBAC/05-MIDDLEWARE.md

---

# Ruang Lingkup

Implementasi meliputi:

- Permission Hook
- Protected Route
- Menu Navigation
- Button Permission
- Conditional Rendering
- API Error Handling
- Testing

---

# Prinsip

Frontend hanya bertanggung jawab terhadap:

☑ Tampilan

☑ User Experience

☑ Navigasi

Frontend bukan lapisan keamanan utama.

Seluruh validasi hak akses tetap dilakukan oleh Backend.

---

# Permission Hook

Gunakan Hook khusus.

Contoh:

```tsx
usePermission()
```

Hook bertugas:

- membaca Permission User
- mengecek hak akses
- menyediakan helper

Checklist

☐ Hook dibuat

☐ Mengembalikan boolean

☐ Mudah digunakan

---

# Permission Helper

Contoh:

```tsx
can("arsip.create")

can("workflow.approve")

can("audit.view")
```

Checklist

☐ Helper konsisten

☐ Tidak mengandung logika bisnis

---

# Protected Route

Halaman tertentu hanya dapat diakses oleh User yang memiliki Permission.

Contoh:

```tsx
<RouteGuard permission="arsip.view">
```

Checklist

☐ Route Guard aktif

☐ Redirect apabila tidak memiliki akses

---

# Navigation Menu

Menu ditampilkan berdasarkan Permission.

Contoh:

```text
Master Data

↓

Arsip

↓

Workflow

↓

User
```

Menu yang tidak memiliki akses tidak ditampilkan.

Checklist

☐ Sidebar

☐ Navbar

☐ Dropdown

---

# Button Permission

Button hanya ditampilkan apabila User memiliki Permission.

Contoh:

```tsx
<CreateButton />

<EditButton />

<DeleteButton />

<ApproveButton />
```

Checklist

☐ Hidden Button

☐ Disabled apabila diperlukan

---

# Conditional Rendering

Gunakan Conditional Rendering.

Contoh:

```tsx
{can('arsip.create') && (
    <CreateButton />
)}
```

Hindari pengecekan Role secara langsung.

---

# API Integration

Apabila Backend mengembalikan:

403 Forbidden

Frontend harus:

☐ Menampilkan pesan yang sesuai

☐ Tidak menampilkan Error mentah

☐ Mengarahkan User apabila diperlukan

---

# Permission Refresh

Permission diperbarui ketika:

☑ Login

☑ Logout

☑ Refresh Session

☑ Pergantian Role

Checklist

☐ Permission selalu sinkron

---

# Integrasi

React terhubung dengan:

☑ Authentication

☑ API

☑ Permission

☑ Policy

☑ Middleware

---

# Validasi

Pastikan:

☐ Menu sesuai Permission

☐ Button sesuai Permission

☐ Route sesuai Permission

☐ API Error ditangani

---

# Testing

## Menu

☐ Sidebar

☐ Navbar

☐ Dropdown

---

## Button

☐ Create

☐ Edit

☐ Delete

☐ Approve

---

## Route

☐ Protected Route

☐ Redirect

---

## API

☐ 401 Unauthorized

☐ 403 Forbidden

---

# Output

Output implementasi:

- Permission Frontend berjalan.
- Menu mengikuti hak akses.
- Button mengikuti Permission.
- Route terlindungi.
- Frontend siap digunakan bersama Backend.

---

# Checklist Penyelesaian

☐ Permission Hook

☐ Permission Helper

☐ Route Guard

☐ Navigation

☐ Button Permission

☐ API Integration

☐ Testing

☐ Review

☐ Final

---

# Keputusan Final

1. React hanya mengatur tampilan berdasarkan Permission.
2. Validasi hak akses tetap dilakukan oleh Backend.
3. Permission menggunakan Hook dan Helper yang reusable.
4. Route, Menu, dan Button mengikuti Permission User.
5. Dokumen ini menjadi pedoman implementasi RBAC pada Frontend LARAS.