---
kode: BP-05
judul: Aktor dan Hak Akses
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-05 — Aktor dan Hak Akses

## 1. Pendahuluan

Dokumen ini menjelaskan seluruh aktor yang terlibat dalam Sistem LARAS beserta hak akses yang dimiliki. Hak akses diterapkan menggunakan Role Based Access Control (RBAC) dengan package Spatie Laravel Permission.

Setiap pengguna hanya dapat mengakses fitur sesuai dengan role yang dimiliki.

---

# 2. Jenis Aktor

Sistem LARAS memiliki dua kelompok aktor.

## 2.1 Pengguna Internal

- Super Administrator
- Administrator
- Arsiparis
- Pimpinan
- Pegawai

## 2.2 Pengguna Eksternal

- Pemohon Arsip

---

# 3. Deskripsi Aktor

## 3.1 Super Administrator

Merupakan pengguna dengan hak akses tertinggi.

Bertanggung jawab terhadap:

- Konfigurasi sistem
- Manajemen seluruh pengguna
- Manajemen role
- Manajemen permission
- Pengaturan aplikasi
- Monitoring sistem

---

## 3.2 Administrator

Bertanggung jawab terhadap administrasi aplikasi.

Memiliki akses:

- Dashboard
- Data pengguna
- Unit organisasi
- Klasifikasi arsip
- Monitoring
- Laporan

---

## 3.3 Arsiparis

Bertanggung jawab terhadap pengelolaan arsip.

Memiliki akses:

- Repository Arsip
- Upload Arsip
- Edit Arsip
- Record Center
- Retensi Arsip
- Pemusnahan Arsip
- Persetujuan Permohonan
- Dashboard Arsip

---

## 3.4 Pimpinan

Memiliki akses untuk:

- Dashboard
- Monitoring
- Statistik
- Laporan
- Persetujuan tertentu sesuai kebijakan organisasi

Pimpinan tidak melakukan pengelolaan arsip secara langsung.

---

## 3.5 Pegawai

Pegawai internal dapat:

- Login
- Mencari arsip sesuai hak akses
- Mengajukan permohonan arsip
- Melihat status permohonan
- Mengunduh arsip yang diizinkan

---

## 3.6 Pemohon Arsip

Pengguna eksternal tanpa akun.

Dapat:

- Mengajukan permohonan arsip
- Mengunggah dokumen persyaratan
- Melihat status permohonan menggunakan kode permohonan
- Mengunduh arsip yang telah disetujui
- Memverifikasi QR Code dokumen

---

# 4. Matriks Hak Akses

| Modul | Super Admin | Admin | Arsiparis | Pimpinan | Pegawai | Pemohon |
|--------|-------------|--------|------------|-----------|-----------|-----------|
| Login Internal | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Dashboard | ✓ | ✓ | ✓ | ✓ | - | - |
| Manajemen Pengguna | ✓ | ✓ | - | - | - | - |
| Role & Permission | ✓ | - | - | - | - | - |
| Unit Organisasi | ✓ | ✓ | - | - | - | - |
| Klasifikasi Arsip | ✓ | ✓ | ✓ | - | - | - |
| Repository Arsip | ✓ | ✓ | ✓ | - | Lihat | - |
| Upload Arsip | ✓ | ✓ | ✓ | - | - | - |
| Edit Arsip | ✓ | ✓ | ✓ | - | - | - |
| Record Center | ✓ | ✓ | ✓ | - | - | - |
| Retensi Arsip | ✓ | ✓ | ✓ | - | - | - |
| Pemusnahan Arsip | ✓ | ✓ | ✓ | Persetujuan | - | - |
| Permohonan Arsip Internal | ✓ | ✓ | ✓ | - | ✓ | - |
| Permohonan Arsip Publik | - | - | Verifikasi | - | - | ✓ |
| Persetujuan Permohonan | ✓ | ✓ | ✓ | Opsional | - | - |
| Audit Log | ✓ | ✓ | Lihat | Lihat | - | - |
| Dashboard Statistik | ✓ | ✓ | ✓ | ✓ | - | - |
| Pengaturan Sistem | ✓ | - | - | - | - | - |

---

# 5. Aturan Hak Akses

Sistem menerapkan aturan berikut.

- Seluruh hak akses dikendalikan menggunakan Role dan Permission.
- Permission dapat dimiliki lebih dari satu role.
- Satu pengguna dapat memiliki lebih dari satu role apabila diperlukan.
- Hak akses selalu diperiksa sebelum pengguna mengakses suatu fitur.
- Menu yang tidak memiliki izin tidak ditampilkan kepada pengguna.
- Seluruh pelanggaran akses dicatat pada Audit Log.

---

# 6. Permission Utama

Permission minimal yang digunakan pada versi pertama sistem.

## Dashboard

- dashboard.view

## User

- users.view
- users.create
- users.update
- users.delete

## Role

- roles.view
- roles.create
- roles.update
- roles.delete

## Permission

- permissions.view
- permissions.update

## Arsip

- archives.view
- archives.create
- archives.update
- archives.delete
- archives.download

## Permohonan Arsip

- requests.view
- requests.create
- requests.verify
- requests.approve
- requests.reject
- requests.download

## Record Center

- record-center.view
- record-center.manage

## Retensi

- retention.view
- retention.manage

## Pemusnahan

- destruction.view
- destruction.manage

## Audit Log

- audit.view

## Pengaturan

- settings.manage

---

# 7. Kebijakan Keamanan

Untuk menjaga keamanan sistem, diterapkan kebijakan berikut.

- Pengguna wajib melakukan autentikasi sebelum mengakses Portal Internal.
- Password disimpan menggunakan hashing Laravel.
- Session akan berakhir secara otomatis apabila tidak ada aktivitas.
- Hak akses diverifikasi pada setiap request.
- Aktivitas penting dicatat pada Audit Log.
- Dokumen hanya dapat diakses oleh pengguna yang memiliki izin.

---

# 8. Kesimpulan

Pembagian aktor dan hak akses pada Sistem LARAS bertujuan untuk memastikan setiap pengguna hanya dapat mengakses fitur sesuai tugas dan kewenangannya. Pendekatan Role Based Access Control (RBAC) memberikan fleksibilitas dalam pengelolaan hak akses sekaligus meningkatkan keamanan sistem.