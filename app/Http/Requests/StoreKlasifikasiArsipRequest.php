<?php

namespace App\Http\Requests;

use App\Models\KlasifikasiArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKlasifikasiArsipRequest extends FormRequest
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
        $klasifikasiArsip = $this->route('klasifikasiArsip');
        $klasifikasiArsipId = $klasifikasiArsip instanceof KlasifikasiArsip
            ? $klasifikasiArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('klasifikasi_arsip', 'kode')->ignore($klasifikasiArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('klasifikasi_arsip', 'nama')->ignore($klasifikasiArsipId),
            ],
            'deskripsi' => ['nullable', 'string'],
            'retensi_aktif' => ['required', 'integer', 'min:0'],
            'retensi_inaktif' => ['required', 'integer', 'min:0'],
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
            'nama' => 'nama klasifikasi arsip',
            'deskripsi' => 'deskripsi',
            'retensi_aktif' => 'retensi aktif',
            'retensi_inaktif' => 'retensi inaktif',
            'status' => 'status',
        ];
    }
}
