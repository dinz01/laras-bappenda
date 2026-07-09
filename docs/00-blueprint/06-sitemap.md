---
kode: BP-06
judul: Sitemap
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-06 — Sitemap

## 1. Pendahuluan

Dokumen ini menjelaskan struktur halaman (sitemap) Sistem LARAS yang terdiri atas Portal Publik dan Portal Internal. Sitemap menjadi acuan dalam pengembangan React Pages, routing Laravel + Inertia, serta struktur navigasi aplikasi.

---

# 2. Portal Publik

```
Beranda
│
├── Tentang LARAS
├── Informasi Layanan
├── Tata Cara Permohonan Arsip
├── FAQ
├── Kontak
│
├── Permohonan Arsip
│   ├── Form Permohonan
│   ├── Berhasil Mengajukan
│   └── Upload Dokumen Persyaratan
│
├── Cek Status Permohonan
│   ├── Detail Permohonan
│   └── Riwayat Status
│
├── Unduh Arsip
│
├── Verifikasi QR Code
│
└── Halaman Error
    ├── 403
    ├── 404
    └── 500
```

---

# 3. Portal Internal

```
Login

Dashboard

├── Dashboard

├── Master Data
│   ├── Unit Organisasi
│   ├── Klasifikasi Arsip
│   ├── Jenis Arsip
│   ├── Media Arsip
│   └── JRA (Jadwal Retensi Arsip)

├── Repository Arsip
│   ├── Daftar Arsip
│   ├── Tambah Arsip
│   ├── Detail Arsip
│   ├── Edit Arsip
│   └── Riwayat Arsip

├── Record Center
│   ├── Daftar Arsip
│   └── Detail

├── Retensi Arsip
│   ├── Daftar Retensi
│   ├── Arsip Jatuh Tempo
│   └── Riwayat Retensi

├── Pemusnahan Arsip
│   ├── Daftar Pemusnahan
│   ├── Persetujuan
│   └── Riwayat

├── Permohonan Arsip
│   ├── Internal
│   ├── Publik
│   ├── Detail Permohonan
│   ├── Verifikasi
│   ├── Persetujuan
│   └── Riwayat

├── Pengguna
│   ├── Daftar Pengguna
│   ├── Tambah Pengguna
│   ├── Detail
│   └── Edit

├── Role
│   ├── Daftar Role
│   ├── Tambah Role
│   └── Permission

├── Audit Log

├── Dashboard Statistik

├── Pengaturan
│   ├── Profil Instansi
│   ├── Pengaturan Umum
│   ├── Email
│   ├── Storage
│   ├── OCR
│   ├── AI
│   ├── TTE
│   ├── Meilisearch
│   └── Backup

└── Profil Saya
    ├── Profil
    ├── Ubah Password
    └── Logout
```

---

# 4. Struktur Navigasi Sidebar

```
Dashboard

Master Data

Repository Arsip

Record Center

Retensi Arsip

Pemusnahan Arsip

Permohonan Arsip

Pengguna

Role & Permission

Audit Log

Dashboard Statistik

Pengaturan
```

Menu yang tampil disesuaikan dengan Role dan Permission pengguna.

---

# 5. Struktur Routing

## Portal Publik

```
/

tentang

layanan

faq

kontak

permohonan

permohonan/berhasil

permohonan/upload

cek-status

cek-status/{kode}

unduh/{token}

verifikasi
```

---

## Portal Internal

```
/login

/dashboard

/master-data

/repository-arsip

/record-center

/retensi

/pemusnahan

/permohonan

/users

/roles

/audit-log

/statistik

/settings

/profile
```

---

# 6. Aturan Navigasi

- Portal Publik dapat diakses tanpa login.
- Portal Internal hanya dapat diakses setelah autentikasi.
- Sidebar menampilkan menu sesuai Role dan Permission.
- Pengguna tidak dapat mengakses halaman tanpa izin.
- Breadcrumb ditampilkan pada setiap halaman internal.
- Halaman yang tidak ditemukan akan menampilkan halaman 404.

---

# 7. Kesimpulan

Sitemap Sistem LARAS dibagi menjadi Portal Publik dan Portal Internal. Pembagian ini bertujuan untuk memisahkan layanan masyarakat dengan pengelolaan arsip internal sehingga keamanan, kemudahan penggunaan, dan pengembangan sistem dapat dilakukan secara lebih terstruktur.