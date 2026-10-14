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
            'nomor_arsip' => 'nullable|string|max:100|unique:arsip,nomor_arsip,'.$arsipId,
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal_arsip' => 'required|date',
            'kategori_arsip_id' => 'nullable|integer|exists:kategori_arsip,id',
            'no_register' => 'nullable|string|max:100',
            'nop' => 'nullable|string|max:100',
            'npwpd' => 'nullable|string|max:100',
            'nama_wajib_pajak' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:102400',
            'klasifikasi_arsip_id' => 'required|integer|exists:klasifikasi_arsip,id',
            'lokasi_arsip_id' => 'required|integer|exists:lokasi_arsip,id',
            'jenis_arsip_id' => 'required|integer|exists:jenis_arsip,id',
            'sifat_arsip_id' => 'required|integer|exists:sifat_arsip,id',
            'tingkat_perkembangan_arsip_id' => 'required|integer|exists:tingkat_perkembangan_arsip,id',
            'kondisi_arsip_id' => 'required|integer|exists:kondisi_arsip,id',
            'tingkat_akses_arsip_id' => 'required|integer|exists:tingkat_akses_arsip,id',
            'unit_organisasi_id' => 'required|integer|exists:unit_organisasi,id',
        ];
    }
}
