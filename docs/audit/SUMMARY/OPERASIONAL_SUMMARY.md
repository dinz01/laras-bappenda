# LARAS

# Ringkasan Audit Database

Modul : Operasional

Status :

✅ FINAL

---

# Tujuan

Dokumen ini merupakan ringkasan hasil audit seluruh tabel Operasional pada sistem LARAS.

Ringkasan ini digunakan sebagai acuan utama pada tahap refactor database, model, seeder, controller, dan React.

---

# Tabel yang Diaudit

| No | Tabel | Status |
|----|----------------------|--------|
| 01 | Arsip | ✅ FINAL |
| 02 | Dokumen Arsip | ✅ FINAL |
| 03 | Versi Dokumen | ✅ FINAL |
| 04 | Workflow | ✅ FINAL |
| 05 | Audit Log | ✅ FINAL |

---

# Ringkasan Arsitektur

Operasional LARAS terdiri dari lima tabel utama.

Arsip

↓

Dokumen Arsip

↓

Versi Dokumen

serta

Arsip

↓

Workflow

dan

Arsip

↓

Audit Log

Setiap tabel memiliki tanggung jawab yang berbeda sehingga tidak terjadi duplikasi data maupun pencampuran fungsi.

---

# Ringkasan Temuan Audit

## Critical

### ARSIP-001

Mengganti

jenis_dokumen_id

menjadi

jenis_arsip_id

Status

✅ Disetujui

---

## High

### ERD-001

Menambahkan

sifat_arsip_id

Status

✅ Disetujui

---

### ERD-002

Menambahkan

tingkat_perkembangan_arsip_id

Status

✅ Disetujui

---

### ARSIP-004

Menambahkan

catatan_perubahan

pada

Versi Dokumen

Status

✅ Disetujui

---

## Medium

### ARSIP-003

Menghapus

file_path

dari tabel Arsip.

Metadata file dipindahkan ke

Dokumen Arsip.

Status

✅ Disetujui

---

### OPS-004

Menambahkan

action

pada Workflow.

Status

✅ Disetujui

---

### OPS-001

Menambahkan

change_reason

pada Audit Log.

Status

✅ Disetujui

---

## Low

### OPS-002

Casting JSON

old_values

dan

new_values

pada Model Audit Log.

Status

✅ Disetujui

---

### OPS-003

Snapshot nama pengguna bersifat opsional.

Tidak menjadi perubahan wajib.

---

# Ringkasan Perubahan Struktur

## Arsip

Perubahan

- Mengganti jenis_dokumen_id menjadi jenis_arsip_id.
- Menambahkan sifat_arsip_id.
- Menambahkan tingkat_perkembangan_arsip_id.
- Menghapus file_path.

---

## Dokumen Arsip

Perubahan

- Menetapkan checksum menggunakan SHA-256.
- Standarisasi path_file.

---

## Versi Dokumen

Perubahan

- Menambahkan catatan_perubahan.

---

## Workflow

Perubahan

- Menambahkan action.

---

## Audit Log

Perubahan

- Menambahkan change_reason.
- Casting JSON pada Model.

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

# Kesimpulan

Seluruh tabel Operasional telah selesai diaudit.

Sebagian besar struktur database telah sesuai dengan kebutuhan sistem LARAS.

Perubahan yang disetujui berfokus pada:

- penyempurnaan relasi,
- pemisahan tanggung jawab antar tabel,
- peningkatan audit trail,
- peningkatan konsistensi penamaan.

Seluruh perubahan akan diterapkan pada tahap refactor setelah seluruh proses audit database selesai.

---

# Status Modul

MASTER

✅ FINAL

OPERASIONAL

✅ FINAL

RBAC

⬜ BELUM DIAUDIT