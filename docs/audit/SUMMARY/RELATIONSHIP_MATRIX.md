# LARAS

# Relationship Matrix

Status

✅ FINAL

---

# Tujuan

Dokumen ini mendefinisikan seluruh hubungan (relationship) antar tabel pada database LARAS.

Dokumen ini menjadi acuan implementasi:

- Foreign Key
- Constraint
- On Delete
- On Update
- Eloquent Relationship
- Migration
- Testing

---

# MASTER → MASTER

| Tabel | Foreign Key | Referensi | On Delete |
|--------|-------------|-----------|-----------|
| klasifikasi_arsip | retensi_arsip_id | retensi_arsip | Restrict |
| retensi_arsip | metode_penyusutan_arsip_id | metode_penyusutan_arsip | Restrict |
| jabatan | unit_organisasi_id | unit_organisasi | Restrict |

---

# MASTER → OPERASIONAL

| Tabel | Foreign Key | Referensi | On Delete |
|--------|-------------|-----------|-----------|
| arsip | jenis_arsip_id | jenis_arsip | Restrict |
| arsip | klasifikasi_arsip_id | klasifikasi_arsip | Restrict |
| arsip | sifat_arsip_id | sifat_arsip | Restrict |
| arsip | status_arsip_id | status_arsip | Restrict |
| arsip | media_arsip_id | media_arsip | Restrict |
| arsip | lokasi_arsip_id | lokasi_arsip | Restrict |
| arsip | kondisi_arsip_id | kondisi_arsip | Restrict |
| arsip | tingkat_akses_arsip_id | tingkat_akses_arsip | Restrict |
| arsip | tingkat_perkembangan_arsip_id | tingkat_perkembangan_arsip | Restrict |
| arsip | unit_organisasi_id | unit_organisasi | Restrict |

---

# OPERASIONAL

| Tabel | Foreign Key | Referensi | On Delete |
|--------|-------------|-----------|-----------|
| dokumen_arsip | arsip_id | arsip | Cascade |
| versi_dokumen | dokumen_arsip_id | dokumen_arsip | Cascade |
| workflow | arsip_id | arsip | Cascade |
| workflow | user_id | users | Restrict |
| audit_log | arsip_id | arsip | Cascade |
| audit_log | user_id | users | Set Null |

---

# RBAC

| Tabel | Foreign Key | Referensi | On Delete |
|--------|-------------|-----------|-----------|
| users | unit_organisasi_id | unit_organisasi | Restrict |
| users | jabatan_id | jabatan | Restrict |
| model_has_roles | role_id | roles | Cascade |
| role_has_permissions | role_id | roles | Cascade |
| role_has_permissions | permission_id | permissions | Cascade |

---

# Standar On Delete

| Kondisi | Aturan |
|----------|--------|
| Master digunakan oleh transaksi | Restrict |
| Child murni | Cascade |
| Riwayat | Set Null atau Restrict sesuai kebutuhan |
| Pivot Table | Cascade |

---

# Standar Relasi

| Jenis | Laravel |
|--------|----------|
| One to Many | hasMany |
| Many to One | belongsTo |
| Many to Many | belongsToMany |
| Polymorphic | morphTo |

---

# Keputusan Final

1. Seluruh Master menggunakan Restrict.
2. Child operasional menggunakan Cascade.
3. Audit Log tidak menghapus histori pengguna.
4. Pivot bawaan Spatie menggunakan Cascade.
5. Seluruh relasi menggunakan Foreign Key.