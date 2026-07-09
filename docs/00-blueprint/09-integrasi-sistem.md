---
kode: BP-09
judul: Integrasi Sistem
versi: 1.0.0
status: Draft
penulis: Rizki Syawaludin
arsitek_sistem: ChatGPT
terakhir_diperbarui: 2026-07-08
---

# BP-09 — Integrasi Sistem

## 1. Pendahuluan

Dokumen ini menjelaskan seluruh integrasi eksternal yang digunakan pada Sistem LARAS. Setiap integrasi dirancang modular sehingga dapat diaktifkan, diganti, atau dikembangkan tanpa mengubah arsitektur utama aplikasi.

---

# 2. Daftar Integrasi

| Integrasi | Fungsi | Status Phase Awal |
|-----------|--------|-------------------|
| Email | Notifikasi Sistem | Aktif |
| Local Storage | Penyimpanan Dokumen | Aktif |
| QR Code | Verifikasi Dokumen | Aktif |
| PDF Generator | Generate Dokumen PDF | Aktif |
| Meilisearch | Pencarian Cepat | Ready |
| OCR | Ekstraksi Metadata | Ready |
| AI | Analisis Dokumen | Ready |
| TTE | Tanda Tangan Elektronik | Mock Provider |

---

# 3. Integrasi Email

Digunakan untuk:

- Reset Password
- Notifikasi Permohonan
- Notifikasi Persetujuan
- Notifikasi Penolakan
- Informasi Sistem

Implementasi menggunakan Mail Laravel.

---

# 4. Integrasi Local Storage

Seluruh dokumen disimpan pada:

```
storage/app/private
```

Kategori penyimpanan:

- archives
- requests
- generated
- temporary
- backups

Dokumen tidak dapat diakses secara langsung melalui URL publik.

---

# 5. Integrasi QR Code

Digunakan untuk:

- Verifikasi keaslian dokumen.
- Validasi dokumen hasil unduhan.
- Mempermudah pengecekan dokumen.

Library:

- Simple QR Code

---

# 6. Integrasi PDF

Digunakan untuk:

- Generate dokumen.
- Surat persetujuan.
- Surat penolakan.
- Berita acara.
- Laporan.

Library:

- Browsershot

---

# 7. Integrasi Meilisearch

Status:

Search Ready

Fungsi:

- Full Text Search.
- Metadata Search.
- Pencarian cepat.
- Auto Suggest.

Seluruh proses pencarian dilakukan melalui service khusus sehingga mesin pencarian dapat diganti apabila diperlukan.

---

# 8. Integrasi OCR

Status:

OCR Ready

Fungsi:

- Membaca isi dokumen.
- Mengambil metadata.
- Membantu pengisian data arsip.

Implementasi OCR belum dilakukan pada versi awal.

Sistem hanya menyiapkan:

- Konfigurasi
- Interface
- Service
- Queue

---

# 9. Integrasi Artificial Intelligence

Status:

AI Ready

Fungsi yang direncanakan:

- Klasifikasi arsip.
- Analisis metadata.
- Rekomendasi klasifikasi.
- Pencarian semantik.

Versi pertama hanya menyediakan struktur modul.

---

# 10. Integrasi Tanda Tangan Elektronik (TTE)

Status:

Mock Provider

Fungsi:

- Mengirim dokumen ke penyedia TTE.
- Menerima hasil penandatanganan.
- Menyimpan dokumen bertanda tangan elektronik.
- Menampilkan status penandatanganan.

Arsitektur menggunakan Service Interface sehingga dapat mendukung berbagai penyedia TTE.

Contoh penyedia:

- BSrE
- PSrE

Endpoint API, API Key, Client ID, dan Secret disimpan pada file `.env`.

---

# 11. Alur Integrasi TTE

```
Petugas
    │
Menyetujui Dokumen
    │
Laravel Service
    │
Provider TTE
    │
Proses Penandatanganan
    │
Dokumen Ditandatangani
    │
Laravel
    │
Simpan Dokumen
    │
Pemohon Mengunduh
```

---

# 12. Konfigurasi Environment

Contoh konfigurasi:

```
MAIL_MAILER=
MAIL_HOST=
MAIL_PORT=

MEILISEARCH_HOST=
MEILISEARCH_KEY=

OCR_DRIVER=

AI_DRIVER=

TTE_PROVIDER=
TTE_BASE_URL=
TTE_CLIENT_ID=
TTE_CLIENT_SECRET=
TTE_API_KEY=
```

Nilai sebenarnya disesuaikan dengan lingkungan server.

---

# 13. Prinsip Integrasi

Seluruh integrasi wajib memenuhi prinsip berikut:

- Modular.
- Tidak bergantung pada satu vendor.
- Mudah diganti.
- Menggunakan Service Layer.
- Menggunakan konfigurasi melalui `.env`.
- Mendukung Queue untuk proses yang membutuhkan waktu lama.

---

# 14. Kesimpulan

Seluruh layanan eksternal pada Sistem LARAS dirancang menggunakan pendekatan modular sehingga implementasi dapat dilakukan secara bertahap tanpa mengubah proses bisnis utama maupun arsitektur sistem.