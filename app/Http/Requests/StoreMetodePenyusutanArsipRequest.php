<?php

namespace App\Http\Requests;

use App\Models\MetodePenyusutanArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMetodePenyusutanArsipRequest extends FormRequest
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
        $metodePenyusutanArsip = $this->route('metodePenyusutanArsip');
        $metodePenyusutanArsipId = $metodePenyusutanArsip instanceof MetodePenyusutanArsip
            ? $metodePenyusutanArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('metode_penyusutan_arsip', 'kode')->ignore($metodePenyusutanArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('metode_penyusutan_arsip', 'nama')->ignore($metodePenyusutanArsipId),
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
            'nama' => 'nama metode penyusutan arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
