<?php

namespace App\Http\Requests;

use App\Models\RetensiArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRetensiArsipRequest extends FormRequest
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
        $retensiArsip = $this->route('retensiArsip');
        $retensiArsipId = $retensiArsip instanceof RetensiArsip
            ? $retensiArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('retensi_arsip', 'kode')->ignore($retensiArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('retensi_arsip', 'nama')->ignore($retensiArsipId),
            ],
            'retensi_aktif' => ['required', 'integer', 'min:0'],
            'retensi_inaktif' => ['required', 'integer', 'min:0'],
            'nasib_akhir' => ['nullable', 'string', 'max:100'],
            'metode_penyusutan_arsip_id' => ['nullable', 'exists:metode_penyusutan_arsip,id'],
            'keterangan' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'kode' => 'kode',
            'nama' => 'nama retensi arsip',
            'retensi_aktif' => 'retensi aktif',
            'retensi_inaktif' => 'retensi inaktif',
            'nasib_akhir' => 'nasib akhir',
            'metode_penyusutan_arsip_id' => 'metode penyusutan arsip',
            'keterangan' => 'keterangan',
            'status' => 'status',
        ];
    }
}
