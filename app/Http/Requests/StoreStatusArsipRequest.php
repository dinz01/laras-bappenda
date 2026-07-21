<?php

namespace App\Http\Requests;

use App\Models\StatusArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStatusArsipRequest extends FormRequest
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
        $statusArsip = $this->route('statusArsip');
        $statusArsipId = $statusArsip instanceof StatusArsip
            ? $statusArsip->id
            : null;

        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('status_arsip', 'kode')->ignore($statusArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('status_arsip', 'nama')->ignore($statusArsipId),
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
            'nama' => 'nama status arsip',
            'deskripsi' => 'deskripsi',
            'status' => 'status',
        ];
    }
}
