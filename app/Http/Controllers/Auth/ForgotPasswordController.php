<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    /**
     * Send a reset link to the given user's email based on their username.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => ['required', 'string'],
        ]);

        $user = User::where('username', $request->username)->first();

        if ($user && $user->email) {
            $token = Password::broker()->createToken($user);
            $user->sendPasswordResetNotification($token);
        }

        return back()->with('status', 'Jika nama pengguna terdaftar, tautan atur ulang kata sandi telah dikirim ke email Anda.');
    }
}
