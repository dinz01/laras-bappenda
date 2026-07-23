# LARAS

# Implementasi

Modul : Master Data

Tahap : Migration

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi seluruh migration Master Data berdasarkan hasil audit database yang telah disetujui.

Seluruh perubahan migration wajib mengacu pada dokumen audit dan tidak diperbolehkan mengubah keputusan audit tanpa proses audit ulang.

---

# Referensi Audit

- docs/audit/MASTER/
- docs/audit/SUMMARY/MASTER_SUMMARY.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md
- docs/audit/SUMMARY/DATABASE_FINAL.md

---

# Ruang Lingkup

Implementasi migration untuk seluruh tabel Master Data berikut:

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

## 01. Jenis Arsip

☐ Review migration

☐ Sesuaikan struktur tabel

☐ Verifikasi Foreign Key

☐ Verifikasi Index

☐ Testing migration

---

## 02. Klasifikasi Arsip

☐ Hapus kolom `retensi_aktif`

☐ Hapus kolom `retensi_inaktif`

☐ Tambah Foreign Key `retensi_arsip_id`

☐ Update Constraint

☐ Update Index

☐ Testing migration

---

## 03. Retensi Arsip

☐ Tambah Foreign Key `metode_penyusutan_arsip_id`

☐ Update Constraint

☐ Update Index

☐ Testing migration

---

## 04. Sifat Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 05. Status Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 06. Media Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 07. Lokasi Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 08. Tingkat Akses Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 09. Tingkat Perkembangan Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 10. Kondisi Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

## 11. Unit Organisasi

☐ Hapus kolom `urutan`

☐ Verifikasi Parent-Child Relationship

☐ Update Constraint

☐ Testing migration

---

## 12. Jabatan

☐ Hapus kolom `level`

☐ Verifikasi struktur

☐ Testing migration

---

## 13. Metode Penyusutan Arsip

☐ Review migration

☐ Verifikasi struktur

☐ Testing migration

---

# Standar Migration

Seluruh migration wajib mengikuti standar berikut:

- Menggunakan Primary Key `id`
- Menggunakan Foreign Key `*_id`
- Menggunakan tipe data yang sesuai
- Menggunakan Timestamp Laravel
- Menggunakan Constraint Foreign Key
- Menggunakan Index pada kolom yang diperlukan
- Menggunakan nama tabel dalam bentuk jamak (plural)
- Menggunakan penamaan kolom dalam `snake_case`

---

# Urutan Implementasi

1. Backup database.
2. Review migration lama.
3. Revisi migration sesuai audit.
4. Verifikasi seluruh Foreign Key.
5. Verifikasi seluruh Index.
6. Jalankan migration.
7. Jalankan seeder.
8. Verifikasi struktur database.
9. Commit perubahan.

---

# Verifikasi

Pastikan seluruh poin berikut terpenuhi:

☐ Seluruh migration berhasil dijalankan.

☐ Tidak ada Foreign Key yang gagal.

☐ Seluruh Constraint sesuai audit.

☐ Seluruh Index berhasil dibuat.

☐ Struktur database sesuai `DATABASE_FINAL.md`.

☐ Tidak ada perubahan di luar hasil audit.

---

# Output

Output implementasi pada tahap ini:

- Seluruh migration Master Data diperbarui.
- Struktur database sesuai hasil audit.
- Seluruh Foreign Key tervalidasi.
- Database siap untuk implementasi Seeder.

---

# Keputusan Final

1. Implementasi migration hanya mengikuti hasil audit.
2. Tidak diperbolehkan menambah atau mengurangi struktur tanpa audit ulang.
3. Seluruh perubahan wajib melalui proses testing.
4. Tahap berikutnya adalah implementasi Seeder Master Data.