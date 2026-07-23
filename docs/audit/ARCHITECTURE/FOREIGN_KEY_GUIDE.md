# LARAS

# Foreign Key Guide

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi pedoman implementasi Foreign Key pada seluruh database Sistem LARAS.

Seluruh relasi antar tabel harus mengikuti panduan ini agar integritas data tetap terjaga, struktur database konsisten, dan proses pengembangan lebih mudah dipelihara.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Modul baru

---

# Ruang Lingkup

Panduan ini mencakup:

- Foreign Key
- Relationship
- Cascade Rule
- Restrict Rule
- Nullable Foreign Key
- Index
- Penamaan Foreign Key

---

# Prinsip

Foreign Key digunakan untuk menjaga integritas data.

Tidak diperbolehkan menyimpan referensi ID tanpa constraint database.

Setiap relasi harus memiliki alasan bisnis yang jelas.

---

# Standar Penamaan

Seluruh Foreign Key mengikuti format:

```

<nama_tabel>\_id

```

Contoh:

```

jenis_arsip_id

klasifikasi_arsip_id

retensi_arsip_id

status_arsip_id

unit_organisasi_id

jabatan_id

created_by

updated_by

deleted_by

```

---

# Aturan Relationship

## One To Many

Menggunakan:

```

belongsTo()

hasMany()

```

Contoh:

Unit Organisasi

↓

Arsip

---

## One To One

Menggunakan:

```

belongsTo()

hasOne()

```

Hanya digunakan apabila benar-benar diperlukan.

---

## Many To Many

Menggunakan:

```

belongsToMany()

```

Disertai Pivot Table.

Contoh:

User

↓

Role

↓

Permission

---

# Laravel Standard

Gunakan:

```php
$table->foreignId('unit_organisasi_id')
      ->constrained()
      ->cascadeOnUpdate()
      ->restrictOnDelete();
```

Tidak menggunakan integer() untuk Foreign Key.

---

# Cascade Rule

## Update

Seluruh Foreign Key menggunakan:

```

cascadeOnUpdate()

```

Agar perubahan Primary Key tetap konsisten.

---

## Delete

Pemilihan aturan delete mengikuti kebutuhan bisnis.

---

### restrictOnDelete()

Digunakan apabila data induk tidak boleh dihapus selama masih digunakan.

Contoh:

- Klasifikasi Arsip
- Retensi Arsip
- Unit Organisasi
- Jabatan

---

### cascadeOnDelete()

Digunakan apabila data turunan memang harus ikut dihapus.

Contoh:

- Pivot Table
- Temporary Data

---

### nullOnDelete()

Digunakan apabila relasi bersifat opsional.

Contoh:

- deleted_by
- approved_by

---

# Nullable Foreign Key

Gunakan nullable hanya apabila secara bisnis memang diperbolehkan.

Contoh:

```php
$table->foreignId('approved_by')
      ->nullable()
      ->constrained('users')
      ->nullOnDelete();
```

---

# Index

Seluruh Foreign Key wajib memiliki Index.

Laravel secara otomatis membuat Index melalui constrained().

---

# Relationship Matrix

Seluruh relasi wajib mengacu pada:

SUMMARY/RELATIONSHIP_MATRIX.md

Tidak diperbolehkan membuat relasi baru tanpa audit.

---

# Master Data

Foreign Key hanya menuju Master Data.

Tidak boleh terjadi relasi antar Master Data yang tidak diperlukan.

---

# Operasional

Tabel Operasional menjadi pusat relasi.

Contoh:

Arsip

↓

Dokumen Arsip

↓

Versi Dokumen

↓

Workflow

↓

Audit Log

---

# RBAC

Seluruh User menggunakan Foreign Key menuju:

- Unit Organisasi
- Jabatan

Role dan Permission menggunakan Spatie.

Tidak membuat tabel RBAC sendiri.

---

# Soft Delete

Foreign Key tetap mengacu pada data walaupun menggunakan Soft Delete.

Relasi tidak boleh rusak.

---

# Migration Standard

Setiap Foreign Key harus:

☐ Menggunakan foreignId()

☐ Menggunakan constrained()

☐ Menggunakan cascadeOnUpdate()

☐ Menggunakan aturan Delete yang sesuai

☐ Menggunakan nama kolom sesuai standar

---

# Checklist

## Struktur

☐ Seluruh FK menggunakan foreignId()

☐ Seluruh FK memiliki constraint

☐ Seluruh FK memiliki index

☐ Nama FK konsisten

---

## Relationship

☐ belongsTo()

☐ hasMany()

☐ belongsToMany()

☐ hasOne() bila diperlukan

---

## Integrity

☐ Tidak ada orphan data

☐ Delete sesuai aturan bisnis

☐ Update konsisten

---

## Testing

☐ Foreign Key berhasil dibuat

☐ Constraint berjalan

☐ Cascade berjalan

☐ Restrict berjalan

☐ Null berjalan

---

# Referensi

- DATABASE_PRINCIPLES.md
- RELATIONSHIP_MATRIX.md
- DATABASE_FINAL.md

---

# Keputusan Final

1. Seluruh relasi menggunakan Foreign Key.
2. Tidak diperbolehkan menyimpan referensi ID tanpa constraint.
3. Seluruh aturan Delete mengikuti kebutuhan bisnis.
4. Relationship harus mengacu pada hasil Audit.
5. Dokumen ini menjadi pedoman implementasi seluruh Foreign Key pada Sistem LARAS.