<?php

namespace App\Http\Requests;

use App\Models\TingkatPerkembanganArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTingkatPerkembanganArsipRequest extends FormRequest
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
        $tingkatPerkembanganArsip = $this->route('tingkatPerkembanganArsip');
        $tingkatPerkembanganArsipId = $tingkatPerkembanganArsip instanceof TingkatPerkembanganArsip
            ? $tingkatPerkembanganArsip->id
            : null;

        return [
            'kode' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('tingkat_perkembangan_arsip', 'kode')->ignore($tingkatPerkembanganArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tingkat_perkembangan_arsip', 'nama')->ignore($tingkatPerkembanganArsipId),
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
            'nama' => 'nama tingkat perkembangan arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
