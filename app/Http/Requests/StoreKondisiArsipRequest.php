<?php

namespace App\Http\Requests;

use App\Models\KondisiArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKondisiArsipRequest extends FormRequest
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
        $kondisiArsip = $this->route('kondisiArsip');
        $kondisiArsipId = $kondisiArsip instanceof KondisiArsip
            ? $kondisiArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('kondisi_arsip', 'kode')->ignore($kondisiArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('kondisi_arsip', 'nama')->ignore($kondisiArsipId),
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
            'nama' => 'nama kondisi arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
