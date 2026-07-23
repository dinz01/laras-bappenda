# LARAS

# Implementasi

Modul : Master Data

Tahap : Request Validation

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Form Request Laravel untuk seluruh Master Data berdasarkan hasil audit database yang telah disetujui.

Seluruh validasi harus dilakukan menggunakan Form Request agar konsisten, mudah dipelihara, dan sesuai dengan standar Laravel.

---

# Referensi Audit

- docs/audit/MASTER/
- docs/audit/SUMMARY/MASTER_SUMMARY.md
- docs/audit/SUMMARY/DATABASE_FINAL.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md

---

# Ruang Lingkup

Implementasi Form Request untuk seluruh Master Data berikut:

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

## Store Request

☐ Membuat StoreRequest untuk setiap Master Data

☐ Validasi sesuai struktur database

☐ Validasi Foreign Key

☐ Validasi Unique

☐ Validasi Nullable

☐ Validasi Enum (jika ada)

---

## Update Request

☐ Membuat UpdateRequest

☐ Ignore Unique pada data yang sedang diperbarui

☐ Validasi Foreign Key

☐ Validasi Nullable

☐ Validasi Enum (jika ada)

---

## Validation Rule

☐ Required

☐ Nullable

☐ String

☐ Integer

☐ Boolean

☐ Exists

☐ Unique

☐ Max Length

☐ Min Length

---

## Authorization

☐ Method authorize() digunakan

☐ Terintegrasi dengan Policy / Permission

☐ Mengembalikan nilai yang sesuai

---

## Custom Message

☐ Pesan validasi menggunakan Bahasa Indonesia

☐ Pesan mudah dipahami pengguna

☐ Tidak menampilkan informasi teknis

---

## Prepare for Validation

☐ Normalisasi input bila diperlukan

☐ Trim whitespace

☐ Konversi tipe data bila diperlukan

---

# Checklist per Modul

## 01. Jenis Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 02. Klasifikasi Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Validasi Retensi Arsip

☐ Testing

---

## 03. Retensi Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Validasi Metode Penyusutan Arsip

☐ Testing

---

## 04. Sifat Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 05. Status Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 06. Media Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 07. Lokasi Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 08. Tingkat Akses Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 09. Tingkat Perkembangan Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 10. Kondisi Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 11. Unit Organisasi

☐ StoreRequest

☐ UpdateRequest

☐ Validasi Parent Unit

☐ Testing

---

## 12. Jabatan

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

## 13. Metode Penyusutan Arsip

☐ StoreRequest

☐ UpdateRequest

☐ Testing

---

# Standar Request

Seluruh Form Request wajib mengikuti standar berikut:

- Menggunakan Form Request Laravel.
- Tidak menggunakan validasi langsung pada Controller.
- Validasi mengacu pada struktur database final.
- Validasi Foreign Key menggunakan `exists`.
- Validasi Unique menggunakan Rule::unique().
- Menggunakan Bahasa Indonesia untuk pesan validasi.
- Authorization terintegrasi dengan sistem RBAC.

---

# Urutan Implementasi

1. Review Request lama.
2. Membuat StoreRequest.
3. Membuat UpdateRequest.
4. Menambahkan Validation Rule.
5. Menambahkan Authorization.
6. Menambahkan Custom Message.
7. Melakukan testing validasi.
8. Commit perubahan.

---

# Verifikasi

Pastikan seluruh poin berikut terpenuhi:

☐ Seluruh Request berjalan tanpa error.

☐ Validasi sesuai struktur database.

☐ Foreign Key tervalidasi.

☐ Unique berjalan dengan benar.

☐ Authorization berjalan dengan benar.

☐ Pesan validasi mudah dipahami.

---

# Output

Output implementasi pada tahap ini:

- Seluruh Form Request Master Data tersedia.
- Validasi terstandarisasi.
- Input pengguna tervalidasi dengan baik.
- Backend siap digunakan oleh Controller.

---

# Keputusan Final

1. Seluruh validasi menggunakan Form Request.
2. Controller tidak berisi validasi langsung.
3. Validasi mengacu pada hasil audit database.
4. Authorization mengikuti sistem RBAC.
5. Tahap berikutnya adalah implementasi Controller.