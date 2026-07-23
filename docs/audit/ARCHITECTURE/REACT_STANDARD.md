# LARAS

# React Standard

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi pedoman implementasi Frontend React pada Sistem LARAS.

Seluruh pengembangan antarmuka pengguna (UI) harus mengikuti standar ini agar kode tetap konsisten, mudah dipelihara, mudah dikembangkan, dan memberikan pengalaman pengguna yang baik.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Dashboard
- Modul baru

---

# Teknologi

Frontend menggunakan:

- React
- TypeScript
- Vite
- Inertia.js
- Tailwind CSS

---

# Prinsip

Frontend LARAS dibangun berdasarkan prinsip:

- Clean Component
- Reusable Component
- Single Responsibility
- Type Safety
- Responsive
- Accessible
- Maintainable

---

# Struktur Folder

Gunakan struktur berikut:

```

resources/

js/

├── Components/

├── Pages/

├── Layouts/

├── Hooks/

├── Services/

├── Types/

├── Utils/

├── Constants/

├── Context/

├── Routes/

└── Assets/

```

---

# Penamaan

Gunakan:

PascalCase

Contoh:

```

ArsipTable

WorkflowTimeline

UploadDialog

```

---

# Pages

Setiap halaman berada pada folder:

```

Pages/

```

Contoh:

```

Pages/Arsip

Pages/User

Pages/Workflow

```

---

# Components

Component dibuat sekecil mungkin.

Contoh:

```

Button

Badge

Table

SearchBox

Pagination

Modal

```

Component tidak mengandung logika bisnis.

---

# Layout

Gunakan Layout terpisah.

Contoh:

```

GuestLayout

AuthenticatedLayout

AdminLayout

```

---

# Hooks

Custom Hook diawali dengan:

```

use

```

Contoh:

```

useArsip()

usePermission()

useWorkflow()

```

---

# Service

Seluruh komunikasi API berada pada:

```

Services/

```

Contoh:

```

ArsipService

WorkflowService

UserService

```

Component tidak melakukan request API secara langsung.

---

# TypeScript

Seluruh data memiliki Interface atau Type.

Contoh:

```ts
interface Arsip {
    id: number;
    nomor_arsip: string;
    nama: string;
}
```

Tidak menggunakan `any` kecuali benar-benar diperlukan.

---

# State Management

Gunakan state lokal terlebih dahulu.

Gunakan Context apabila state digunakan oleh banyak halaman.

Tidak membuat Global State tanpa kebutuhan yang jelas.

---

# Form

Gunakan:

- Controlled Component
- Validation dari Backend
- Error ditampilkan pada field terkait

---

# Table

Seluruh tabel mendukung:

☑ Pagination

☑ Search

☑ Filter

☑ Sorting

☑ Loading

☑ Empty State

---

# Dialog

Gunakan dialog untuk:

- Konfirmasi Hapus
- Konfirmasi Approval
- Upload Dokumen
- Detail Data

---

# Permission

Permission dikontrol melalui React.

Contoh:

```tsx
<Can permission="arsip.create">
    <Button />
</Can>
```

Permission hanya mengatur tampilan.

Validasi utama tetap dilakukan di Backend.

---

# Loading

Seluruh proses asynchronous memiliki indikator loading.

Contoh:

- Spinner
- Skeleton
- Progress Bar

---

# Empty State

Apabila data kosong tampilkan informasi yang jelas.

Contoh:

```
Belum ada data.
```

Jangan menampilkan tabel kosong tanpa informasi.

---

# Error Handling

Seluruh error ditampilkan dengan pesan yang mudah dipahami.

Hindari menampilkan error dari server secara langsung.

---

# Notification

Gunakan Toast Notification untuk:

- Berhasil
- Gagal
- Warning
- Informasi

---

# Responsive

Minimal mendukung:

☑ Desktop

☑ Tablet

☑ Mobile

---

# Accessibility

Gunakan:

- Label
- Placeholder
- Keyboard Navigation
- Focus State
- ARIA apabila diperlukan

---

# Performance

Prioritas optimasi:

- Lazy Loading
- Memoization
- Pagination
- Debounce Search
- Code Splitting

---

# Checklist

## Component

☐ Reusable

☐ Kecil

☐ Tidak mengandung logika bisnis

---

## TypeScript

☐ Interface

☐ Type

☐ Tidak menggunakan any

---

## UI

☐ Responsive

☐ Loading

☐ Empty State

☐ Error State

☐ Toast

---

## Table

☐ Pagination

☐ Search

☐ Filter

☐ Sorting

---

## Security

☐ Permission

☐ Hidden Menu

☐ Hidden Button

---

## Performance

☐ Lazy Loading

☐ Memoization

☐ Debounce

---

# Referensi

- API_STANDARD.md
- RBAC_GUIDE.md
- CODING_STANDARD.md

---

# Keputusan Final

1. Frontend menggunakan React + TypeScript + Inertia.js.
2. Component harus reusable dan memiliki satu tanggung jawab.
3. Seluruh komunikasi API dipisahkan ke Service.
4. Seluruh halaman mendukung Responsive Design.
5. Frontend hanya bertanggung jawab terhadap tampilan, sedangkan validasi dan keamanan tetap berada di Backend.