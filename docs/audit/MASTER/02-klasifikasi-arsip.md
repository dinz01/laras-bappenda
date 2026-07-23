# Audit Database LARAS
## Master Data - Klasifikasi Arsip

Status Audit:
✅ FINAL

Tanggal Audit:
2026-07-23

---

# Tujuan

Master Klasifikasi Arsip digunakan untuk mengelompokkan arsip berdasarkan klasifikasi yang berlaku pada instansi.

Master ini tidak lagi menyimpan masa retensi secara langsung, tetapi menggunakan referensi ke Master Retensi Arsip.

---

# Struktur Tabel Final

| Kolom | Tipe | Keterangan |
|--------|------|------------|
| id | bigint | Primary Key |
| kode | string | Kode klasifikasi |
| nama | string | Nama klasifikasi |
| retensi_arsip_id | foreignId | Relasi ke master retensi |
| deskripsi | text nullable | Keterangan tambahan |
| status | enum(active,inactive) | Status data |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diperbarui |

---

# Relasi

Klasifikasi Arsip

belongsTo

Retensi Arsip

```
RetensiArsip
        │
        │ hasMany
        ▼
KlasifikasiArsip
```

---

# Keputusan Audit

## Disetujui

- Menghapus kolom `level`.
- Menghapus kolom `retensi_aktif`.
- Menghapus kolom `retensi_inaktif`.
- Menambahkan `retensi_arsip_id`.
- Menggunakan Foreign Key ke tabel `retensi_arsip`.
- Informasi retensi diperoleh melalui relasi.

---

# Alasan

Menghindari duplikasi data.

Apabila JRA berubah, cukup memperbarui satu data pada Master Retensi Arsip.

Seluruh klasifikasi yang menggunakan retensi tersebut otomatis ikut berubah.

Struktur database menjadi lebih ternormalisasi.

---

# Contoh

Retensi Arsip

| id | Nama | Aktif | Inaktif |
|----|------|--------|----------|
|1|JRA Keuangan|2|3|

Klasifikasi Arsip

|Kode|Nama|Retensi|
|-----|------|--------|
|KU.01|SPJ|1|
|KU.02|LS|1|

Kedua klasifikasi menggunakan satu master retensi.

---

# Dampak Implementasi

## Migration

- Hapus kolom `level`
- Hapus `retensi_aktif`
- Hapus `retensi_inaktif`
- Tambah `retensi_arsip_id`
- Tambah Foreign Key

Status:
⬜ Belum dikerjakan

---

## Model

Tambahkan

```php
belongsTo(RetensiArsip::class)
```

Status:
⬜ Belum dikerjakan

---

## Request

Validasi berubah menjadi

```
retensi_arsip_id
```

Status:
⬜ Belum dikerjakan

---

## Controller

CRUD menggunakan

```
retensi_arsip_id
```

Status:
⬜ Belum dikerjakan

---

## React

Form

Input

```
Retensi Aktif
Retensi Inaktif
```

diubah menjadi

```
Dropdown Master Retensi Arsip
```

Status:
⬜ Belum dikerjakan

---

## Testing

Belum dilakukan.

---

# Keputusan Final (Tidak Diubah Tanpa Persetujuan)

1. Kolom `level` dihapus.
2. Kolom `retensi_aktif` dihapus dari tabel `klasifikasi_arsip`.
3. Kolom `retensi_inaktif` dihapus dari tabel `klasifikasi_arsip`.
4. Menggunakan `retensi_arsip_id` sebagai Foreign Key.
5. Seluruh informasi retensi diambil dari Master Retensi Arsip.