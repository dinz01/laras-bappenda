# LARAS

# Audit Database

Modul : Operasional

Nomor : 05

Nama : Audit Log

Status :

✅ FINAL

---

# Tujuan

Tabel Audit Log digunakan untuk mencatat seluruh perubahan data yang terjadi di dalam sistem LARAS.

Audit Log berfungsi sebagai jejak audit (audit trail) yang merekam siapa yang melakukan perubahan, kapan perubahan dilakukan, serta nilai data sebelum dan sesudah perubahan.

Audit Log mendukung kebutuhan akuntabilitas, keamanan, investigasi, dan kepatuhan terhadap tata kelola arsip.

---

# Referensi Audit

## Dokumen Acuan

- LARAS Bappenda
- Audit Database Sebelumnya

## File yang Diaudit

Migration

- create_audit_logs_table.php

---

# Struktur Final

| Kolom |
|--------|
| id |
| auditable_type |
| auditable_id |
| event |
| old_values |
| new_values |
| change_reason |
| user_id |
| ip_address |
| user_agent |
| created_at |

---

# Relasi

Audit Log

morphTo

- Auditable

belongsTo

- User

---

# Hasil Audit

## Yang Sudah Sesuai

- Menggunakan Polymorphic Relation (auditable_type dan auditable_id).
- Mendukung pencatatan nilai sebelum dan sesudah perubahan.
- Mencatat pengguna yang melakukan perubahan.
- Menyimpan alamat IP pengguna.
- Menyimpan User Agent.
- Dapat digunakan oleh seluruh modul sistem tanpa membuat tabel audit terpisah.

---

## Temuan Audit

### OPS-001 (Medium)

Belum terdapat kolom

change_reason

Audit Log saat ini hanya mencatat apa yang berubah, namun belum menjelaskan alasan perubahan tersebut.

Contoh:

- Perbaikan salah input.
- Penyesuaian berdasarkan SK terbaru.
- Koreksi metadata arsip.

Keputusan:

Menambahkan kolom

change_reason

---

### OPS-002 (Low)

Kolom

old_values

dan

new_values

harus menggunakan JSON dan dilakukan casting pada Model.

Hal ini bertujuan agar perubahan data dapat dibaca secara terstruktur.

Keputusan:

Tidak memerlukan perubahan struktur migration.

Implementasi dilakukan pada Model.

---

### OPS-003 (Low)

Saat ini hanya terdapat

user_id

Apabila nama pengguna berubah di masa depan, histori audit akan menampilkan nama terbaru melalui relasi.

Snapshot nama pengguna dapat dipertimbangkan apabila diperlukan untuk kebutuhan forensik.

Keputusan:

Tidak menjadi perubahan wajib.

---

# Keputusan Audit

Disetujui melakukan perubahan berikut:

- Menambahkan kolom change_reason.
- Melakukan casting JSON pada old_values dan new_values di Model.
- Snapshot nama pengguna bersifat opsional dan belum menjadi kebutuhan sistem saat ini.

---

# Dampak Implementasi

Migration

☑

Model

☑

Seeder

☒

Factory

☒

Request

☒

Controller

☑

Policy

☒

React

☒

Testing

☑

---

# Keputusan Final

1. Audit Log tetap menggunakan Polymorphic Relationship.
2. Audit Log digunakan oleh seluruh modul sistem.
3. Menambahkan kolom change_reason sebagai alasan perubahan data.
4. old_values dan new_values menggunakan format JSON.
5. Snapshot nama pengguna belum menjadi kebutuhan wajib.
6. Seluruh perubahan diterapkan pada tahap refactor setelah seluruh proses audit selesai.