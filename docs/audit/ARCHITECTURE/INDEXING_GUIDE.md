# LARAS

# Indexing Guide

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi pedoman implementasi Index pada seluruh database Sistem LARAS.

Tujuan utama penggunaan Index adalah meningkatkan performa query, mempercepat proses pencarian, penyaringan, pengurutan, dan relasi antar tabel tanpa mengorbankan integritas data.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Modul baru

---

# Ruang Lingkup

Panduan ini mencakup:

- Primary Index
- Foreign Key Index
- Unique Index
- Composite Index
- Full Text Index
- Index Maintenance

---

# Prinsip

Index dibuat berdasarkan kebutuhan query.

Tidak seluruh kolom harus diberi Index.

Setiap Index harus memiliki alasan penggunaan yang jelas.

Index yang tidak digunakan harus dihindari.

---

# Primary Key

Seluruh tabel wajib memiliki Primary Key.

Laravel:

```php
$table->id();
```

Primary Key otomatis memiliki Index.

---

# Foreign Key

Seluruh Foreign Key wajib memiliki Index.

Contoh:

```php
$table->foreignId('unit_organisasi_id')
      ->constrained();
```

Laravel otomatis membuat Index.

---

# Unique Index

Digunakan untuk data yang harus unik.

Contoh:

- kode
- email
- username
- nomor_arsip (jika diputuskan unik)

Laravel:

```php
$table->string('kode')->unique();
```

---

# Composite Index

Digunakan apabila query sering menggunakan lebih dari satu kolom.

Contoh:

```php
$table->index([
    'unit_organisasi_id',
    'status_arsip_id'
]);
```

---

# Full Text Index

Digunakan hanya pada kolom yang memerlukan pencarian teks.

Contoh:

- uraian
- deskripsi
- catatan

Laravel:

```php
$table->fullText('deskripsi');
```

Tidak digunakan pada seluruh tabel.

---

# Kolom yang Direkomendasikan Memiliki Index

## Master Data

☑ kode

☑ nama (jika sering dicari)

---

## Arsip

☑ nomor_arsip

☑ klasifikasi_arsip_id

☑ unit_organisasi_id

☑ status_arsip_id

☑ created_at

---

## Dokumen Arsip

☑ arsip_id

☑ created_at

---

## Versi Dokumen

☑ dokumen_arsip_id

☑ nomor_versi

---

## Workflow

☑ arsip_id

☑ user_id

☑ created_at

---

## Audit Log

☑ user_id

☑ arsip_id

☑ created_at

☑ aktivitas

---

## Users

☑ email

☑ username

☑ unit_organisasi_id

☑ jabatan_id

---

# Index yang Tidak Direkomendasikan

Jangan membuat Index pada:

- Text panjang yang jarang dicari.
- Boolean.
- Kolom yang hampir tidak pernah digunakan pada WHERE.
- Kolom yang sering berubah tanpa kebutuhan query.

---

# Composite Index yang Direkomendasikan

## Arsip

```text
klasifikasi_arsip_id
+
status_arsip_id
```

---

```text
unit_organisasi_id
+
status_arsip_id
```

---

```text
status_arsip_id
+
created_at
```

---

## Workflow

```text
arsip_id
+
created_at
```

---

## Audit Log

```text
user_id
+
created_at
```

---

# Query Optimization

Gunakan Index pada query berikut:

☐ WHERE

☐ ORDER BY

☐ JOIN

☐ GROUP BY

☐ Pagination

---

# Laravel Standard

Gunakan:

```php
$table->index('status_arsip_id');

$table->unique('kode');

$table->index([
    'status_arsip_id',
    'created_at'
]);
```

---

# Monitoring

Lakukan evaluasi Index apabila:

- Query mulai lambat.
- Data bertambah signifikan.
- Struktur tabel berubah.

Gunakan:

EXPLAIN

untuk menganalisis query.

---

# Checklist

## Primary

☐ Seluruh tabel memiliki Primary Key.

---

## Foreign Key

☐ Seluruh FK memiliki Index.

---

## Unique

☐ Seluruh kode unik menggunakan Unique Index.

---

## Composite

☐ Composite Index dibuat berdasarkan kebutuhan query.

---

## Performance

☐ Search cepat.

☐ Filter cepat.

☐ Sorting cepat.

☐ Pagination cepat.

☐ JOIN optimal.

---

## Testing

☐ Query menggunakan Index.

☐ Tidak ada duplicate Index.

☐ Tidak ada Index yang tidak digunakan.

---

# Referensi

- DATABASE_PRINCIPLES.md
- FOREIGN_KEY_GUIDE.md
- DATABASE_FINAL.md

---

# Keputusan Final

1. Index dibuat berdasarkan kebutuhan query, bukan jumlah kolom.
2. Seluruh Foreign Key wajib memiliki Index.
3. Composite Index digunakan pada query yang sering dijalankan.
4. Evaluasi performa dilakukan menggunakan EXPLAIN.
5. Dokumen ini menjadi pedoman optimasi performa database LARAS.