<?php

namespace App\Http\Requests;

use App\Models\KategoriArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKategoriArsipRequest extends FormRequest
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
        $kategoriArsip = $this->route('kategoriArsip');
        $kategoriArsipId = $kategoriArsip instanceof KategoriArsip
            ? $kategoriArsip->id
            : $kategoriArsip;

        return [
            'kode' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('kategori_arsip', 'kode')->ignore($kategoriArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('kategori_arsip', 'nama')->ignore($kategoriArsipId),
            ],
            'deskripsi' => ['nullable', 'string'],
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
            'nama' => 'nama kategori arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
