# LARAS

# Audit Database

Modul : Operasional

Nomor : 04

Nama : Workflow

Status :

✅ FINAL

---

# Tujuan

Tabel Workflow digunakan untuk mencatat seluruh riwayat perubahan status proses bisnis pada setiap arsip.

Workflow tidak mencatat perubahan data, tetapi mencatat perjalanan proses arsip mulai dari pembuatan, verifikasi, persetujuan, hingga penyelesaian.

Setiap perubahan status harus menghasilkan satu histori workflow agar seluruh proses bisnis dapat ditelusuri.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_arsip_workflow_histories_table.php
- add_workflow_to_arsip_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| arsip_id |
| status_lama |
| status_baru |
| action |
| keterangan |
| user_id |
| created_at |

---

# Relasi

Workflow

belongsTo

- Arsip
- User

---

# Hasil Audit

## Yang Sudah Sesuai

- Workflow dipisahkan dari Audit Log.
- Riwayat workflow disimpan dalam tabel tersendiri.
- Mencatat status sebelum dan sesudah perubahan.
- Mencatat pengguna yang melakukan perubahan.
- Menggunakan timestamp sebagai urutan histori.

---

## Temuan Audit

### OPS-004 (Medium)

Belum terdapat kolom

action

Status lama dan status baru memang menjelaskan perpindahan workflow, namun belum menjelaskan aksi bisnis yang dilakukan.

Contoh:

- submit
- verify
- approve
- reject
- revise
- archive
- restore

Keputusan:

Menambahkan kolom

action

---

### OPS-005 (Informasi)

Workflow tidak menyimpan dokumen pendukung.

Lampiran seperti berita acara, dokumen persetujuan, atau dokumen TTE tetap disimpan pada tabel Dokumen Arsip.

Tidak diperlukan perubahan struktur.

---

### OPS-006 (Informasi)

Timestamp menggunakan

created_at

sudah cukup untuk menentukan urutan proses.

Tidak diperlukan kolom tambahan seperti:

- approved_at
- verified_at
- archived_at

---

### OPS-007 (Informasi)

Kolom

status_lama

dan

status_baru

tetap menggunakan tipe string.

Riwayat workflow harus mempertahankan nilai historis meskipun nama status berubah di masa depan.

Tidak disarankan menggunakan Foreign Key.

---

# Keputusan Audit

Disetujui melakukan perubahan berikut:

- Menambahkan kolom action.
- Tetap menggunakan status_lama dan status_baru bertipe string.
- Workflow tetap dipisahkan dari Audit Log.
- Dokumen pendukung workflow tetap berada pada Dokumen Arsip.

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

1. Workflow digunakan untuk mencatat perjalanan proses bisnis arsip.
2. Audit Log dan Workflow tetap dipisahkan.
3. Menambahkan kolom action untuk menjelaskan aksi bisnis.
4. Status workflow tetap disimpan sebagai string agar histori tidak berubah.
5. Dokumen pendukung workflow tetap disimpan pada Dokumen Arsip.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.