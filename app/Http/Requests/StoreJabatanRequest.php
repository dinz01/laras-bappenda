<?php

namespace App\Http\Requests;

use App\Models\Jabatan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJabatanRequest extends FormRequest
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
        $jabatan = $this->route('jabatan');
        $jabatanId = $jabatan instanceof Jabatan
            ? $jabatan->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('jabatan', 'kode')->ignore($jabatanId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('jabatan', 'nama')->ignore($jabatanId),
            ],
            'singkatan' => ['nullable', 'string', 'max:50'],
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
            'nama' => 'nama jabatan',
            'singkatan' => 'singkatan',
            'status' => 'status',
        ];
    }
}
