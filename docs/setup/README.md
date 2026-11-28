# Setup guide

Choose the backend, frontend, or both. Each application installs and runs independently. The [root README](../../README.md) describes the starter scope; the [onboarding checklist](../onboarding.md) provides a handover checklist.

## Prerequisites

| Application | Required tools/services |
| --- | --- |
| Backend | PHP 8.5.x and required extensions, Composer 2, MySQL 8.4 with separate restricted development/test accounts |
| Frontend | Node.js 24 LTS or 26 LTS (`^24.22.1 || ^26.0.0`), npm 11–12 (`>=11 <13`); matching Playwright Chromium for browser tests |

The [verified baseline](../verification/baseline.md) lists exact verified versions and Windows results. Other operating systems require the corresponding runtime/browser prerequisites and their own verification. Keep both application lockfiles; no root dependency installation is required.

For an existing working checkout, check configuration and run the applicable commands below without reinstalling dependencies, replacing environment files, regenerating keys, or recreating databases. For a fresh checkout, first confirm it contains both manifests/lockfiles and the expected starter source.

## Backend on a new checkout

1. Open a terminal in `BE/` and check `php --version` and `composer --version`.
2. Run `composer install --no-interaction --prefer-dist`, then `composer check-platform-reqs`.
3. Create private `.env` and `.env.testing` from their examples only when absent. Configure the endpoint, separate restricted schema accounts, and private passwords following [environment configuration](environment.md).
4. Have a MySQL administrator provision fresh `friday_dev` and `friday_test` schemas/accounts if they do not exist. Use the [backend setup instructions](backend.md) for exact grant patterns and prerequisites; never recreate an existing data directory or use an administrator account in application environments.
5. Generate a distinct key for each new environment from `BE/`:

   ```sh
   php artisan key:generate --no-interaction
   php artisan key:generate --env=testing --no-interaction
   ```

6. Confirm the effective target in each private environment, clear inherited database overrides, and review migration SQL before applying only forward migrations:

   ```sh
   php artisan migrate --pretend --no-interaction
   php artisan migrate --no-interaction
   php artisan migrate --env=testing --no-interaction
   composer run check
   ```

7. Run `composer run dev`. Check `http://localhost:8000/up`; an application root 404 is expected. Stop the development server with Ctrl+C when finished.

Tests require prepared tables in `friday_test` and run serially using transactions. Do not run seeders, fresh migrations, wipes, refresh traits, or resets as setup shortcuts. See [backend setup](backend.md) for migration status, cache handling, and PHP-only artifact preparation.

## Frontend on a new checkout

1. Open a separate terminal in `FE/`. Check `node --version` and `npm --version` against the manifest constraints.
2. Run `npm ci` to install the existing lockfile. This replaces the target `node_modules/`; use it for initial setup or an intentional clean install.
3. Run `npm run check` and `npm run build`. No private environment, PHP, MySQL, or live backend is required.
4. If running browser tests, install the matching browser with `npx playwright install chromium`, ensure port 4173 is free, and run `npm run test:e2e`.
5. Run `npm run dev` and open `http://localhost:5173`. Stop the development server with Ctrl+C when finished.

`npm run preview` serves an existing build on port 4173. Stop it before `test:e2e`, which owns its own preview server. See [frontend setup](frontend.md) for browser OS prerequisites and parser/tooling details.

## Daily use and maintenance

From `BE/`, use `composer run dev` and `composer run check`; from `FE/`, use `npm run dev` and `npm run check`. Neither application's commands start the other. Formatting fixes are explicit: `composer run format` or `npm run format` from the owning root.

Use [troubleshooting](troubleshooting.md) for runtime, database, cache, port, and browser failures. Read [contribution instructions](../../CONTRIBUTING.md) before changing dependencies or architecture. Production artifact commands do not authorize deployment or make local HTTP settings production-ready.
