# LARAS

# Permission Matrix

Status

✅ FINAL

---

# Standar Penamaan

Format

modul.aksi

Contoh

arsip.view

workflow.approve

user.create

---

# Arsip

| Permission | Fungsi |
|------------|---------|
| arsip.view | Melihat arsip |
| arsip.create | Menambah arsip |
| arsip.update | Mengubah arsip |
| arsip.delete | Menghapus arsip |
| arsip.restore | Restore arsip |

---

# Dokumen Arsip

| Permission | Fungsi |
|------------|---------|
| dokumen.view | Melihat dokumen |
| dokumen.upload | Upload dokumen |
| dokumen.download | Download dokumen |
| dokumen.delete | Menghapus dokumen |

---

# Workflow

| Permission | Fungsi |
|------------|---------|
| workflow.view | Melihat workflow |
| workflow.verify | Verifikasi |
| workflow.approve | Persetujuan |
| workflow.reject | Penolakan |

---

# Audit Log

| Permission | Fungsi |
|------------|---------|
| auditlog.view | Melihat audit log |

---

# Master Data

Seluruh master menggunakan pola:

master.view

master.create

master.update

master.delete

Contoh:

jenis-arsip.view

retensi-arsip.create

lokasi-arsip.update

jabatan.delete

---

# User

| Permission | Fungsi |
|------------|---------|
| user.view | Melihat pengguna |
| user.create | Menambah pengguna |
| user.update | Mengubah pengguna |
| user.delete | Menghapus pengguna |

---

# Role

| Permission | Fungsi |
|------------|---------|
| role.view | Melihat role |
| role.create | Menambah role |
| role.update | Mengubah role |
| role.delete | Menghapus role |

---

# Permission

| Permission | Fungsi |
|------------|---------|
| permission.view | Melihat permission |
| permission.create | Menambah permission |
| permission.update | Mengubah permission |
| permission.delete | Menghapus permission |