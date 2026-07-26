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
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => $passwordRules,
            'unit_organisasi_id' => ['nullable', 'integer', 'exists:unit_organisasi,id'],
            'jabatan_id' => ['nullable', 'integer', 'exists:jabatan,id'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
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
            'email' => 'email',
            'password' => 'kata sandi',
            'unit_organisasi_id' => 'unit organisasi',
            'jabatan_id' => 'jabatan',
            'status' => 'status',
            'roles' => 'role',
        ];
    }
}
