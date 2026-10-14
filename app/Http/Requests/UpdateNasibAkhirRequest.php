<?php

namespace App\Http\Requests;

use App\Models\NasibAkhir;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNasibAkhirRequest extends FormRequest
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
        $nasibAkhir = $this->route('nasibAkhir') ?? $this->route('nasib_akhir');
        $nasibAkhirId = $nasibAkhir instanceof NasibAkhir ? $nasibAkhir->id : null;

        return [
            'kode' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('nasib_akhir', 'kode')->ignore($nasibAkhirId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('nasib_akhir', 'nama')->ignore($nasibAkhirId),
            ],
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
            'nama' => 'nama nasib akhir',
            'keterangan' => 'keterangan',
            'status' => 'status',
        ];
    }
}
