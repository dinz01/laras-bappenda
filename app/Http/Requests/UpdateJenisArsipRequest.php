<?php

namespace App\Http\Requests;

use App\Models\JenisArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJenisArsipRequest extends FormRequest
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
        $jenisArsip = $this->route('jenisArsip');
        $jenisArsipId = $jenisArsip instanceof JenisArsip
            ? $jenisArsip->id
            : $jenisArsip;

        return [
            'kode' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('jenis_arsip', 'kode')->ignore($jenisArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('jenis_arsip', 'nama')->ignore($jenisArsipId),
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
            'nama' => 'nama jenis arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
