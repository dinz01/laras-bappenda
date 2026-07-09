---
kode: BP-02
judul: Tujuan dan Ruang Lingkup
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-02 — Tujuan dan Ruang Lingkup

---

# Informasi Dokumen

| Informasi | Nilai |
|------------|--------|
| Kode Dokumen | BP-02 |
| Nama Dokumen | Tujuan dan Ruang Lingkup |
| Versi | 1.0.0 |
| Status | Draft |
| Dokumen Sebelumnya | BP-01 Pendahuluan |
| Dokumen Selanjutnya | BP-03 Gambaran Umum Sistem |

---

# Daftar Isi

1. Tujuan Sistem
2. Sasaran Pengembangan
3. Ruang Lingkup Sistem
4. Ruang Lingkup Portal Internal
5. Ruang Lingkup Portal Publik
6. Integrasi Sistem
7. Fitur di Luar Ruang Lingkup (Out of Scope)
8. Asumsi Pengembangan
9. Batasan Sistem
10. Referensi Dokumen
11. Riwayat Perubahan

---

# 1. Tujuan Sistem

Sistem LARAS dikembangkan untuk menyediakan layanan pengelolaan arsip digital yang modern, aman, terintegrasi, dan sesuai dengan prosedur pengelolaan arsip yang berlaku di lingkungan instansi pemerintah.

Selain sebagai repositori arsip digital, sistem ini juga menyediakan layanan permohonan arsip secara daring, pengelolaan hak akses arsip, audit aktivitas pengguna, serta kesiapan integrasi dengan layanan eksternal seperti Tanda Tangan Elektronik (TTE), Optical Character Recognition (OCR), Artificial Intelligence (AI), dan Meilisearch.

---

# 2. Sasaran Pengembangan

Pengembangan Sistem LARAS memiliki sasaran sebagai berikut.

## 2.1 Sasaran Jangka Pendek

- Menggantikan proses pengelolaan arsip manual menjadi digital.
- Menyediakan repositori arsip digital.
- Mempermudah pencarian arsip.
- Menyediakan layanan permohonan arsip digital.
- Menyediakan pengelolaan hak akses pengguna.

## 2.2 Sasaran Jangka Menengah

- Mengintegrasikan Tanda Tangan Elektronik (TTE).
- Mengintegrasikan OCR untuk ekstraksi metadata dokumen.
- Mengimplementasikan Meilisearch sebagai mesin pencarian arsip.
- Menyediakan dashboard monitoring arsip.

## 2.3 Sasaran Jangka Panjang

- Mengintegrasikan Artificial Intelligence untuk klasifikasi arsip.
- Mengimplementasikan analisis metadata otomatis.
- Mendukung integrasi dengan sistem pemerintahan lainnya.
- Mendukung pengembangan menuju Sistem Pemerintahan Berbasis Elektronik (SPBE).

---

# 3. Ruang Lingkup Sistem

Secara umum Sistem LARAS terdiri atas dua kelompok layanan utama.

1. Portal Internal
2. Portal Publik

Kedua portal menggunakan basis data yang sama, namun memiliki hak akses, fungsi, dan batasan yang berbeda.

---

# 4. Ruang Lingkup Portal Internal

Portal Internal digunakan oleh pegawai dan pengelola arsip.

Fitur utama meliputi:

- Autentikasi pengguna.
- Dashboard.
- Pengelolaan pengguna.
- Pengelolaan peran dan hak akses.
- Pengelolaan unit organisasi.
- Pengelolaan klasifikasi arsip.
- Repository Arsip.
- Record Center.
- Retensi Arsip.
- Pemusnahan Arsip.
- Permohonan Arsip Internal.
- Persetujuan Permohonan.
- Audit Log.
- Pengaturan Sistem.
- Monitoring Arsip.
- Dashboard Statistik.
- Manajemen QR Code.
- Manajemen PDF.
- Integrasi TTE.
- Integrasi OCR.
- Integrasi AI.
- Integrasi Meilisearch.

---

# 5. Ruang Lingkup Portal Publik

Portal Publik digunakan oleh masyarakat atau instansi yang mengajukan permohonan arsip.

Fitur utama meliputi:

- Beranda.
- Informasi layanan.
- Pengajuan permohonan arsip.
- Pelacakan status permohonan.
- Unggah dokumen persyaratan.
- Unduh arsip yang telah disetujui.
- Verifikasi QR Code.
- Bantuan.
- Kontak.

Portal Publik tidak memiliki akses terhadap pengelolaan arsip maupun administrasi sistem.

---

# 6. Integrasi Sistem

Sistem LARAS dirancang agar dapat diintegrasikan dengan berbagai layanan eksternal.

| Integrasi | Status Awal |
|------------|-------------|
| TTE | Mock Provider |
| OCR | OCR Ready |
| AI | AI Ready |
| Meilisearch | Search Ready |
| Email | Aktif |
| Local Storage | Aktif |

Integrasi lain dapat ditambahkan tanpa mengubah arsitektur utama sistem.

---

# 7. Fitur di Luar Ruang Lingkup (Out of Scope)

Fitur berikut tidak termasuk dalam ruang lingkup pengembangan versi awal Sistem LARAS.

- Single Sign-On (SSO).
- Mobile Application.
- Integrasi WhatsApp.
- Integrasi SMS Gateway.
- Integrasi Cloud Storage.
- Multi Tenant.
- Multi Instansi.
- Digital Preservation tingkat lanjut.
- Integrasi dengan aplikasi pemerintahan lain.

Fitur-fitur tersebut dapat dipertimbangkan pada versi berikutnya.

---

# 8. Asumsi Pengembangan

Pengembangan sistem dilakukan berdasarkan asumsi berikut.

- Pengguna memiliki akses internet.
- Pengguna menggunakan peramban modern.
- Infrastruktur server tersedia.
- Hak akses pengguna telah ditentukan oleh organisasi.
- SOP pengelolaan arsip telah ditetapkan.
- Integrasi layanan eksternal dapat dilakukan melalui API.

---

# 9. Batasan Sistem

Untuk menjaga fokus pengembangan, ditetapkan batasan sebagai berikut.

- Sistem berbasis web.
- Bahasa antarmuka menggunakan Bahasa Indonesia.
- Basis data menggunakan MySQL.
- Framework menggunakan Laravel dan React.
- Penyimpanan dokumen menggunakan Local Storage.
- OCR, AI, dan TTE disiapkan secara modular.
- Implementasi dilakukan secara bertahap berdasarkan roadmap pengembangan.

---

# 10. Referensi Dokumen

Dokumen ini berkaitan dengan:

- BP-01 Pendahuluan
- BP-03 Gambaran Umum Sistem
- ADR-01 Architecture Decision Record
- Roadmap Pengembangan
- Master Prompt

---

# 11. Riwayat Perubahan

| Versi | Tanggal | Perubahan |
|---------|----------|------------|
| 1.0.0 | 2026-07-08 | Dokumen pertama dibuat |