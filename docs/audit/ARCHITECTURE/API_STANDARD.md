# LARAS

# API Standard

Versi

1.0

Status

✅ Final

---

# Tujuan

Dokumen ini menjadi standar implementasi API pada Sistem LARAS.

Seluruh endpoint harus mengikuti standar ini agar API memiliki struktur yang konsisten, mudah dipelihara, mudah digunakan oleh Frontend, serta mendukung pengembangan jangka panjang.

Dokumen ini berlaku untuk seluruh modul:

- Master Data
- Operasional
- RBAC
- Modul baru

---

# Ruang Lingkup

Panduan ini mencakup:

- Endpoint
- HTTP Method
- Request
- Response
- Validation
- Error Handling
- Pagination
- Filtering
- Sorting
- Versioning
- Authentication
- Authorization

---

# Prinsip

API LARAS harus:

- Konsisten
- RESTful
- Stateless
- Mudah dipahami
- Mudah dikembangkan
- Aman
- Memiliki dokumentasi

---

# Base URL

Gunakan:

```
/api/v1
```

Contoh:

```
GET /api/v1/arsip

POST /api/v1/arsip

GET /api/v1/dokumen-arsip
```

---

# HTTP Method

Gunakan method sesuai standar REST.

| Method | Fungsi |
|---------|--------|
| GET | Mengambil data |
| POST | Membuat data |
| PUT | Mengubah seluruh data |
| PATCH | Mengubah sebagian data |
| DELETE | Menghapus data |

---

# Endpoint

Gunakan:

```
/api/v1/<resource>
```

Contoh:

```
/api/v1/arsip

/api/v1/dokumen-arsip

/api/v1/workflow

/api/v1/users
```

Gunakan bentuk jamak (plural).

---

# Request

Gunakan Form Request Laravel.

Contoh:

StoreArsipRequest

UpdateArsipRequest

Seluruh validasi dilakukan melalui Request Class.

Controller tidak berisi validasi.

---

# Response

Seluruh response menggunakan JSON.

Contoh:

```json
{
  "success": true,
  "message": "Data berhasil disimpan.",
  "data": {}
}
```

---

# Error Response

Gunakan format yang konsisten.

Contoh:

```json
{
  "success": false,
  "message": "Data tidak ditemukan."
}
```

---

# Validation Error

Contoh:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "nama": [
      "Nama wajib diisi."
    ]
  }
}
```

---

# HTTP Status Code

| Status | Keterangan |
|---------|------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# Pagination

Seluruh daftar data menggunakan pagination.

Contoh:

```text
?page=1

?per_page=10
```

Response:

```json
{
  "data": [],
  "meta": {},
  "links": {}
}
```

---

# Filtering

Gunakan Query Parameter.

Contoh:

```
?status=aktif

?unit_organisasi_id=3

?klasifikasi_arsip_id=8
```

---

# Searching

Gunakan parameter:

```
?search=
```

Contoh:

```
?search=keuangan
```

Pencarian dilakukan pada kolom yang telah ditentukan.

---

# Sorting

Gunakan:

```
?sort=nama

?direction=asc
```

atau

```
?sort=created_at

?direction=desc
```

---

# Relationship

Gunakan eager loading.

Contoh:

```
?include=klasifikasi,unitOrganisasi
```

Relationship mengikuti:

RELATIONSHIP_MATRIX.md

---

# Authentication

Menggunakan:

Laravel Sanctum

Seluruh endpoint selain Login wajib menggunakan Authentication.

---

# Authorization

Menggunakan:

- Policy
- Middleware
- Permission

Tidak melakukan pengecekan Role secara manual.

---

# API Resource

Seluruh response menggunakan Laravel API Resource.

Contoh:

```
ArsipResource

UserResource

WorkflowResource
```

---

# Soft Delete

Data yang menggunakan Soft Delete tidak ditampilkan secara default.

Gunakan parameter khusus apabila diperlukan.

Contoh:

```
?with_deleted=true
```

---

# Audit Log

Seluruh perubahan data penting dicatat pada Audit Log.

Minimal:

- Create
- Update
- Delete
- Upload
- Download
- Approval

---

# Versioning

Seluruh endpoint menggunakan versi.

Contoh:

```
/api/v1/
```

Perubahan besar dibuat pada versi berikutnya.

Contoh:

```
/api/v2/
```

---

# Checklist

## Endpoint

☐ RESTful

☐ Konsisten

☐ Versioning

---

## Request

☐ Form Request

☐ Validation

☐ Authorization

---

## Response

☐ JSON

☐ API Resource

☐ Status Code

☐ Error Handling

---

## Query

☐ Pagination

☐ Filter

☐ Search

☐ Sorting

☐ Include Relationship

---

## Security

☐ Sanctum

☐ Policy

☐ Middleware

☐ Permission

---

## Documentation

☐ Endpoint terdokumentasi

☐ Request terdokumentasi

☐ Response terdokumentasi

---

# Referensi

- DATABASE_PRINCIPLES.md
- FOREIGN_KEY_GUIDE.md
- RBAC_GUIDE.md
- RELATIONSHIP_MATRIX.md
- PERMISSION_MATRIX.md

---

# Keputusan Final

1. Seluruh endpoint menggunakan REST API.
2. Seluruh response menggunakan format JSON yang konsisten.
3. Validasi dilakukan melalui Form Request.
4. Authorization menggunakan Policy dan Middleware.
5. Seluruh endpoint menggunakan versioning (`/api/v1`).
6. API Resource menjadi standar response pada Sistem LARAS.