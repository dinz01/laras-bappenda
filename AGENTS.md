# AGENTS.md

## What This Is

Sistem Pengelolaan Arsip Daerah (Regional Archive Management) for BAPPENDA — an Indonesian government archive agency. Domain language is Indonesian (Bahasa).

**Stack:** Laravel 13 / PHP 8.4 / Inertia.js v3 / React 19 / Tailwind v4 / TypeScript / MySQL / Pest 4

## Quick Commands

```bash
composer run dev          # concurrently: artisan serve + queue:listen + vite
composer run setup        # full fresh install (install, migrate, npm build)
composer run ci:check     # ESLint + Prettier + Larastan + Pest (CI-equivalent)
composer run lint         # Pint formatter (auto-fix)
composer run lint:check   # Pint dry-run
composer run test         # config:clear → lint:check → types:check → artisan test
composer run types:check  # phpstan analyse (level 7)

npm run lint              # ESLint auto-fix
npm run lint:check        # ESLint dry-run
npm run format            # Prettier auto-fix
npm run format:check      # Prettier dry-run
```

**Single test:** `php artisan test --compact --filter=TestName`
**PHP formatting after changes:** `vendor/bin/pint --dirty --format agent`
**Static analysis:** `composer types:check`

## Testing

- Pest 4 with `RefreshDatabase` applied globally to Feature tests (`tests/Pest.php`).
- Tests run on SQLite in-memory (configured in `phpunit.xml`). No external DB needed.
- `TestCase` provides `skipUnlessFortifyHas()` helper for conditional Fortify feature tests.
- Create tests: `php artisan make:test --pest SomeTest`
- Use model factories. Check for custom factory states before manual setup.

## Architecture

**Service pattern** — All business logic lives in `app/Services/`. Controllers are thin (request → service → response). Key services:

- `WorkflowService` — archive lifecycle transitions (Draft → Review → Approved → Active → Retention → RecordCenter → Destruction)
- `DocumentUploadService` / `DocumentVersionService` — file handling with versioning (files never deleted, new versions added)
- `SearchService` — full-text search via Meilisearch
- `AuditLogService` — audit trail logging
- `NotificationService` — in-app notifications
- `RecycleBinService` — soft-delete / restore

**Interface segregation** — External integrations use interfaces in `app/Interfaces/` bound in `AppServiceProvider`:
- `OcrServiceInterface` → `MockOcrService` (dev) / `OcrService` (prod)
- `AiServiceInterface` → `NullAiService` (null-object pattern)
- `TteServiceInterface` → `NullTteService` (digital signature, null-object pattern)
- `SearchServiceInterface` → `SearchService`

**RBAC** — Spatie Laravel Permission. Super Administrator role bypasses all gates via `Gate::before`.

**Auth** — Laravel Fortify. Registration is **disabled**. Login, password reset, email verification, 2FA, and passkeys (WebAuthn) are enabled.

## Frontend

- Pages in `resources/js/pages/` mirror controller structure: `admin/`, `master/`, `pengelolaan/`, `settings/`, `arsip/`, `auth/`, `notifications/`
- Wayfinder auto-generates typed route functions in `resources/js/actions/` and `resources/js/routes/`. Import from `@/actions/` or `@/routes/`. Regenerate: `php artisan wayfinder:generate`
- React Compiler is enabled via `babel-plugin-react-compiler` in `vite.config.ts`
- UI components in `resources/js/components/ui/` (Radix-based shadcn-style). These are **ignored by ESLint** — do not lint/format them manually.
- ESLint ignores: `resources/js/actions/`, `resources/js/routes/`, `resources/js/wayfinder/`, `resources/js/components/ui/`

## Code Style

- **PHP:** Laravel preset via Pint (`pint.json`). Always use curly braces. PHP 8 constructor property promotion. Explicit return types.
- **TS/JS:** ESLint 9 flat config + Prettier. `curly: all`, 1tbs brace style, blank lines around control statements. Import ordering: builtin → external → internal → parent → sibling. `type-imports` preferred.
- **Indentation:** 4 spaces everywhere (2 for YAML).
- **EditorConfig:** LF line endings, final newline, trim trailing whitespace.

## Development Gotchas

- App is served by **Laravel Herd** at `https://laras-bappenda.test`. Never run `php artisan serve` in dev — Herd handles it.
- `composer run dev` is for manual concurrent dev (uses `concurrently` for server + queue + vite).
- If frontend changes don't appear: run `npm run build` or `npm run dev`.
- `DB::prohibitDestructiveCommands()` is enabled in production — destructive migrations need `--force`.
- Password validation is relaxed in non-production environments (Fortify config).
- `Date::use(CarbonImmutable::class)` — all dates are immutable Carbon instances.
- Queue driver is **database** (not Redis). Jobs table exists in migrations.
- Tests with factories: prefer existing factory states over manual model creation.

## Skills

Domain-specific skills are in `**/skills/**`. Activate the relevant skill when working in that domain.

## Branches

CI runs on: `develop`, `main`, `master`, `workos` (push + PR).

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- larastan/larastan (LARASTAN) - v3
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Follow existing application Enum naming conventions.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== herd rules ===

# Laravel Herd

- The application is served by Laravel Herd at `https?://[kebab-case-project-dir].test`. Use the `get-absolute-url` tool to generate valid URLs. Never run commands to serve the site. It is always available.
- Use the `herd` CLI to manage services, PHP versions, and sites (e.g. `herd sites`, `herd services:start <service>`, `herd php:list`). Run `herd list` to discover all available commands.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
