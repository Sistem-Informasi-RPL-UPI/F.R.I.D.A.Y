# Backend

Independent Laravel 13 REST backend for the FRIDAY starter. It uses PHP and MySQL directly and has no Node.js, npm, or frontend-asset requirement. No application endpoints, authentication, Identity module, or business capability are implemented.

## Setup

Use PHP 8.5.x, Composer 2, and MySQL 8.4. The verified versions and extensions are recorded in the [verified baseline](../docs/verification/baseline.md); `composer check-platform-reqs` checks the installed packages against the actual runtime.

For a new checkout, follow [backend setup](../docs/setup/backend.md) and [environment configuration](../docs/setup/environment.md) to install the existing Composer lockfile, supply private configuration, generate new keys, provision separate restricted development/test databases, and run forward migrations. Preserve existing environments and databases; do not run setup again to use an already configured application.

## Commands

Run from `BE/`:

```sh
composer run dev
```

The local server uses `http://localhost:8000`. `GET /up` reports application boot, not database readiness. A root-page 404 is expected for this API foundation.

| Command | Purpose |
| --- | --- |
| `composer validate --strict` | Validate the manifest and lockfile |
| `composer check-platform-reqs` | Check real PHP/platform requirements |
| `composer run format:check` | Check Pint's Laravel formatting preset without applying fixes |
| `composer run format` | Apply PHP formatting fixes |
| `composer test` | Run Pest against the prepared isolated test schema |
| `composer run check` | Run the formatting check, then Pest serially |
| `composer audit --locked` | Review current dependency advisories |
| `composer run prepare-production` | Cache configuration, routes, and events using PHP only |

Production preparation is an artifact check, not deployment. Cached configuration contains resolved secrets and remains ignored. Clear the generated caches before returning to local development as described in the setup guide.

Tests reject unsafe environment/driver/database/URL configuration. Persistence tests use transactions, require existing migrated tables, and must not run concurrently against the shared test schema. Do not wipe or refresh schemas or run the default sample seeder as part of onboarding.

See [development standards](../docs/development/standards.md), [testing conventions](../docs/development/testing.md), [troubleshooting](../docs/setup/troubleshooting.md), [backend architecture](../docs/architecture/backend.md), and [backend agent instructions](AGENTS.md). The scaffold user model, factory, and framework migrations support the foundation tests; their presence does not implement authentication.
