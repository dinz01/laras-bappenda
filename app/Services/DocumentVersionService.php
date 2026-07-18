<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class DocumentVersionService
{
    protected NotificationService $notificationService;

    public function __construct(
        ?NotificationService $notificationService = null,
    ) {
        $this->notificationService = $notificationService ?? resolve(NotificationService::class);
    }

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

        $version = DokumenArsipVersion::create([
            'dokumen_arsip_id' => $dokumen->id,
            'versi' => $nextVersion,
            'nama_file' => $namaFile,
            'path_file' => $pathFile,
            'ukuran_file' => $ukuranFile,
            'mime_type' => $mimeType,
            'hash_file' => $hashFile,
            'uploaded_by' => $uploadedBy,
        ]);

        if ($uploadedBy && $nextVersion > 1) {
            $uploader = User::find($uploadedBy);
            if ($uploader) {
                $arsip = $dokumen->arsip;
                $this->notificationService->create(
                    $uploader,
                    NotificationType::VersiDokumenBaru,
                    'Versi Dokumen Baru Dibuat',
                    "Versi {$nextVersion} untuk dokumen \"{$namaFile}\" (arsip: {$arsip->nomor_arsip}) berhasil dibuat.",
                    route('arsip.show', $arsip),
                );
            }
        }

        return $version;
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
