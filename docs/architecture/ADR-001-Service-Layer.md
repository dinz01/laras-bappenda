# ADR-001-Service-Layer: Penggunaan Service Layer untuk Business Logic

## Keputusan
Memisahkan seluruh logika bisnis (business logic) dari controller ke dalam Service Layer. Controller hanya boleh melakukan validasi request (melalui Form Request atau inline validation), memanggil Service yang sesuai, dan mengembalikan HTTP response (Inertia view, json, redirect, download, dll.).

## Alasan
1. **Single Responsibility Principle (SRP)**: Controller hanya bertanggung jawab mengelola HTTP request & response.
2. **Reusabilitas**: Logika bisnis (seperti unggah berkas, pembuatan versi, pemicuan OCR) dapat dipanggil kembali dari job, seeder, console command, atau API controller lain tanpa duplikasi.
3. **Kemudahan Pengujian**: Menulis Feature Test dan Unit Test menjadi lebih terisolasi dan mandiri.

## Konsekuensi
- Lahirnya berkas service baru di dalam direktori `app/Services/` (contoh: `WorkflowService`, `DocumentUploadService`, `DocumentVersionService`).
- Constructor injection digunakan di controller untuk memanggil dependensi service.
