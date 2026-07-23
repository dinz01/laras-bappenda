# LARAS

# Implementasi

Modul : Operasional

Tahap : Migration

Status

🟡 Belum Dimulai

---

# Tujuan

Dokumen ini menjadi panduan implementasi migration untuk seluruh modul Operasional berdasarkan hasil audit database yang telah disetujui.

Migration dilakukan setelah seluruh Master Data selesai diimplementasikan agar seluruh Foreign Key dan relasi telah tersedia.

---

# Referensi Audit

- docs/audit/OPERASIONAL/
- docs/audit/SUMMARY/OPERASIONAL_SUMMARY.md
- docs/audit/SUMMARY/DATABASE_FINAL.md
- docs/audit/SUMMARY/RELATIONSHIP_MATRIX.md

---

# Ruang Lingkup

Implementasi migration untuk tabel:

1. Arsip
2. Dokumen Arsip
3. Versi Dokumen
4. Workflow
5. Audit Log

---

# Checklist Implementasi

## Arsip

☐ Review migration lama

☐ Sesuaikan struktur dengan hasil audit

☐ Tambahkan seluruh Foreign Key

☐ Tambahkan seluruh Index

☐ Tambahkan Soft Delete (jika digunakan)

☐ Testing Migration

---

## Dokumen Arsip

☐ Review migration lama

☐ Relasi ke Arsip

☐ Tambahkan seluruh Foreign Key

☐ Tambahkan Index

☐ Testing Migration

---

## Versi Dokumen

☐ Review migration lama

☐ Relasi ke Dokumen Arsip

☐ Tambahkan Foreign Key

☐ Tambahkan Index

☐ Testing Migration

---

## Workflow

☐ Review migration lama

☐ Relasi ke Arsip

☐ Relasi ke User

☐ Tambahkan Foreign Key

☐ Tambahkan Index

☐ Testing Migration

---

## Audit Log

☐ Review migration lama

☐ Relasi ke User

☐ Relasi ke Arsip

☐ Tambahkan Foreign Key

☐ Tambahkan Index

☐ Testing Migration

---

# Standar Migration

Seluruh migration wajib mengikuti standar berikut:

- Menggunakan Laravel Migration.
- Menggunakan Foreign Key Constraint.
- Menggunakan Index pada kolom pencarian.
- Menggunakan nama tabel dan kolom sesuai hasil audit.
- Menggunakan timestamp().
- Menggunakan softDeletes() hanya jika telah diputuskan pada audit.

---

# Foreign Key

Pastikan seluruh relasi sesuai dengan:

- DATABASE_FINAL.md
- RELATIONSHIP_MATRIX.md

Tidak diperbolehkan menambahkan Foreign Key di luar hasil audit.

---

# Index

Minimal index diterapkan pada:

☐ kode

☐ nomor_arsip

☐ klasifikasi_arsip_id

☐ unit_organisasi_id

☐ status_arsip_id

☐ created_at

Serta kolom lain yang sering digunakan untuk pencarian dan filter.

---

# Checklist Pengujian

☐ php artisan migrate:fresh

☐ php artisan migrate

☐ Foreign Key berhasil dibuat

☐ Index berhasil dibuat

☐ Tidak terdapat error migration

☐ Struktur tabel sesuai hasil audit

---

# Urutan Implementasi

1. Review migration lama.
2. Bandingkan dengan hasil audit.
3. Perbarui struktur tabel.
4. Tambahkan Foreign Key.
5. Tambahkan Index.
6. Jalankan migration.
7. Lakukan pengujian.
8. Commit perubahan.

---

# Output

Output implementasi pada tahap ini:

- Seluruh migration Operasional sesuai hasil audit.
- Relasi antar tabel tervalidasi.
- Struktur database siap digunakan oleh Backend.

---

# Keputusan Final

1. Migration mengikuti hasil audit tanpa penambahan struktur baru.
2. Seluruh Foreign Key mengacu pada Relationship Matrix.
3. Seluruh Index dibuat berdasarkan kebutuhan query.
4. Tahap berikutnya adalah implementasi Seeder.