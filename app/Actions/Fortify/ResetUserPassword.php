<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and reset the user's forgotten password.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => $this->passwordRules(),
        ], [
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.required' => 'Kata sandi wajib diisi.',
        ])->after(function ($validator) use ($user, $input) {
            if (isset($input['password']) && Hash::check($input['password'], $user->password)) {
                $validator->errors()->add('password', 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.');
            }
        })->validate();

        $user->forceFill([
            'password' => $input['password'],
        ])->save();
    }
}
