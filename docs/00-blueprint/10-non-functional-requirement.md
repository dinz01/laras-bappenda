---
kode: BP-10
judul: Non Functional Requirement
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-10 — Non Functional Requirement

## 1. Pendahuluan

Dokumen ini menjelaskan kebutuhan non-fungsional Sistem LARAS sebagai acuan dalam pengembangan, pengujian, dan operasional sistem.

---

# 2. Performa

Sistem harus memenuhi ketentuan berikut:

- Waktu muat halaman ≤ 3 detik pada jaringan normal.
- Pencarian arsip ≤ 2 detik.
- Operasi CRUD ≤ 3 detik.
- Mendukung minimal 100 pengguna aktif secara bersamaan.
- Proses berat menggunakan Queue.

---

# 3. Keamanan

Sistem wajib menerapkan:

- HTTPS.
- Password Hashing Laravel.
- CSRF Protection.
- Validasi seluruh input.
- Authorization berbasis Role & Permission.
- Audit Log.
- Session Timeout.
- Penyimpanan file di luar direktori publik.
- Konfigurasi sensitif melalui `.env`.

---

# 4. Ketersediaan

- Sistem dapat diakses 24 jam.
- Backup database dilakukan secara berkala.
- Backup dokumen dilakukan secara berkala.
- Sistem mampu dipulihkan dari backup apabila terjadi kegagalan.

---

# 5. Skalabilitas

Sistem dirancang agar mudah dikembangkan dengan:

- Modular Architecture.
- Service Layer.
- Integrasi berbasis API.
- Queue.
- Cache.
- Search Engine terpisah.

---

# 6. Maintainability

Kode program harus:

- Mengikuti Laravel Best Practice.
- Menggunakan Service Layer.
- Menggunakan Form Request Validation.
- Menggunakan Policy.
- Menggunakan Resource bila diperlukan.
- Mudah dipahami dan dipelihara.

---

# 7. Usability

Antarmuka harus:

- Menggunakan Bahasa Indonesia yang baik dan benar.
- Konsisten pada seluruh halaman.
- Responsif.
- Mudah digunakan oleh pengguna non-teknis.
- Menggunakan tema minimalis dan profesional.

---

# 8. Kompatibilitas

Sistem mendukung:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari (versi terbaru)

Minimal resolusi layar:

- 1366 × 768 piksel

---

# 9. Reliability

Sistem harus:

- Menangani kesalahan tanpa menyebabkan aplikasi berhenti.
- Menampilkan pesan kesalahan yang mudah dipahami.
- Menyimpan log kesalahan.
- Menjaga konsistensi data menggunakan transaksi database bila diperlukan.

---

# 10. Logging

Sistem mencatat:

- Login
- Logout
- CRUD Data
- Persetujuan
- Penolakan
- Upload
- Download
- Error Sistem
- Aktivitas Administrator

---

# 11. Backup

Backup meliputi:

- Database
- Dokumen
- Konfigurasi Sistem

Backup dapat dilakukan secara manual maupun terjadwal.

---

# 12. Pengujian

Pengujian menggunakan:

- Pest

Jenis pengujian:

- Feature Test
- Unit Test
- Authorization Test
- Validation Test

---

# 13. Standar Pengembangan

Teknologi yang digunakan:

| Komponen | Standar |
|----------|----------|
| Backend | Laravel 13 |
| PHP | 8.4 |
| Frontend | React 19 |
| SPA | Inertia.js |
| CSS | Tailwind CSS + shadcn/ui |
| Database | MySQL |
| Permission | Spatie Laravel Permission |
| Search | Meilisearch |
| PDF | Browsershot |
| QR Code | Simple QR Code |
| Testing | Pest |

---

# 14. Kualitas Kode

Seluruh kode harus memenuhi prinsip:

- Clean Code.
- DRY (Don't Repeat Yourself).
- KISS (Keep It Simple, Stupid).
- SOLID (diterapkan seperlunya).
- Separation of Concerns.
- Reusable Component.
- Modular.

---

# 15. Kesimpulan

Kebutuhan non-fungsional menjadi dasar dalam memastikan Sistem LARAS tidak hanya memenuhi kebutuhan bisnis, tetapi juga memiliki performa, keamanan, keandalan, dan kemudahan pengembangan yang baik sehingga siap digunakan dalam lingkungan produksi.