<?php

namespace App\Http\Requests;

use App\Models\KategoriArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArsipRequest extends FormRequest
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
        $isPajakDaerah = $this->kategoriIsPajakDaerah();

        return [
            'nomor_arsip' => 'nullable|string|max:100|unique:arsip,nomor_arsip',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal_arsip' => 'required|date',
            'kategori_arsip_id' => 'nullable|integer|exists:kategori_arsip,id',
            'no_register' => [Rule::requiredIf($isPajakDaerah), 'nullable', 'string', 'max:100'],
            'nop' => [Rule::requiredIf($isPajakDaerah), 'nullable', 'string', 'max:100'],
            'npwpd' => [Rule::requiredIf($isPajakDaerah), 'nullable', 'string', 'max:100'],
            'nama_wajib_pajak' => [Rule::requiredIf($isPajakDaerah), 'nullable', 'string', 'max:255'],
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:102400',
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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'no_register.required' => 'No register wajib diisi untuk kategori Arsip Pelayanan Pajak Daerah.',
            'nop.required' => 'NOP wajib diisi untuk kategori Arsip Pelayanan Pajak Daerah.',
            'npwpd.required' => 'NPWPD wajib diisi untuk kategori Arsip Pelayanan Pajak Daerah.',
            'nama_wajib_pajak.required' => 'Nama wajib pajak wajib diisi untuk kategori Arsip Pelayanan Pajak Daerah.',
        ];
    }

    /**
     * Menentukan apakah kategori_arsip_id yang dikirim merujuk pada
     * "Arsip Pelayanan Pajak Daerah" (kode KAT-002), sama seperti logika
     * `isPajakDaerah` di ArsipCreateDialog.tsx pada sisi frontend.
     */
    protected function kategoriIsPajakDaerah(): bool
    {
        $kategoriId = $this->input('kategori_arsip_id');

        if (! $kategoriId) {
            return false;
        }

        $kategori = KategoriArsip::find((int) $kategoriId);

        if (! $kategori) {
            return false;
        }

        return $kategori->kode === 'KAT-002'
            || $kategori->nama === 'Arsip Pelayanan Pajak Daerah';
    }
}
