# Backend setup

Run these commands from `BE/`. This is the independent Laravel 13 foundation; no Node.js, npm, frontend assets, or running frontend is required. Start with the [setup guide](README.md) and [environment configuration](environment.md). See the [project scope](../scope.md), [development standards](../development/standards.md), and the [backend architecture](../architecture/backend.md) for future module boundaries.

## Prerequisites

Verified runtimes: PHP 8.5.12, Composer 2.9.7, and MySQL Community Server 8.4.9. `composer.json` requires PHP `~8.5.0` and `ext-pdo_mysql`; `composer check-platform-reqs` checks all locked dependencies' extension requirements. Keep `composer.lock`; use `composer install`, not `composer update`, to reproduce the foundation.

Resolved direct dependencies: Laravel 13.44.1, Pest 5.3.7, Pest Laravel plugin 5.0.1, Pint 1.32.3, Boost 2.10.4, Faker 1.24.1, Mockery 1.6.15, and Collision 8.9.6. Boost is a development tool, not an authentication implementation.

## Environment and database

Existing `.env` and `.env.testing` contain generated local credentials. Preserve them. For a new checkout only, copy `.env.example` to `.env` and `.env.testing.example` to `.env.testing` when the destination does not exist. Securely supply separate credentials and generate a separate application key in each new environment:

```sh
composer install --no-interaction --prefer-dist
php artisan key:generate --no-interaction
php artisan key:generate --env=testing --no-interaction
```

Do not regenerate existing keys as a routine setup step. Both real environment files are ignored; examples intentionally contain blank secrets. Never paste real credentials into documentation, shell arguments, or diagnostics. The example database port is the conventional `3306`; use the endpoint supplied by the local service owner in both private environment files.

Provision `friday_dev` and `friday_test` with separate accounts restricted to their respective schema. An administrator must supply these accounts securely; do not use a global administrator account in either application environment. Both schemas use `utf8mb4` / `utf8mb4_unicode_ci`. Do not point either configuration at an unrelated database. Leave `DB_URL` unset and inherited database overrides cleared.

On a new workstation, install/provide MySQL 8.4 separately, confirm its host and port, and have its administrator create the two empty schemas and restricted accounts. For a fresh local instance using MySQL's default `partial_revokes=OFF`, the administrator can adapt this SQL in a private interactive client session. Replace the password placeholders privately; do not save real values in scripts, shell history, or this repository:

```sql
CREATE DATABASE friday_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE friday_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'friday_dev'@'localhost' IDENTIFIED BY '<private-development-password>';
CREATE USER 'friday_test'@'localhost' IDENTIFIED BY '<different-private-test-password>';
GRANT ALL PRIVILEGES ON `friday\_dev`.* TO 'friday_dev'@'localhost';
GRANT ALL PRIVILEGES ON `friday\_test`.* TO 'friday_test'@'localhost';
```

The backslashes escape underscores in database-level grant patterns so each grant names the intended schema exactly. If the service uses `partial_revokes=ON` or nonlocal account hosts, its administrator must use the corresponding exact-schema grant syntax and host restrictions. Inspect grants, verify each account can access only its own schema, and set the actual host/port and matching credentials in the new private environment files. These are fresh-instance examples, not instructions to recreate existing schemas/accounts or alter an existing service.

This sequence has been verified with a newly initialized disposable loopback MySQL instance, new credentials, and environments derived solely from the examples; the original environment files and database instance were not required. See the [verified baseline](../verification/baseline.md) for results and limits.

Keep MySQL data directories, service configuration, and administrator credentials outside Git. Start an existing service through its local owner/service manager after confirming its endpoint and configuration. Never initialize its data directory again or launch another daemon against it. On another workstation, provision an isolated MySQL 8.4 service and use its own endpoint; no temporary workstation path from a verification run is required.

On Windows, prefer a short checkout path and ensure Composer has a supported archive extractor. A long temporary path can make Windows `unzip` warn that PHPUnit paths are too long; Composer can recover using the enabled PHP ZipArchive extension. Do not change package versions or delete the lockfile to address an extraction-path issue. If Composer exits unsuccessfully, correct the path/extractor prerequisite and retry only in the intended installation directory.

Before migrating, confirm `APP_ENV=local`, `DB_CONNECTION=mysql`, `DB_DATABASE=friday_dev`, the intended host/port, and no URL override in the private development configuration. Review the migration files, then run only forward migrations:

```sh
php artisan migrate --pretend --no-interaction
php artisan migrate --no-interaction
php artisan migrate:status --no-interaction
```

For a new empty schema, `migrate:status` reports that the migration table does not yet exist. Laravel may create its migration bookkeeping table even during `--pretend`; application table statements are previewed. Three standard framework migrations currently create the user/session, cache, and job tables. These are framework foundations; no login endpoints or business capabilities exist. Do not run the example seeder as part of setup.

After separately checking `.env.testing` targets `friday_test` with the restricted test account, prepare it explicitly:

```sh
php artisan migrate --env=testing --no-interaction
php artisan migrate:status --env=testing --no-interaction
```

Do not use database wipes, fresh migrations, schema resets, or refresh traits. Tests use `DatabaseTransactions`, require existing migrated tables, and roll their records back. The test schema should start without user fixtures.

## Run and verify

```sh
composer validate --strict
composer check-platform-reqs
php artisan --version
composer test
composer run format:check
composer run check
composer run format
composer run dev
```

`composer run dev` serves `http://localhost:8000`. `GET /up` is Laravel's operational health route and returns HTTP 200 when the application boots. It does not assert database readiness or define an application API contract. The starter has no application `/api/v1` operations, OpenAPI contract, or authentication implementation. There is no root welcome view or backend Vite build.

Pest currently checks MySQL persistence and transaction rollback, `/up`, and rejection of unsafe test settings. `phpunit.xml` forces the testing environment, MySQL driver, `friday_test`, and an empty URL override, and uses a distinct configuration-cache path. `Tests\TestCase` rejects unsafe effective configuration before database test transactions. Separate schema grants provide an additional database boundary. Ordinary test commands must not run concurrently against this shared isolated test schema.

Pint uses the explicit `laravel` preset in `pint.json`. `composer run format` applies fixes; `composer run format:check` checks without rewriting source. `composer run check` runs the formatting check and Pest serially and requires the prepared isolated test database. Pint can also be run directly as `php vendor/laravel/pint/builds/pint --format agent`; a successful run with `"result":"passed"` means no formatting changes were necessary. `composer audit --locked` checks current advisories.

## Independent production preparation

```sh
composer run prepare-production
```

This caches configuration, routes, and events using PHP only. Run it against the intended backend environment; configuration caches contain resolved secrets and remain ignored. For local development afterward, clear only those generated caches:

```sh
php artisan config:clear --no-interaction
php artisan route:clear --no-interaction
php artisan event:clear --no-interaction
```

Do not use `optimize:clear` here to clear a shared database cache unnecessarily. Production deployment and environment provisioning remain outside the starter scope. See [frontend setup](frontend.md) for the separate SPA workflow and [troubleshooting](troubleshooting.md) for setup failures.
