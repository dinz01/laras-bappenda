<?php

namespace App\Http\Requests;

use App\Models\KlasifikasiArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKlasifikasiArsipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize empty values for integer dropdowns/inputs.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->input('parent_id') === '') {
            $merge['parent_id'] = null;
        }
        if ($this->input('nasib_akhir_id') === '') {
            $merge['nasib_akhir_id'] = null;
        }
        if ($this->input('retensi_aktif') === '') {
            $merge['retensi_aktif'] = null;
        }
        if ($this->input('retensi_inaktif') === '') {
            $merge['retensi_inaktif'] = null;
        }

        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $klasifikasiArsip = $this->route('klasifikasiArsip');
        $klasifikasiArsipId = $klasifikasiArsip instanceof KlasifikasiArsip
            ? $klasifikasiArsip->id
            : null;

        return [
            'parent_id' => [
                'nullable',
                'integer',
                'exists:klasifikasi_arsip,id',
                function (string $attribute, mixed $value, \Closure $fail) use ($klasifikasiArsipId): void {
                    if ($klasifikasiArsipId && (int) $value === (int) $klasifikasiArsipId) {
                        $fail('Klasifikasi tidak boleh menjadi induk dari dirinya sendiri.');
                    }
                },
            ],
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('klasifikasi_arsip', 'kode')->ignore($klasifikasiArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('klasifikasi_arsip', 'nama')->ignore($klasifikasiArsipId),
            ],
            'deskripsi' => ['nullable', 'string'],
            'retensi_aktif' => ['nullable', 'required_with:nasib_akhir_id', 'integer', 'min:0', 'max:100'],
            'retensi_inaktif' => ['nullable', 'required_with:nasib_akhir_id', 'integer', 'min:0', 'max:100'],
            'nasib_akhir_id' => ['nullable', 'integer', 'exists:nasib_akhir,id'],
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
            'parent_id' => 'induk klasifikasi',
            'kode' => 'kode klasifikasi',
            'nama' => 'nama klasifikasi',
            'deskripsi' => 'deskripsi',
            'retensi_aktif' => 'retensi aktif',
            'retensi_inaktif' => 'retensi inaktif',
            'nasib_akhir_id' => 'nasib akhir',
            'status' => 'status',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'retensi_aktif.required_with' => 'Retensi aktif wajib diisi jika nasib akhir dipilih.',
            'retensi_inaktif.required_with' => 'Retensi inaktif wajib diisi jika nasib akhir dipilih.',
        ];
    }
}
