# LARAS

# Audit Database

Modul : Operasional

Nomor : 01

Nama : Arsip

Status :

✅ FINAL

---

# Tujuan

Tabel Arsip merupakan tabel inti (core table) dalam sistem LARAS yang digunakan untuk menyimpan metadata utama setiap arsip.

Setiap arsip memiliki identitas unik dan menjadi pusat relasi dengan master data, dokumen digital, workflow, serta audit log.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_arsip_table.php
- add_workflow_to_arsip_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| nomor_arsip |
| kode_klasifikasi |
| judul |
| uraian |
| tanggal_arsip |
| jenis_arsip_id |
| klasifikasi_arsip_id |
| retensi_arsip_id |
| sifat_arsip_id |
| media_arsip_id |
| kondisi_arsip_id |
| status_arsip_id |
| tingkat_akses_arsip_id |
| tingkat_perkembangan_arsip_id |
| lokasi_arsip_id |
| unit_organisasi_id |
| workflow_status |
| created_by |
| created_at |
| updated_at |
| deleted_at |

---

# Relasi

Arsip

belongsTo

- Jenis Arsip
- Klasifikasi Arsip
- Retensi Arsip
- Sifat Arsip
- Media Arsip
- Kondisi Arsip
- Status Arsip
- Tingkat Akses Arsip
- Tingkat Perkembangan Arsip
- Lokasi Arsip
- Unit Organisasi
- User (created_by)

hasMany

- Dokumen Arsip
- Workflow
- Audit Log

---

# Hasil Audit

## Yang Sudah Sesuai

- Struktur tabel sudah menjadi pusat seluruh metadata arsip.
- Menggunakan Soft Delete.
- Menggunakan created_by untuk pencatatan pembuat arsip.
- Workflow dipisahkan pada migration tersendiri.
- Relasi dengan master data sebagian besar sudah tersedia.

---

## Temuan Audit

### ARSIP-001 (Critical)

Kolom

jenis_dokumen_id

masih digunakan pada migration.

Sedangkan sistem menggunakan master:

Jenis Arsip

Keputusan:

Mengubah menjadi

jenis_arsip_id

---

### ERD-001 (High)

Belum terdapat relasi

sifat_arsip_id

Padahal sifat arsip merupakan metadata utama arsip.

Keputusan:

Menambahkan Foreign Key

sifat_arsip_id

---

### ERD-002 (High)

Belum terdapat relasi

tingkat_perkembangan_arsip_id

Padahal master sudah tersedia.

Keputusan:

Menambahkan Foreign Key

tingkat_perkembangan_arsip_id

---

### ARSIP-003 (Medium)

Kolom

file_path

masih berada pada tabel arsip.

Hal ini menyebabkan metadata arsip bercampur dengan metadata dokumen digital.

Keputusan:

Menghapus kolom

file_path

File digital sepenuhnya dikelola oleh tabel

dokumen_arsip

---

# Keputusan Audit

Disetujui melakukan perubahan berikut:

- Mengganti jenis_dokumen_id menjadi jenis_arsip_id.
- Menambahkan relasi sifat_arsip_id.
- Menambahkan relasi tingkat_perkembangan_arsip_id.
- Menghapus kolom file_path dari tabel arsip.
- Metadata file digital dipindahkan ke tabel dokumen_arsip.

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

Policy

☑

React

☑

Testing

☑

---

# Keputusan Final

1. Arsip tetap menjadi tabel inti sistem LARAS.
2. Metadata arsip dan metadata file digital dipisahkan.
3. Jenis Arsip menjadi referensi resmi menggantikan Jenis Dokumen.
4. Menambahkan relasi ke Sifat Arsip.
5. Menambahkan relasi ke Tingkat Perkembangan Arsip.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.