---
kode: BP-11
judul: Risiko dan Asumsi
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-11 — Risiko dan Asumsi

## 1. Pendahuluan

Dokumen ini menjelaskan asumsi yang digunakan selama pengembangan Sistem LARAS serta risiko yang berpotensi memengaruhi proses implementasi, operasional, maupun pengembangan sistem di masa mendatang.

---

# 2. Asumsi Pengembangan

Pengembangan Sistem LARAS dilakukan dengan asumsi berikut.

- Server memenuhi kebutuhan minimum Laravel 13.
- Pengguna menggunakan browser modern.
- Koneksi internet tersedia.
- Database menggunakan MySQL.
- Penyimpanan dokumen menggunakan Local Storage pada versi pertama.
- Pengelolaan hak akses menggunakan Role Based Access Control (RBAC).
- Pengguna internal memiliki akun yang dibuat oleh administrator.
- Pemohon eksternal tidak memerlukan akun untuk mengajukan permohonan arsip.
- Seluruh konfigurasi sensitif disimpan pada file `.env`.

---

# 3. Risiko Teknis

| Risiko | Dampak | Mitigasi |
|---------|--------|----------|
| Kehilangan data | Tinggi | Backup database dan dokumen secara berkala |
| Kegagalan upload dokumen | Sedang | Validasi file dan penanganan error |
| Integrasi TTE gagal | Sedang | Gunakan Mock Provider dan Service Interface |
| Integrasi OCR gagal | Rendah | Modul tetap berjalan tanpa OCR |
| Integrasi AI gagal | Rendah | AI bersifat opsional |
| Meilisearch tidak aktif | Sedang | Gunakan pencarian database sebagai fallback |
| Kapasitas penyimpanan penuh | Tinggi | Monitoring kapasitas dan kebijakan arsip |

---

# 4. Risiko Keamanan

Potensi risiko keamanan meliputi:

- Akses tanpa izin.
- Kebocoran data.
- Serangan Brute Force.
- SQL Injection.
- Cross Site Scripting (XSS).
- Cross Site Request Forgery (CSRF).
- Malware pada file unggahan.
- Penyalahgunaan hak akses.

Mitigasi:

- Middleware Authentication.
- Authorization menggunakan Policy dan Permission.
- Validasi seluruh input.
- CSRF Protection.
- Password Hashing.
- Audit Log.
- Validasi tipe file.
- Pembatasan ukuran file.

---

# 5. Risiko Operasional

- Kesalahan input data.
- Penghapusan arsip yang tidak disengaja.
- Gangguan server.
- Kegagalan backup.
- Kesalahan konfigurasi sistem.

Mitigasi dilakukan melalui:

- Konfirmasi tindakan penting.
- Soft Delete (jika diterapkan).
- Backup berkala.
- Monitoring sistem.
- Dokumentasi administrator.

---

# 6. Risiko Integrasi

Integrasi yang berpotensi mengalami perubahan:

- API TTE.
- API OCR.
- AI Provider.
- Meilisearch.
- SMTP Email.

Seluruh integrasi menggunakan Service Layer sehingga perubahan vendor tidak memerlukan perubahan pada logika bisnis utama.

---

# 7. Asumsi Integrasi

- Penyedia TTE menyediakan REST API.
- OCR memiliki endpoint API yang dapat dipanggil.
- AI dapat diakses melalui API.
- Meilisearch berjalan sebagai service terpisah.
- SMTP tersedia untuk pengiriman email.

---

# 8. Strategi Mitigasi

Strategi yang diterapkan:

- Pengembangan modular.
- Backup berkala.
- Logging dan Audit Log.
- Queue untuk proses berat.
- Validasi data.
- Testing menggunakan Pest.
- Dokumentasi sistem.
- Monitoring error.

---

# 9. Rencana Pengembangan

Versi pertama sistem mencakup:

- Portal Internal.
- Portal Publik.
- Repository Arsip.
- Permohonan Arsip.
- Role & Permission.
- Audit Log.
- Dashboard.
- QR Code.
- PDF.
- Meilisearch Ready.
- OCR Ready.
- AI Ready.
- TTE Mock Provider.

Pengembangan berikutnya dapat menambahkan:

- Integrasi BSrE/PSrE.
- OCR penuh.
- AI Classification.
- Cloud Storage.
- Mobile Application.
- Single Sign-On (SSO).

---

# 10. Kesimpulan

Dengan identifikasi risiko dan asumsi sejak awal, Sistem LARAS diharapkan dapat dikembangkan secara lebih terarah, aman, dan mudah dipelihara. Pendekatan modular yang digunakan juga memungkinkan penambahan fitur dan integrasi baru tanpa mengubah arsitektur utama sistem.