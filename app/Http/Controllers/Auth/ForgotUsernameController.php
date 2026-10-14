<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendUsernameNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForgotUsernameController extends Controller
{
    /**
     * Show the forgot username form.
     */
    public function create(): Response
    {
        return Inertia::render('auth/forgot-username', [
            'status' => session('status'),
        ]);
    }

    /**
     * Send username notification email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user && $user->username) {
            $user->notify(new SendUsernameNotification($user->username));
        }

        return back()->with('status', 'Jika email terdaftar, nama pengguna telah dikirim ke email Anda.');
    }
}
