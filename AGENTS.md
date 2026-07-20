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
