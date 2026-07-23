# LARAS

# Audit Database

Modul : Operasional

Nomor : 02

Nama : Dokumen Arsip

Status :

✅ FINAL

---

# Tujuan

Tabel Dokumen Arsip digunakan untuk menyimpan informasi file digital yang dimiliki oleh suatu arsip.

Satu arsip dapat memiliki satu atau lebih dokumen digital, baik berupa hasil scan, dokumen asli digital, maupun hasil alih media.

Metadata file dipisahkan dari tabel Arsip agar repository lebih terstruktur, mendukung versioning, serta mempermudah pengelolaan penyimpanan file.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_dokumen_arsip_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| arsip_id |
| nama_file |
| nama_file_asli |
| path_file |
| mime_type |
| ukuran_file |
| checksum |
| versi_aktif |
| status |
| uploaded_by |
| created_at |
| updated_at |
| deleted_at |

---

# Relasi

Dokumen Arsip

belongsTo

- Arsip
- User (uploaded_by)

hasMany

- Versi Dokumen

---

# Hasil Audit

## Yang Sudah Sesuai

- File digital dipisahkan dari tabel Arsip.
- Mendukung relasi One-to-Many dengan Arsip.
- Mendukung Soft Delete.
- Mendukung pencatatan pengguna yang mengunggah file.

---

## Temuan Audit

### ARSIP-002 (High)

Kolom

checksum

sudah tersedia, namun perlu dipastikan implementasinya menggunakan algoritma SHA-256 agar konsisten dengan standar integritas dokumen.

Keputusan:

Menggunakan SHA-256 sebagai standar checksum.

---

### ARSIP-005 (Low)

Penamaan kolom path file masih perlu diseragamkan.

Keputusan:

Menggunakan satu standar penamaan

path_file

untuk seluruh sistem.

---

### OPS-001 (Informasi)

Dokumen Arsip tidak menyimpan informasi versi.

Versioning tetap dipisahkan pada tabel

versi_dokumen

agar riwayat perubahan file tetap terjaga.

Tidak diperlukan perubahan struktur.

---

# Keputusan Audit

Disetujui melakukan perubahan berikut:

- Menetapkan checksum menggunakan SHA-256.
- Menyeragamkan nama kolom path menjadi path_file.
- Tetap memisahkan metadata file dengan metadata arsip.
- Versioning tetap berada pada tabel Versi Dokumen.

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

1. Dokumen Arsip menjadi repository file digital pada sistem LARAS.
2. Metadata file dipisahkan dari metadata Arsip.
3. Checksum menggunakan algoritma SHA-256.
4. Penamaan kolom path diseragamkan menjadi path_file.
5. Riwayat perubahan file dikelola melalui tabel Versi Dokumen.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.