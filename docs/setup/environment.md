# Environment configuration

The backend and frontend own separate configuration. Start with the [setup guide](README.md), preserve existing private files/keys, and keep real credentials out of source, shell arguments, logs, and shared diagnostics.

## Backend files

| File under `BE/` | Purpose | Git |
| --- | --- | --- |
| `.env.example` | Safe local development template; blank key/password | Included |
| `.env.testing.example` | Safe isolated testing template; blank key/password | Included |
| `.env` | Private local configuration | Ignored |
| `.env.testing` | Private testing configuration | Ignored |

Create missing private files from `BE/`. In PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path .env.testing)) { Copy-Item .env.testing.example .env.testing }
```

In a POSIX shell:

```sh
if [ ! -e .env ]; then cp .env.example .env; fi
if [ ! -e .env.testing ]; then cp .env.testing.example .env.testing; fi
```

Fill private values using a local editor or the team's secret-sharing process. Generate each new key with `php artisan key:generate --no-interaction` and `php artisan key:generate --env=testing --no-interaction`. Never regenerate existing keys as routine onboarding or troubleshooting.

| Setting | Local development | Isolated testing |
| --- | --- | --- |
| `APP_ENV` | `local` | `testing` |
| `APP_KEY` | Unique private generated key | Different private generated key |
| `APP_URL` | `http://localhost:8000` in the example | Same local origin in the example |
| `DB_CONNECTION` | `mysql` | `mysql` |
| `DB_HOST`, `DB_PORT` | Actual local service endpoint; example `127.0.0.1:3306` | Explicit safe endpoint for the separate test schema |
| `DB_DATABASE` | `friday_dev` | `friday_test` |
| `DB_USERNAME`, `DB_PASSWORD` | Private development-schema account | Separate private test-schema account |
| `DB_URL` | Unset | Unset; test runner forces an empty override |
| Cache/session/mail | Development database cache/session and log mailer | Array-backed test substitutes |

The administrator must restrict accounts to the intended schemas, including literal underscores in database grant patterns. See [backend provisioning](backend.md) for SQL examples and account-host/`partial_revokes` considerations. Verify the actual host, port, schema, and grants before migrating; the test guard cannot identify a remote host's purpose.

`phpunit.xml` forces `APP_ENV=testing`, the MySQL driver, `friday_test`, an empty database URL override, and a distinct test configuration-cache path. `Tests\TestCase` rejects unsafe effective environment/driver/database/URL values before test database transactions. Inherited shell variables can override other `.env` values, including host, port, username, password, or alternate cache paths. Clear unintended overrides privately rather than printing a complete environment/configuration dump.

Tests require pre-migrated tables; they do not provision or reset databases. Do not use development data as test fixtures or run parallel suites against the shared test target. No production environment file is supplied by this starter.

## Cached backend configuration

After an intentional local environment change, clear a stale configuration cache from `BE/` with `php artisan config:clear --no-interaction`. If a test configuration cache was deliberately created, select that same testing cache path when clearing it; the default command does not clear arbitrary alternate paths. Do not edit generated cache files by hand.

`composer run prepare-production` caches resolved configuration, routes, and events. Those files can contain secrets and remain ignored. Follow the [backend guide](backend.md) to clear generated caches before returning to local development. Do not use broad cache/database reset commands to fix configuration problems.

## Frontend configuration

No environment file is required by the current frontend. `FE/.env.example` documents the future public `VITE_API_ORIGIN=http://localhost:8000`; no API client consumes it yet. If future work needs a local override, copy to `FE/.env` only if absent. The file is ignored, but every `VITE_*` value is still public build configuration that can be included in browser assets.

Never use frontend environment files for database credentials, backend application keys, passwords, cookies, or session identifiers. Restart the Vite development server or rebuild the artifact after an intentional public build-configuration change. An API origin is public configuration, not a permission boundary or evidence that integration is implemented.

## Local HTTP and future HTTPS

The development example intentionally uses `APP_DEBUG=true`, local HTTP, `SESSION_SECURE_COOKIE=false`, and HttpOnly session cookies. These defaults are for local development only. A disposable artifact check used explicit production/debug/cookie overrides; it did not create a deployable production environment.

Future production configuration must disable debug and use HTTPS with Secure/HttpOnly session cookies and an approved origin topology. Sanctum, credentialed CORS, CSRF bootstrap, and session flows remain future architecture outside the starter scope. Never add wildcard credentialed CORS or disable CSRF to address a setup problem.
