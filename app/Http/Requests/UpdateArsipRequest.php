<?php

namespace App\Http\Requests;

use App\Models\Arsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateArsipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $arsip = $this->route('arsip');
        $arsipId = $arsip instanceof Arsip ? (string) $arsip->id : (is_string($arsip) ? $arsip : '');

        return [
            'nomor_arsip' => 'required|string|max:100|unique:arsip,nomor_arsip,'.$arsipId,
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal_arsip' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'klasifikasi_arsip_id' => 'required|integer|exists:klasifikasi_arsip,id',
            'lokasi_arsip_id' => 'nullable|integer|exists:lokasi_arsip,id',
            'jenis_arsip_id' => 'nullable|integer|exists:jenis_arsip,id',
            'sifat_arsip_id' => 'nullable|integer|exists:sifat_arsip,id',
            'tingkat_perkembangan_arsip_id' => 'nullable|integer|exists:tingkat_perkembangan_arsip,id',
            'media_arsip_id' => 'nullable|integer|exists:media_arsip,id',
            'kondisi_arsip_id' => 'nullable|integer|exists:kondisi_arsip,id',
            'status_arsip_id' => 'nullable|integer|exists:status_arsip,id',
            'tingkat_akses_arsip_id' => 'nullable|integer|exists:tingkat_akses_arsip,id',
            'retensi_arsip_id' => 'nullable|integer|exists:retensi_arsip,id',
            'unit_organisasi_id' => 'nullable|integer|exists:unit_organisasi,id',
        ];
    }
}
