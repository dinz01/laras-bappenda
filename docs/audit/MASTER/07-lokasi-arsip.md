# LARAS
# Audit Database

Modul : Master Data

Nomor : 07

Nama : Lokasi Arsip

Status :
✅ FINAL

---

# Tujuan

Master Lokasi Arsip digunakan sebagai referensi lokasi penyimpanan arsip fisik.

Lokasi disimpan secara rinci agar memudahkan proses pencarian arsip.

---

# Struktur Final

| Kolom |
|--------|
| id |
| kode |
| nama |
| gedung |
| lantai |
| ruangan |
| rak |
| box |
| keterangan |
| status |
| created_at |
| updated_at |

---

# Relasi

Lokasi Arsip

hasMany

Arsip

---

# Temuan Audit

Lokasi Arsip bukan hanya menyimpan nama lokasi, tetapi juga detail fisik penyimpanan.

Kolom `nama` dipertahankan sebagai label lokasi agar mudah dipilih oleh pengguna, sedangkan informasi gedung, lantai, ruangan, rak, dan box menjadi detail lokasi.

---

# Keputusan Audit

- Kolom `nama` tetap dipertahankan.
- Kolom `gedung`, `lantai`, `ruangan`, `rak`, dan `box` tetap dipertahankan.
- Tidak ada perubahan struktur tabel.
- Digunakan sebagai Foreign Key pada tabel Arsip.

---

# Dampak Implementasi

Migration

⬜

Model

⬜

Seeder

⬜

Request

⬜

Controller

⬜

React

⬜

Testing

⬜

---

# Keputusan Final

1. Struktur tabel dipertahankan.
2. `nama` berfungsi sebagai label lokasi.
3. Detail lokasi disimpan pada kolom gedung, lantai, ruangan, rak, dan box.
4. Menggunakan relasi hasMany ke Arsip.