# LARAS

# Implementasi

Modul : Master Data

Tahap : Model

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Model Laravel untuk seluruh Master Data berdasarkan hasil audit database yang telah disetujui.

Seluruh Model harus merepresentasikan struktur database final, relasi antar tabel, serta mengikuti standar Laravel dan arsitektur proyek LARAS.

---

# Referensi Audit

- docs/audit/MASTER/
- docs/audit/SUMMARY/MASTER_SUMMARY.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md
- docs/audit/SUMMARY/DATABASE_FINAL.md

---

# Ruang Lingkup

Implementasi Model untuk seluruh tabel Master Data berikut:

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

## Struktur Model

☐ Namespace sesuai standar Laravel

☐ Nama Model menggunakan PascalCase

☐ Nama tabel sesuai migration

☐ Primary Key menggunakan `id`

☐ Timestamp aktif

☐ Soft Delete diterapkan jika diperlukan

---

## Fillable

☐ Seluruh kolom yang dapat diubah dimasukkan ke `$fillable`

☐ Tidak ada kolom sensitif pada `$fillable`

☐ Konsisten dengan struktur database final

---

## Casts

☐ Status menggunakan cast yang sesuai

☐ Tipe data numerik menggunakan cast yang sesuai

☐ Tipe data tanggal menggunakan cast yang sesuai

☐ Tidak ada cast yang tidak diperlukan

---

## Relationship

☐ belongsTo()

☐ hasMany()

☐ hasOne()

☐ Relasi sesuai `RELATIONSHIP_MATRIX.md`

☐ Foreign Key sesuai hasil audit

---

## Query Scope

☐ Scope Active

☐ Scope Search (jika diperlukan)

☐ Scope Filter (jika diperlukan)

---

## Accessor & Mutator

☐ Accessor dibuat jika diperlukan

☐ Mutator dibuat jika diperlukan

☐ Tidak menambahkan business logic ke Model

---

## Route Model Binding

☐ Menggunakan Route Model Binding Laravel

☐ Konsisten pada seluruh Master Data

---

## Observer

☐ Observer digunakan jika diperlukan

☐ Tidak menambahkan proses bisnis ke Observer

---

# Checklist per Modul

## 01. Jenis Arsip

☐ Review Model

☐ Update Fillable

☐ Update Relationship

☐ Testing

---

## 02. Klasifikasi Arsip

☐ Review Model

☐ Update Relationship ke Retensi Arsip

☐ Testing

---

## 03. Retensi Arsip

☐ Review Model

☐ Update Relationship ke Metode Penyusutan Arsip

☐ Testing

---

## 04. Sifat Arsip

☐ Review Model

☐ Testing

---

## 05. Status Arsip

☐ Review Model

☐ Testing

---

## 06. Media Arsip

☐ Review Model

☐ Testing

---

## 07. Lokasi Arsip

☐ Review Model

☐ Testing

---

## 08. Tingkat Akses Arsip

☐ Review Model

☐ Testing

---

## 09. Tingkat Perkembangan Arsip

☐ Review Model

☐ Testing

---

## 10. Kondisi Arsip

☐ Review Model

☐ Testing

---

## 11. Unit Organisasi

☐ Review Model

☐ Verifikasi Parent-Child Relationship

☐ Testing

---

## 12. Jabatan

☐ Review Model

☐ Testing

---

## 13. Metode Penyusutan Arsip

☐ Review Model

☐ Verifikasi hasMany Retensi Arsip

☐ Testing

---

# Standar Model

Seluruh Model wajib mengikuti standar berikut:

- Menggunakan Eloquent ORM.
- Menggunakan `$fillable`.
- Tidak menggunakan `$guarded`, kecuali diperlukan.
- Relationship menggunakan nama method yang konsisten.
- Tidak menyimpan business logic pada Model.
- Menggunakan Type Casting bila diperlukan.
- Mengikuti PSR-12.

---

# Urutan Implementasi

1. Review Model lama.
2. Perbarui Fillable.
3. Perbarui Casts.
4. Perbarui Relationship.
5. Tambahkan Scope jika diperlukan.
6. Tambahkan Accessor/Mutator bila diperlukan.
7. Testing seluruh relasi.
8. Commit perubahan.

---

# Verifikasi

Pastikan seluruh poin berikut terpenuhi:

☐ Seluruh Model dapat digunakan tanpa error.

☐ Relationship berjalan dengan benar.

☐ Fillable sesuai struktur database.

☐ Casts sesuai tipe data.

☐ Scope berjalan dengan benar.

☐ Tidak ada business logic yang tidak semestinya di Model.

---

# Output

Output implementasi pada tahap ini:

- Seluruh Model Master Data diperbarui.
- Relationship sesuai hasil audit.
- Fillable dan Casts tervalidasi.
- Model siap digunakan oleh Request, Controller, dan API.

---

# Keputusan Final

1. Seluruh Model mengikuti struktur database final.
2. Relationship wajib mengacu pada `RELATIONSHIP_MATRIX.md`.
3. Business logic tidak ditempatkan pada Model.
4. Tahap berikutnya adalah implementasi Request Validation.