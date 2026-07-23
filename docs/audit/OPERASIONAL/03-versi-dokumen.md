# LARAS

# Audit Database

Modul : Operasional

Nomor : 03

Nama : Versi Dokumen

Status :

✅ FINAL

---

# Tujuan

Tabel Versi Dokumen digunakan untuk menyimpan riwayat perubahan (versioning) dari setiap dokumen arsip.

Setiap perubahan file tidak menggantikan file lama, tetapi disimpan sebagai versi baru sehingga histori dokumen tetap terjaga dan dapat diaudit.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_versi_dokumen_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| dokumen_arsip_id |
| versi |
| nama_file |
| path_file |
| mime_type |
| ukuran_file |
| checksum |
| catatan_perubahan |
| uploaded_by |
| created_at |
| updated_at |

---

# Relasi

Versi Dokumen

belongsTo

- Dokumen Arsip
- User (uploaded_by)

---

# Hasil Audit

## Yang Sudah Sesuai

- Versioning dipisahkan dari tabel Dokumen Arsip.
- Mendukung penyimpanan histori perubahan file.
- Setiap versi tetap terhubung dengan dokumen arsip induknya.
- Mendukung pencatatan pengguna yang mengunggah versi baru.

---

## Temuan Audit

### ARSIP-004 (High)

Kolom

catatan_perubahan

perlu tersedia untuk menjelaskan alasan atau deskripsi perubahan pada setiap versi dokumen.

Contoh:

- Perbaikan hasil scan.
- Penambahan halaman lampiran.
- Penggantian dokumen yang lebih jelas.

Keputusan:

Menambahkan kolom

catatan_perubahan

---

### ARSIP-002 (Informasi)

Kolom

checksum

tetap digunakan pada setiap versi file.

Setiap versi memiliki checksum sendiri untuk menjaga integritas dokumen digital.

Tidak diperlukan perubahan struktur.

---

### OPS-002 (Informasi)

Versi Dokumen tidak menentukan versi aktif.

Status versi aktif tetap dikelola oleh tabel

dokumen_arsip

agar tidak terjadi duplikasi informasi.

Tidak diperlukan perubahan struktur.

---

# Keputusan Audit

Disetujui melakukan perubahan berikut:

- Menambahkan kolom catatan_perubahan.
- Setiap versi memiliki checksum sendiri.
- Status versi aktif tetap dikelola oleh Dokumen Arsip.
- Versioning tetap dipisahkan dari tabel Dokumen Arsip.

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

Storage

☑

React

☑

Testing

☑

---

# Keputusan Final

1. Setiap perubahan file menghasilkan satu record versi baru.
2. File lama tidak ditimpa dan tetap menjadi bagian dari histori.
3. Menambahkan kolom catatan_perubahan pada setiap versi dokumen.
4. Checksum disimpan pada setiap versi file.
5. Status versi aktif tetap dikelola oleh tabel Dokumen Arsip.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.