<?php

namespace App\Http\Requests;

use App\Models\LokasiArsip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLokasiArsipRequest extends FormRequest
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
        $lokasiArsip = $this->route('lokasiArsip');
        $lokasiArsipId = $lokasiArsip instanceof LokasiArsip
            ? $lokasiArsip->id
            : null;

        return [
            'parent_id' => [
                'nullable',
                'integer',
                'exists:lokasi_arsip,id',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value === null) {
                        return;
                    }

                    $parent = LokasiArsip::find((int) $value);

                    if ($parent === null) {
                        return;
                    }

                    // Compute depth of parent (max depth for Box is 4)
                    $depth = 0;
                    $current = $parent;

                    while ($current->parent_id !== null) {
                        $depth++;
                        $current = LokasiArsip::find($current->parent_id);

                        if ($current === null || $depth > 10) {
                            break;
                        }
                    }

                    if ($depth >= 4) {
                        $fail('Box tidak dapat memiliki sub lokasi. Hierarki maksimal: Gedung → Lantai → Ruangan → Rak → Box.');
                    }
                },
            ],
            'kode' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('lokasi_arsip', 'kode')->ignore($lokasiArsipId),
            ],
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('lokasi_arsip', 'nama')->ignore($lokasiArsipId),
            ],
            'gedung' => ['nullable', 'string', 'max:100'],
            'lantai' => ['nullable', 'string', 'max:50'],
            'ruangan' => ['nullable', 'string', 'max:100'],
            'rak' => ['nullable', 'string', 'max:50'],
            'box' => ['nullable', 'string', 'max:50'],
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
            'parent_id' => 'induk lokasi',
            'kode' => 'kode',
            'nama' => 'nama lokasi arsip',
            'gedung' => 'gedung',
            'lantai' => 'lantai',
            'ruangan' => 'ruangan',
            'rak' => 'rak',
            'box' => 'box',
            'keterangan' => 'keterangan',
            'status' => 'status',
        ];
    }
}
