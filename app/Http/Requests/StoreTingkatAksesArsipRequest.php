<?php

namespace App\Http\Requests;

use App\Models\TingkatAksesArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTingkatAksesArsipRequest extends FormRequest
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
        $tingkatAksesArsip = $this->route('tingkatAksesArsip');
        $tingkatAksesArsipId = $tingkatAksesArsip instanceof TingkatAksesArsip
            ? $tingkatAksesArsip->id
            : null;

        return [
            'kode' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('tingkat_akses_arsip', 'kode')->ignore($tingkatAksesArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tingkat_akses_arsip', 'nama')->ignore($tingkatAksesArsipId),
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
            'nama' => 'nama tingkat akses arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
