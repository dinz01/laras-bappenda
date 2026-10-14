<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class DocumentUploadService
{
    protected DocumentVersionService $documentVersionService;

    protected AuditLogService $auditLogService;

    public function __construct(
        ?DocumentVersionService $documentVersionService = null,
        ?AuditLogService $auditLogService = null,
    ) {
        $this->documentVersionService = $documentVersionService ?? resolve(DocumentVersionService::class);
        $this->auditLogService = $auditLogService ?? resolve(AuditLogService::class);
    }

    /**
     * Upload a new document for an archive.
     */
    public function upload(Arsip $arsip, UploadedFile $uploadedFile, int $uploadedById, ?string $catatanPerubahan = null): DokumenArsip
    {
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $generatedName = Str::uuid().'.'.$extension;
        $path = $uploadedFile->storeAs('archives', $generatedName, 'local');

        if ($path === false) {
            throw new \RuntimeException('Gagal menyimpan file ke storage.');
        }

        $dokumen = $arsip->dokumen()->create([
            'nama_original' => $originalName,
            'nama_generated' => $generatedName,
            'ukuran' => $uploadedFile->getSize(),
            'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
            'path_penyimpanan' => $path,
            'uploaded_at' => now(),
            'uploaded_by' => $uploadedById,
        ]);

        $this->auditLogService->log(
            'dokumen.uploaded',
            $dokumen,
            null,
            $dokumen->only(['nama_original', 'ukuran', 'mime_type', 'path_penyimpanan', 'uploaded_by']),
            $uploadedById ? User::find($uploadedById) : null,
            request()
        );

        $this->documentVersionService->createVersion(
            $dokumen,
            $originalName,
            $path,
            $uploadedFile->getSize(),
            $uploadedFile->getMimeType() ?? 'application/octet-stream',
            $uploadedById,
            $catatanPerubahan
        );

        return $dokumen;
    }

    /**
     * Replace the existing document for an archive.
     */
    public function replace(Arsip $arsip, UploadedFile $uploadedFile, int $uploadedById, ?string $catatanPerubahan = null): DokumenArsip
    {
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $generatedName = Str::uuid().'.'.$extension;
        $path = $uploadedFile->storeAs('archives', $generatedName, 'local');

        if ($path === false) {
            throw new \RuntimeException('Gagal menyimpan file ke storage.');
        }

        $dokumen = $arsip->dokumen;
        if ($dokumen) {
            $oldValues = $dokumen->only(['nama_original', 'ukuran', 'mime_type', 'path_penyimpanan', 'uploaded_by']);

            $dokumen->update([
                'nama_original' => $originalName,
                'nama_generated' => $generatedName,
                'ukuran' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                'path_penyimpanan' => $path,
                'uploaded_at' => now(),
                'uploaded_by' => $uploadedById,
            ]);

            $this->auditLogService->log(
                'dokumen.replaced',
                $dokumen,
                $oldValues,
                $dokumen->only(['nama_original', 'ukuran', 'mime_type', 'path_penyimpanan', 'uploaded_by']),
                $uploadedById ? User::find($uploadedById) : null,
                request()
            );
        } else {
            $dokumen = $arsip->dokumen()->create([
                'nama_original' => $originalName,
                'nama_generated' => $generatedName,
                'ukuran' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                'path_penyimpanan' => $path,
                'uploaded_at' => now(),
                'uploaded_by' => $uploadedById,
            ]);

            $this->auditLogService->log(
                'dokumen.uploaded',
                $dokumen,
                null,
                $dokumen->only(['nama_original', 'ukuran', 'mime_type', 'path_penyimpanan', 'uploaded_by']),
                $uploadedById ? User::find($uploadedById) : null,
                request()
            );
        }

        $this->documentVersionService->createVersion(
            $dokumen,
            $originalName,
            $path,
            $uploadedFile->getSize(),
            $uploadedFile->getMimeType() ?? 'application/octet-stream',
            $uploadedById,
            $catatanPerubahan
        );

        return $dokumen;
    }
}
