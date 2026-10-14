<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\PasswordResetResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PasswordResetResponse::class, function () {
            return new class implements PasswordResetResponse
            {
                public function toResponse($request)
                {
                    return back()->with('status', 'Kata sandi Anda telah berhasil diperbarui.');
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        Fortify::authenticateUsing(function (Request $request) {
            if (! app()->environment('testing') && ! $request->attributes->get('recaptcha_verified')) {
                $token = $request->input('g-recaptcha-response');
                if (is_array($token)) {
                    $token = array_values(array_filter($token))[0] ?? null;
                }

                $secret = config('services.recaptcha.secret');

                if (empty($token)) {
                    throw ValidationException::withMessages([
                        'recaptcha' => [__('Silakan centang kotak reCAPTCHA terlebih dahulu.')],
                    ]);
                }

                $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secret,
                    'response' => $token,
                ]);

                $googleData = $response->json() ?? [];
                $success = ($googleData['success'] ?? false) === true;
                $errorCodes = $googleData['error-codes'] ?? [];

                // On local environment, allow hostname-mismatch so localhost/127.0.0.1 works seamlessly
                if (! $success && app()->isLocal() && in_array('hostname-mismatch', $errorCodes, true)) {
                    $success = true;
                    Log::warning('reCAPTCHA hostname-mismatch bypassed on local environment.');
                }

                Log::info('reCAPTCHA verification', [
                    'success' => $success,
                    'error_codes' => $errorCodes,
                    'google_response' => $googleData,
                ]);

                if (! $success) {
                    $details = ! empty($errorCodes) ? ' ('.implode(', ', $errorCodes).')' : '';
                    throw ValidationException::withMessages([
                        'recaptcha' => [__('Verifikasi keamanan gagal:error. Silakan centang ulang kotak reCAPTCHA.', ['error' => $details])],
                    ]);
                }

                $request->attributes->set('recaptcha_verified', true);
            }

            $user = Auth::getProvider()->retrieveByCredentials([
                Fortify::username() => $request->input(Fortify::username()),
                'password' => $request->input('password'),
            ]);

            if ($user && Auth::getProvider()->validateCredentials($user, [
                'password' => $request->input('password'),
            ])) {
                return $user;
            }

            return null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
            'recaptchaSiteKey' => config('services.recaptcha.site_key'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });
    }
}
