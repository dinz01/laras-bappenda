<?php

namespace App\Http\Requests;

use App\Models\UnitOrganisasi;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitOrganisasiRequest extends FormRequest
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
        $unitOrganisasi = $this->route('unitOrganisasi');
        $unitOrganisasiId = $unitOrganisasi instanceof UnitOrganisasi
            ? $unitOrganisasi->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:30',
                Rule::unique('unit_organisasi', 'kode')->ignore($unitOrganisasiId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('unit_organisasi', 'nama')->ignore($unitOrganisasiId),
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
            'nama' => 'nama unit organisasi',
            'singkatan' => 'singkatan',
            'status' => 'status',
        ];
    }
}
