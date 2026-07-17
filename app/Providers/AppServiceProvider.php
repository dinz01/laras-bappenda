<?php

namespace App\Providers;

use App\Interfaces\AiServiceInterface;
use App\Interfaces\OcrServiceInterface;
use App\Interfaces\SearchServiceInterface;
use App\Interfaces\TteServiceInterface;
use App\Services\MockOcrService;
use App\Services\NullAiService;
use App\Services\NullTteService;
use App\Services\SearchService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OcrServiceInterface::class, MockOcrService::class);
        $this->app->bind(AiServiceInterface::class, NullAiService::class);
        $this->app->bind(TteServiceInterface::class, NullTteService::class);
        $this->app->bind(SearchServiceInterface::class, SearchService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Gate::before(fn ($user, $ability) => $user->hasRole('Super Administrator') ? true : null);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
