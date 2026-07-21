<?php

namespace App\Http\Requests;

use App\Models\SifatArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSifatArsipRequest extends FormRequest
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
        $sifatArsip = $this->route('sifatArsip');
        $sifatArsipId = $sifatArsip instanceof SifatArsip
            ? $sifatArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('sifat_arsip', 'kode')->ignore($sifatArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('sifat_arsip', 'nama')->ignore($sifatArsipId),
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
            'nama' => 'nama sifat arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
