# LARAS

# Implementasi

Modul : Master Data

Tahap : React

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Frontend React untuk seluruh Master Data berdasarkan hasil audit database yang telah disetujui.

Seluruh implementasi React harus mengacu pada hasil audit, standar UI aplikasi LARAS, serta mendukung pengalaman pengguna yang konsisten.

---

# Referensi Audit

- docs/audit/MASTER/
- docs/audit/SUMMARY/MASTER_SUMMARY.md
- docs/audit/SUMMARY/DATABASE_FINAL.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md
- docs/audit/SUMMARY/PERMISSION_MATRIX.md

---

# Ruang Lingkup

Implementasi React untuk seluruh Master Data berikut:

1. Jenis Arsip
2. Klasifikasi Arsip
3. Retensi Arsip
4. Sifat Arsip
5. Status Arsip
6. Media Arsip
7. Lokasi Arsip
8. Tingkat Akses Arsip
9. Tingkat Perkembangan Arsip
10. Kondisi Arsip
11. Unit Organisasi
12. Jabatan
13. Metode Penyusutan Arsip

---

# Checklist Implementasi

## Layout

☐ Menggunakan Layout Utama

☐ Header Konsisten

☐ Sidebar Konsisten

☐ Breadcrumb

☐ Responsive Layout

---

## Halaman

☐ Index

☐ Create

☐ Edit

☐ Detail

☐ Delete Confirmation

---

## Data Table

☐ Pagination

☐ Search

☐ Filter

☐ Sorting

☐ Refresh Data

☐ Empty State

☐ Loading State

---

## Form

☐ Input Validation

☐ Select Option

☐ Auto Focus

☐ Required Field

☐ Error Message

☐ Success Notification

☐ Reset Form

---

## API Integration

☐ GET

☐ POST

☐ PUT / PATCH

☐ DELETE

☐ Error Handling

☐ Loading Indicator

---

## Permission

☐ View

☐ Create

☐ Update

☐ Delete

☐ Hidden Component sesuai Permission

---

## User Experience

☐ Skeleton Loading

☐ Toast Notification

☐ Confirmation Dialog

☐ Loading Spinner

☐ Responsive

☐ Accessibility

---

# Checklist per Modul

## 01. Jenis Arsip

☐ Table

☐ Form

☐ Detail

☐ Testing

---

## 02. Klasifikasi Arsip

☐ Table

☐ Form

☐ Relationship Retensi Arsip

☐ Testing

---

## 03. Retensi Arsip

☐ Table

☐ Form

☐ Relationship Metode Penyusutan Arsip

☐ Testing

---

## 04. Sifat Arsip

☐ Table

☐ Form

☐ Testing

---

## 05. Status Arsip

☐ Table

☐ Form

☐ Testing

---

## 06. Media Arsip

☐ Table

☐ Form

☐ Testing

---

## 07. Lokasi Arsip

☐ Table

☐ Form

☐ Testing

---

## 08. Tingkat Akses Arsip

☐ Table

☐ Form

☐ Testing

---

## 09. Tingkat Perkembangan Arsip

☐ Table

☐ Form

☐ Testing

---

## 10. Kondisi Arsip

☐ Table

☐ Form

☐ Testing

---

## 11. Unit Organisasi

☐ Tree View

☐ Form

☐ Parent Selector

☐ Testing

---

## 12. Jabatan

☐ Table

☐ Form

☐ Testing

---

## 13. Metode Penyusutan Arsip

☐ Table

☐ Form

☐ Testing

---

# Standar React

Seluruh halaman React wajib mengikuti standar berikut:

- Menggunakan TypeScript.
- Menggunakan Functional Component.
- Menggunakan Hooks.
- Memanfaatkan reusable component.
- Menggunakan React Router.
- Menggunakan Axios atau Fetch Wrapper yang terpusat.
- Menggunakan State Management sesuai standar proyek.
- Tidak melakukan request API secara berulang yang tidak diperlukan.

---

# Standar Komponen

Gunakan komponen reusable untuk:

- Table
- Search Box
- Filter
- Pagination
- Modal
- Dialog
- Form Input
- Select
- Textarea
- Badge
- Alert
- Button
- Loading
- Empty State

---

# Standar Penamaan

Pages

PascalCase

Contoh:

JenisArsipPage.tsx

Components

PascalCase

Contoh:

JenisArsipForm.tsx

Hooks

camelCase

Contoh:

useJenisArsip.ts

Services

camelCase

Contoh:

jenisArsipService.ts

---

# Urutan Implementasi

1. Membuat halaman List.
2. Membuat Form Create.
3. Membuat Form Edit.
4. Membuat Detail.
5. Integrasi API.
6. Integrasi Permission.
7. Optimasi UX.
8. Responsive Testing.
9. Commit perubahan.

---

# Verifikasi

Pastikan seluruh poin berikut terpenuhi:

☐ Seluruh halaman dapat diakses.

☐ CRUD berjalan dengan baik.

☐ API terintegrasi.

☐ Permission berjalan.

☐ Responsive pada Desktop.

☐ Responsive pada Tablet.

☐ Responsive pada Mobile.

☐ Tidak terdapat error pada Console Browser.

---

# Output

Output implementasi pada tahap ini:

- Seluruh halaman Master Data tersedia.
- UI konsisten dengan standar aplikasi LARAS.
- Terintegrasi dengan Backend API.
- Siap digunakan oleh pengguna.

---

# Keputusan Final

1. Seluruh halaman menggunakan komponen reusable.
2. Seluruh komunikasi data melalui REST API.
3. Permission diterapkan hingga tingkat komponen.
4. UI harus konsisten pada seluruh modul Master Data.
5. Tahap berikutnya adalah pengujian (Testing).