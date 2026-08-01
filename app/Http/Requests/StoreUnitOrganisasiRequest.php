<?php

namespace App\Http\Requests;

use App\Models\UnitOrganisasi;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
        $isEditing = $unitOrganisasi instanceof UnitOrganisasi;

        $rules = [
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

        if (! $isEditing) {
            $rules['parent_id'] = ['nullable', 'integer', 'exists:unit_organisasi,id'];

            if ($this->filled('parent_id')) {
                // Membuat Sub Bidang — tipe otomatis ditentukan di controller, tidak perlu diisi manual
                $rules['tipe'] = ['nullable', Rule::in(['bidang', 'upt'])];
            } else {
                // Membuat unit root-level (Bidang/UPT) — tipe wajib dipilih
                $rules['tipe'] = ['required', Rule::in(['bidang', 'upt'])];
            }
        }

        return $rules;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator): void {
            $parentId = $this->input('parent_id');
            $unitOrganisasi = $this->route('unitOrganisasi');

            if ($parentId === null || $parentId === '') {
                return;
            }

            $parentId = (int) $parentId;

            // Cannot set self as parent
            if ($unitOrganisasi instanceof UnitOrganisasi && $unitOrganisasi->id === $parentId) {
                $validator->errors()->add('parent_id', 'Unit tidak boleh menjadi parent dari dirinya sendiri.');

                return;
            }

            // Cannot set descendant as parent (circular reference)
            if ($unitOrganisasi instanceof UnitOrganisasi) {
                $descendantIds = $this->getDescendantIds($unitOrganisasi);

                if (in_array($parentId, $descendantIds, true)) {
                    $validator->errors()->add('parent_id', 'Tidak boleh memilih unit turunan sebagai parent (circular reference).');

                    return;
                }
            }

            // Parent hanya boleh berupa unit bertipe Bidang (sub bidang tidak bisa jadi parent, UPT tidak punya anak)
            $parent = UnitOrganisasi::find($parentId);

            if ($parent !== null && $parent->tipe !== 'bidang') {
                $validator->errors()->add('parent_id', 'Parent unit hanya dapat berupa Bidang.');
            }
        });
    }

    /**
     * Recursively get all descendant IDs of a unit.
     *
     * @return list<int>
     */
    private function getDescendantIds(UnitOrganisasi $unit): array
    {
        $ids = [];

        foreach ($unit->children as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->getDescendantIds($child));
        }

        return $ids;
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
            'parent_id' => 'parent unit',
            'tipe' => 'tipe unit',
            'status' => 'status',
        ];
    }
}
