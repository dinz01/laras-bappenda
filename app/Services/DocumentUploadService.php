<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\ProcessOcrJob;
use App\Models\Arsip;
use App\Models\DokumenArsip;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class DocumentUploadService
{
    public function __construct(
        protected DocumentVersionService $documentVersionService
    ) {}

    /**
     * Upload a new document for an archive.
     */
    public function upload(Arsip $arsip, UploadedFile $uploadedFile, int $uploadedById): DokumenArsip
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

        $this->documentVersionService->createVersion(
            $dokumen,
            $originalName,
            $path,
            $uploadedFile->getSize(),
            $uploadedFile->getMimeType() ?? 'application/octet-stream',
            $uploadedById
        );

        ProcessOcrJob::dispatch($dokumen);

        return $dokumen;
    }

    /**
     * Replace the existing document for an archive.
     */
    public function replace(Arsip $arsip, UploadedFile $uploadedFile, int $uploadedById): DokumenArsip
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
            $dokumen->update([
                'nama_original' => $originalName,
                'nama_generated' => $generatedName,
                'ukuran' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                'path_penyimpanan' => $path,
                'uploaded_at' => now(),
                'uploaded_by' => $uploadedById,
            ]);
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
        }

        $this->documentVersionService->createVersion(
            $dokumen,
            $originalName,
            $path,
            $uploadedFile->getSize(),
            $uploadedFile->getMimeType() ?? 'application/octet-stream',
            $uploadedById
        );

        ProcessOcrJob::dispatch($dokumen);

        return $dokumen;
    }
}
