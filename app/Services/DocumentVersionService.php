<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class DocumentVersionService
{
    /**
     * Create a new version of the document.
     */
    public function createVersion(
        DokumenArsip $dokumen,
        string $namaFile,
        string $pathFile,
        int $ukuranFile,
        string $mimeType,
        ?int $uploadedBy = null
    ): DokumenArsipVersion {
        $absolutePath = Storage::disk('local')->path($pathFile);

        $hashFile = '';
        if (file_exists($absolutePath)) {
            $hashFile = hash_file('sha256', $absolutePath) ?: '';
        }

        $latestVersion = $this->latestVersion($dokumen);
        $nextVersion = $latestVersion ? $latestVersion->versi + 1 : 1;

        return DokumenArsipVersion::create([
            'dokumen_arsip_id' => $dokumen->id,
            'versi' => $nextVersion,
            'nama_file' => $namaFile,
            'path_file' => $pathFile,
            'ukuran_file' => $ukuranFile,
            'mime_type' => $mimeType,
            'hash_file' => $hashFile,
            'uploaded_by' => $uploadedBy,
        ]);
    }

    /**
     * Get the latest version of the document.
     */
    public function latestVersion(DokumenArsip $dokumen): ?DokumenArsipVersion
    {
        return DokumenArsipVersion::where('dokumen_arsip_id', $dokumen->id)
            ->orderByDesc('versi')
            ->first();
    }

    /**
     * List all versions of the document.
     *
     * @return Collection<int, DokumenArsipVersion>
     */
    public function listVersions(DokumenArsip $dokumen): Collection
    {
        return DokumenArsipVersion::where('dokumen_arsip_id', $dokumen->id)
            ->with('uploader')
            ->orderByDesc('versi')
            ->get();
    }
}
