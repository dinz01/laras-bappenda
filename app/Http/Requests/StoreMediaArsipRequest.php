<?php

namespace App\Http\Requests;

use App\Models\MediaArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMediaArsipRequest extends FormRequest
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
        $mediaArsip = $this->route('mediaArsip');
        $mediaArsipId = $mediaArsip instanceof MediaArsip
            ? $mediaArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('media_arsip', 'kode')->ignore($mediaArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('media_arsip', 'nama')->ignore($mediaArsipId),
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
            'nama' => 'nama media arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
