# LARAS

# Implementasi

Modul : Master Data

Tahap : Controller

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Controller Laravel untuk seluruh Master Data berdasarkan hasil audit database yang telah disetujui.

Controller bertanggung jawab mengelola alur permintaan (request), memanggil Model, mengembalikan Response, dan mengatur proses CRUD tanpa menyimpan business logic.

---

# Referensi Audit

- docs/audit/MASTER/
- docs/audit/SUMMARY/MASTER_SUMMARY.md
- docs/audit/SUMMARY/DATABASE_FINAL.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md
- docs/audit/SUMMARY/PERMISSION_MATRIX.md

---

# Ruang Lingkup

Implementasi Controller untuk seluruh Master Data berikut:

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

## Resource Controller

☐ index()

☐ store()

☐ show()

☐ update()

☐ destroy()

---

## Query Data

☐ Pagination

☐ Search

☐ Filter

☐ Sorting

☐ Eager Loading Relationship

---

## CRUD

☐ Create

☐ Read

☐ Update

☐ Delete

☐ Restore (jika menggunakan Soft Delete)

---

## Validasi

☐ Menggunakan Form Request

☐ Tidak menggunakan validate() langsung di Controller

☐ Tidak terdapat validasi manual

---

## Authorization

☐ Menggunakan Policy

☐ Permission diperiksa sebelum proses

☐ Authorization konsisten pada seluruh Controller

---

## Response

☐ Menggunakan API Resource

☐ Response JSON konsisten

☐ HTTP Status Code sesuai standar

☐ Error Response konsisten

---

## Error Handling

☐ Data tidak ditemukan

☐ Foreign Key Constraint

☐ Duplicate Data

☐ Validation Error

☐ Unexpected Error

---

## Logging

☐ Error dicatat pada Log

☐ Aktivitas penting diteruskan ke Audit Log (jika diperlukan)

---

# Checklist per Modul

## 01. Jenis Arsip

☐ CRUD

☐ Search

☐ Pagination

☐ Testing

---

## 02. Klasifikasi Arsip

☐ CRUD

☐ Relationship Retensi Arsip

☐ Testing

---

## 03. Retensi Arsip

☐ CRUD

☐ Relationship Metode Penyusutan Arsip

☐ Testing

---

## 04. Sifat Arsip

☐ CRUD

☐ Testing

---

## 05. Status Arsip

☐ CRUD

☐ Testing

---

## 06. Media Arsip

☐ CRUD

☐ Testing

---

## 07. Lokasi Arsip

☐ CRUD

☐ Testing

---

## 08. Tingkat Akses Arsip

☐ CRUD

☐ Testing

---

## 09. Tingkat Perkembangan Arsip

☐ CRUD

☐ Testing

---

## 10. Kondisi Arsip

☐ CRUD

☐ Testing

---

## 11. Unit Organisasi

☐ CRUD

☐ Parent-Child Data

☐ Testing

---

## 12. Jabatan

☐ CRUD

☐ Testing

---

## 13. Metode Penyusutan Arsip

☐ CRUD

☐ Testing

---

# Standar Controller

Seluruh Controller wajib mengikuti standar berikut:

- Menggunakan Resource Controller Laravel.
- Menggunakan Dependency Injection.
- Menggunakan Route Model Binding.
- Menggunakan Form Request.
- Menggunakan Policy untuk Authorization.
- Menggunakan API Resource untuk Response.
- Tidak menyimpan business logic pada Controller.
- Tidak menjalankan Query yang kompleks secara langsung di Controller.

---

# Urutan Implementasi

1. Review Controller lama.
2. Terapkan Resource Controller.
3. Integrasikan Form Request.
4. Integrasikan Policy.
5. Integrasikan API Resource.
6. Tambahkan Search, Filter, Sorting, dan Pagination.
7. Tambahkan Error Handling.
8. Lakukan testing.
9. Commit perubahan.

---

# Verifikasi

Pastikan seluruh poin berikut terpenuhi:

☐ Seluruh endpoint CRUD berjalan.

☐ Pagination berjalan.

☐ Search berjalan.

☐ Filter berjalan.

☐ Sorting berjalan.

☐ Authorization berjalan.

☐ Response sesuai standar.

☐ Tidak ada business logic di Controller.

---

# Output

Output implementasi pada tahap ini:

- Seluruh Controller Master Data diperbarui.
- Endpoint CRUD berfungsi.
- Response API konsisten.
- Siap digunakan oleh Frontend React.

---

# Keputusan Final

1. Seluruh Controller menggunakan Resource Controller.
2. Validasi dilakukan melalui Form Request.
3. Authorization menggunakan Policy dan Permission.
4. Response menggunakan API Resource.
5. Controller hanya mengatur alur proses, bukan tempat business logic.
6. Tahap berikutnya adalah implementasi API.