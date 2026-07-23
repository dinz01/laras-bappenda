# LARAS
# Audit Database

Modul : Master Data

Nomor : 03

Nama : Retensi Arsip

Status :
✅ FINAL

---

# Tujuan

Master Retensi Arsip menyimpan Jadwal Retensi Arsip (JRA) yang akan digunakan oleh Master Klasifikasi Arsip.

---

# Struktur Final

| Kolom |
|--------|
| id |
| kode |
| nama |
| retensi_aktif |
| retensi_inaktif |
| nasib_akhir |
| keterangan |
| status |
| created_at |
| updated_at |

---

# Relasi

Retensi Arsip

hasMany

Klasifikasi Arsip

```
RetensiArsip
      │
      │ hasMany
      ▼
KlasifikasiArsip
```

---

# Temuan Audit

Pada desain lama, masa retensi disimpan langsung pada tabel Klasifikasi Arsip sehingga terjadi duplikasi data.

---

# Keputusan Audit

- Menjadikan Retensi Arsip sebagai master utama.
- Menambahkan kolom `nasib_akhir`.
- Menggunakan relasi `hasMany`.
- Klasifikasi Arsip menggunakan `retensi_arsip_id`.

---

# Alasan

Menghindari duplikasi data.

Mempermudah perubahan JRA.

Apabila retensi berubah cukup mengubah satu data.

---

# Contoh

```
JRA Keuangan

Retensi Aktif : 2 Tahun

Retensi Inaktif : 3 Tahun

Nasib Akhir : Musnah
```

Dipakai oleh banyak klasifikasi arsip.

---

# Dampak Implementasi

Migration

⬜ tambah kolom nasib_akhir

Model

⬜ tambah hasMany()

Seeder

⬜

Request

⬜

Controller

⬜

React

⬜ tampilkan nasib akhir

Testing

⬜

---

# Keputusan Final

1. Retensi menjadi master.
2. Klasifikasi menggunakan FK `retensi_arsip_id`.
3. Menambahkan kolom `nasib_akhir`.
4. Seluruh informasi retensi berasal dari tabel ini.