# AI RULES — SISTEM LARAS

Dokumen ini berisi aturan yang WAJIB dipatuhi AI selama pengembangan Sistem LARAS.

---

# 1. Aturan Umum

- Kerjakan hanya phase yang sedang dikerjakan.
- Jangan membuat fitur di luar scope phase.
- Jangan mengubah kode yang sudah stabil tanpa instruksi.
- Jangan menghapus file tanpa alasan yang jelas.
- Jangan membuat duplicate code.
- Gunakan Laravel Best Practice.

---

# 2. Arsitektur

Selalu gunakan pola berikut:

Controller
↓
Form Request
↓
Service
↓
Model
↓
Database

Business Logic WAJIB berada di Service.

Controller hanya mengatur alur request dan response.

---

# 3. Validasi

Seluruh validasi harus menggunakan Form Request.

Jangan menulis validasi langsung di Controller.

---

# 4. Authorization

Gunakan:

- Policy
- Middleware
- Spatie Laravel Permission

Jangan melakukan pengecekan role secara manual apabila permission dapat digunakan.

---

# 5. Database

- Selalu gunakan Migration.
- Gunakan Foreign Key.
- Gunakan Eloquent Relationship.
- Jangan membuat query SQL mentah kecuali benar-benar diperlukan.
- Gunakan Transaction untuk proses yang melibatkan banyak tabel.

---

# 6. Model

Model harus:

- Menggunakan HasFactory.
- Menggunakan SoftDeletes jika diperlukan.
- Mendefinisikan `$fillable` atau `$guarded`.
- Mendefinisikan relasi Eloquent.
- Tidak berisi business logic yang kompleks.

---

# 7. Service

Semua logika bisnis harus berada pada folder:

app/Services

Contoh:

- ArchiveService
- RequestService
- UserService

Service tidak boleh menangani tampilan (view).

---

# 8. Controller

Controller bertugas:

- Menerima request.
- Memanggil Service.
- Mengembalikan response.

Controller tidak boleh berisi logika bisnis yang panjang.

---

# 9. Frontend

Gunakan:

- React
- TypeScript
- Inertia.js
- shadcn/ui

Pisahkan menjadi:

- Pages
- Components
- Layouts
- Hooks
- Utils
- Types

Komponen harus reusable.

---

# 10. UI/UX

Gunakan desain:

- Minimalis
- Modern
- Profesional
- Konsisten

Gunakan komponen shadcn/ui.

Seluruh teks antarmuka menggunakan Bahasa Indonesia yang baik dan benar.

---

# 11. Routing

- Gunakan Resource Route jika sesuai.
- Gunakan Route Name yang konsisten.
- Kelompokkan route berdasarkan modul.
- Lindungi route menggunakan middleware.

---

# 12. Error Handling

- Tangani seluruh exception.
- Tampilkan pesan yang mudah dipahami.
- Jangan menampilkan informasi sensitif kepada pengguna.

---

# 13. Logging

Catat aktivitas penting:

- Login
- Logout
- CRUD
- Approval
- Rejection
- Download
- Upload
- Error

---

# 14. Storage

Gunakan Storage Laravel.

Jangan menyimpan file langsung ke folder public.

---

# 15. Integrasi

Seluruh integrasi eksternal harus menggunakan Service Interface.

Contoh:

- TteServiceInterface
- OcrServiceInterface
- AiServiceInterface

Implementasi vendor harus dapat diganti tanpa mengubah business logic.

---

# 16. Testing

Gunakan Pest.

Minimal membuat:

- Feature Test
- Authorization Test
- Validation Test

untuk fitur yang sedang dibuat.

---

# 17. Dokumentasi

Setiap phase harus menyertakan:

- Ringkasan perubahan.
- Daftar file yang dibuat atau diubah.
- Migration baru (jika ada).
- Cara menjalankan fitur.

---

# 18. Kualitas Kode

Ikuti prinsip:

- Clean Code
- DRY
- KISS
- Separation of Concerns
- Reusable
- Modular

---

# 19. Bahasa

Kode program:

- Bahasa Inggris.

Antarmuka pengguna:

- Bahasa Indonesia yang baik dan benar.

---

# 20. Larangan

AI DILARANG:

- Mengubah struktur project tanpa instruksi.
- Mengubah migration lama yang sudah dijalankan.
- Membuat business logic di Controller.
- Membuat query yang tidak efisien.
- Mengabaikan authorization.
- Mengabaikan validasi.
- Mengabaikan testing.
- Menggunakan package baru tanpa alasan yang jelas.

---

# 21. Output Setiap Phase

Setiap phase harus menghasilkan (sesuai kebutuhan modul):

- Migration
- Model
- Factory
- Seeder
- Controller
- Form Request
- Service
- Policy
- Resource (jika diperlukan)
- React Pages
- React Components
- Route
- Test (Pest)
- Dokumentasi singkat

Jangan membuat komponen yang tidak dibutuhkan hanya untuk memenuhi daftar ini.