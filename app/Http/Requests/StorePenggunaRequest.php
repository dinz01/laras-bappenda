<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePenggunaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'nip' => filled($this->nip) ? $this->nip : null,
            'nik' => filled($this->nik) ? $this->nik : null,
            'unit_organisasi_id' => filled($this->unit_organisasi_id) ? (int) $this->unit_organisasi_id : null,
            'jabatan_id' => filled($this->jabatan_id) ? (int) $this->jabatan_id : null,
            'password' => filled($this->password) ? $this->password : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('pengguna');
        $userId = $user instanceof User ? $user->id : null;

        $passwordRules = $userId
            ? ['nullable', 'string', 'min:8']
            : ['required', 'string', 'min:8'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => $passwordRules,
            'nip' => [
                'nullable',
                'string',
                'regex:/^[0-9]+$/',
                'max:18',
                Rule::unique('users', 'nip')->ignore($userId),
            ],
            'nik' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:16'],
            'unit_organisasi_id' => ['nullable', 'integer', 'exists:unit_organisasi,id'],
            'jabatan_id' => ['nullable', 'integer', 'exists:jabatan,id'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'roles' => ['required', 'array', 'size:1'],
            'roles.*' => ['string', 'exists:roles,name'],
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
            'nip.regex' => 'NIP hanya boleh berisi angka.',
            'nip.unique' => 'NIP sudah terdaftar pada pengguna lain.',
            'nik.regex' => 'NIK hanya boleh berisi angka.',
            'roles.required' => 'Role wajib dipilih.',
            'roles.size' => 'Role hanya dapat dipilih 1.',
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
            'name' => 'nama',
            'username' => 'nama pengguna',
            'email' => 'email',
            'password' => 'kata sandi',
            'nip' => 'NIP',
            'nik' => 'NIK',
            'unit_organisasi_id' => 'unit organisasi',
            'jabatan_id' => 'jabatan',
            'status' => 'status',
            'roles' => 'role',
        ];
    }
}
