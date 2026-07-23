# LARAS

# Implementasi

Modul : Operasional

Tahap : Model

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi Model Laravel untuk seluruh modul Operasional berdasarkan hasil audit database yang telah disetujui.

Model bertanggung jawab merepresentasikan entitas bisnis, mengelola relasi antar tabel, menyediakan query yang efisien, serta menjadi pusat interaksi dengan database menggunakan Eloquent ORM.

---

# Referensi Audit

- docs/audit/OPERASIONAL/
- docs/audit/SUMMARY/OPERASIONAL_SUMMARY.md
- docs/audit/SUMMARY/DATABASE_FINAL.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md

---

# Ruang Lingkup

Implementasi Model untuk:

1. Arsip
2. Dokumen Arsip
3. Versi Dokumen
4. Workflow
5. Audit Log

---

# Checklist Implementasi

## Fillable

☐ Menentukan fillable setiap model

☐ Tidak menggunakan guarded kecuali diperlukan

☐ Menyesuaikan hasil audit

---

## Casts

☐ Boolean

☐ Date

☐ Datetime

☐ JSON

☐ Enum (jika digunakan)

---

## Relationship

☐ belongsTo()

☐ hasMany()

☐ hasOne()

☐ morphMany() (jika diperlukan)

☐ morphTo() (jika diperlukan)

---

## Scope

☐ Scope Active

☐ Scope Search

☐ Scope Filter

☐ Scope Sorting

☐ Scope By Unit Organisasi

☐ Scope By Status

---

## Accessor & Mutator

☐ Format tanggal

☐ Format nama file

☐ Format status

☐ Attribute tambahan bila diperlukan

---

## Soft Delete

☐ Menggunakan SoftDeletes sesuai hasil audit

☐ Relasi tetap berjalan pada data yang dihapus (jika diperlukan)

---

## Route Model Binding

☐ Menggunakan Route Model Binding

☐ Konsisten pada seluruh Controller

---

# Checklist per Model

## Arsip

☐ Fillable

☐ Casts

☐ Relationship

☐ Scope

☐ Accessor

☐ Testing

---

## Dokumen Arsip

☐ Relationship ke Arsip

☐ Relationship ke Versi Dokumen

☐ Fillable

☐ Casts

☐ Testing

---

## Versi Dokumen

☐ Relationship ke Dokumen Arsip

☐ Fillable

☐ Casts

☐ Testing

---

## Workflow

☐ Relationship ke Arsip

☐ Relationship ke User

☐ Fillable

☐ Casts

☐ Testing

---

## Audit Log

☐ Relationship ke User

☐ Relationship ke Arsip

☐ Fillable

☐ Casts

☐ Testing

---

# Standar Relationship

Relationship harus mengikuti RELATIONSHIP_MATRIX.md.

Tidak diperbolehkan menambahkan relasi baru tanpa melalui proses audit.

---

# Standar Query

Gunakan Eloquent ORM.

Hindari Query Builder secara langsung apabila relasi dapat diselesaikan melalui Eloquent.

Gunakan eager loading untuk menghindari N+1 Query.

---

# Standar Scope

Minimal setiap model mendukung:

☐ Search

☐ Filter

☐ Sorting

☐ Pagination

Scope harus reusable dan dapat digunakan oleh Controller maupun API.

---

# Checklist Pengujian

☐ Relationship berjalan.

☐ Fillable sesuai.

☐ Casts berjalan.

☐ Scope menghasilkan data yang benar.

☐ Route Model Binding berjalan.

☐ Soft Delete berjalan (jika digunakan).

☐ Tidak terjadi N+1 Query.

---

# Urutan Implementasi

1. Review Model lama.
2. Sesuaikan Fillable.
3. Tambahkan Casts.
4. Tambahkan Relationship.
5. Tambahkan Scope.
6. Tambahkan Accessor/Mutator.
7. Uji seluruh relasi.
8. Commit perubahan.

---

# Output

Output implementasi pada tahap ini:

- Seluruh Model Operasional sesuai hasil audit.
- Relationship tervalidasi.
- Scope reusable tersedia.
- Backend siap digunakan oleh Controller dan API.

---

# Keputusan Final

1. Seluruh Model menggunakan Eloquent ORM.
2. Relationship mengacu pada Relationship Matrix.
3. Scope dibuat reusable untuk Search, Filter, Sorting, dan Pagination.
4. Optimasi query dilakukan melalui eager loading.
5. Tahap berikutnya adalah implementasi Workflow.