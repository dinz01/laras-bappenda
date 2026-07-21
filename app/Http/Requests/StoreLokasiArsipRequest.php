<?php

namespace App\Http\Requests;

use App\Models\LokasiArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLokasiArsipRequest extends FormRequest
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
        $lokasiArsip = $this->route('lokasiArsip');
        $lokasiArsipId = $lokasiArsip instanceof LokasiArsip
            ? $lokasiArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('lokasi_arsip', 'kode')->ignore($lokasiArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('lokasi_arsip', 'nama')->ignore($lokasiArsipId),
            ],
            'gedung' => ['nullable', 'string', 'max:100'],
            'lantai' => ['nullable', 'string', 'max:50'],
            'ruangan' => ['nullable', 'string', 'max:100'],
            'rak' => ['nullable', 'string', 'max:50'],
            'box' => ['nullable', 'string', 'max:50'],
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
            'nama' => 'nama lokasi arsip',
            'gedung' => 'gedung',
            'lantai' => 'lantai',
            'ruangan' => 'ruangan',
            'rak' => 'rak',
            'box' => 'box',
            'keterangan' => 'keterangan',
            'status' => 'status',
        ];
    }
}
