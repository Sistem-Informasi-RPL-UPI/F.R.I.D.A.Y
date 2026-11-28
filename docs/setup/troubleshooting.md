# Troubleshooting

Run diagnostics from the owning application root and share only redacted output. Use the [setup guide](README.md), [environment guide](environment.md), and [verified baseline](../verification/baseline.md) to distinguish prerequisites from implemented behavior.

## PHP or Composer failures

Check `php --version`, `composer --version`, and `composer check-platform-reqs` from `BE/`. The backend requires PHP 8.5 and the locked extensions, including PDO MySQL. A different PHP on the command path may use another `php.ini`; `php --ini` identifies the active file. Enable/install the required extension for the intended CLI runtime instead of bypassing platform checks or changing Laravel versions.

For manifest/lockfile mismatch, inspect the actual change with `composer validate --strict`. Use the existing lockfile for installation; do not run an unreviewed update or regenerate it to hide an error. Run installation only where intended, not as a response to every failed application command.

On Windows, long extraction paths can exceed an archive tool's limit. Prefer a short checkout path and a supported extractor. A long path can trigger an `unzip` warning that Composer recovers from using PHP ZipArchive. If the install exits unsuccessfully, fix the path/extractor prerequisite and retry the intended installation; do not downgrade PHPUnit or Laravel merely to shorten paths.

## MySQL connection, grants, and missing tables

Confirm the MySQL service is running through the local service owner/manager, then privately verify the effective host, port, schema, account, and password. Example port 3306 is not a guarantee that your service uses it. Do not initialize a data directory again or launch a second daemon against an existing directory.

An access-denied error requires an administrator to inspect the intended account/host and exact-schema grants. Do not switch application configuration to the administrator account. In default MySQL database-level grant patterns, underscores are wildcards unless escaped; use the provisioning examples and verify both own-schema access and cross-schema denial.

If tables are missing on a confirmed new test schema, prepare it explicitly with `php artisan migrate --env=testing --no-interaction` and inspect `php artisan migrate:status --env=testing --no-interaction`. Do not migrate before checking the target. For an existing database, inspect migration status and ask the service owner about unexpected data rather than wiping it.

If a database test expects an empty table and finds records, confirm the test target and whether another suite is running. Stop concurrent test commands and investigate fixtures. Do not delete existing records or use refresh traits to make a test pass.

## Unsafe test configuration, keys, and stale caches

The explicit safety exception from `Tests\TestCase` indicates an environment/driver/database/URL mismatch. Follow the [environment guide](environment.md), including inherited shell overrides and the distinct `APP_CONFIG_CACHE` used by tests. Keep the guard enabled; do not change the expected test database or bypass checks to run against development data.

If a new environment has no application key, generate it once for that environment. Existing keys must be preserved. If intentional environment edits are not taking effect, clear the appropriate configuration cache; default `config:clear` and the test runner's alternate cache path are different targets. Do not post `.env`, complete `config:show database` output, or cached configuration files in a pull request or chat.

## Node.js, npm, and lint failures

From `FE/`, check `node --version` and `npm --version`. The manifest requires Node `^24.22.1 || ^26.0.0` and npm `>=11 <13`, with `engine-strict=true`. Select the supported runtime instead of disabling engine checks. On a fresh install use `npm ci` with the committed lockfile; it replaces the target dependency directory and fails on manifest drift.

Run both `npm run typecheck` and `npm run lint`. The Babel parser is intentional for the recorded TypeScript 7 compatibility decision and does not provide TypeScript-aware semantic linting. Do not replace it, downgrade the compiler, ignore peer requirements, or broadly suppress diagnostics without review. See [development standards](../development/standards.md).

For formatting failures, use `npm run format` or `composer run format` from the owning root, then review the diff and rerun the affected checks. Avoid unrelated formatting changes.

## Browser binary and port conflicts

After frontend dependencies are installed, `npx playwright install chromium` supplies the browser matching the locked Playwright version. Linux may need OS browser dependencies as described in [frontend setup](frontend.md); install them only with appropriate local privileges. Browser smoke tests require no backend credentials.

Vite uses strict ports: development 5173 and preview 4173. `test:e2e` refuses to reuse another server on 4173. Stop a server you own before running the test; do not kill another developer's process, change `reuseExistingServer`, or silently switch ports to mask a conflict.

After build-output cleanup, `npm run preview` needs a fresh `npm run build`. `npm run test:e2e` already builds before starting preview. Test reports and traces are generated artifacts; preserve useful failure evidence before removing them.

## Expected missing functionality

A backend root-page 404 is expected; use `/up` for the operational boot check. No application `/api/v1`, login, registration, Sanctum, dashboard, or business endpoints exist. A frontend shell that makes no API requests is also expected. Do not install authentication, create modules, or change security settings to resolve the absence of features excluded from the starter.

Backend preparation never needs a frontend build. An unexpected Vite-manifest error in the API backend suggests that the change introduced frontend coupling; inspect the diff instead of adding npm assets to `BE/`.
