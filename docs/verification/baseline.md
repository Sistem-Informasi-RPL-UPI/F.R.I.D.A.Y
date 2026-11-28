# Verified baseline

This page records the environment in which the starter was last verified end to end, so a new contributor knows what "known good" looked like and which limits apply. It is a snapshot, not a guarantee for the current machine.

## Verified versions

| Component | Version |
| --- | --- |
| Platform | Windows x64, PowerShell |
| PHP / Composer | 8.5.12 / 2.9.7 |
| Node.js / npm | 24.22.1 / 11.4.1 |
| MySQL Community Server | 8.4.9 |
| Laravel / Pint | 13.44.1 / 1.32.3 |
| Pest / Laravel plugin | 5.3.7 / 5.0.1 |
| React / React DOM | 19.3.1 / 19.3.1 |
| TypeScript / Vite / React Router | 7.0.2 / 8.4.0 / 8.5.3 |
| ESLint / Prettier | 10.15.0 / 3.10.1 |
| Vitest / Playwright | 5.1.2 / 1.65.1 |

## What was verified

- Clean Composer installs from `BE/composer.lock` (development and production) and clean `npm ci` from `FE/package-lock.json`.
- PHP-only backend boot, health route, and production preparation without Node.js or frontend assets.
- Frontend type checking, lint, formatting, Vitest, build, and Chromium smoke test without PHP, MySQL, or a live API.
- Separate `friday_dev` and `friday_test` MySQL schemas with restricted accounts; unsafe test configuration is rejected before database work.
- Formatting, tests, and build artifacts were reproducible; the frontend build produced identical file hashes across two runs.

## Known limits

- Verified on Windows only. Linux and macOS need their own runtime/browser verification.
- Browser binaries and package caches were already present; this was not an offline or empty-cache install.
- The smoke tests cover navigation and boot behavior. They do not prove authentication, authorization, cookies, CORS, CSRF, session lifecycle, or production readiness.
- Dependency audit results are a dated snapshot; rerun `composer audit --locked` and `npm audit` after dependency changes.
- `FE/package.json` also permits Node.js 26 LTS (`^26.0.0`) and npm 12 (`<13`), but end-to-end verification was only performed on Node.js 24.22.1 / npm 11.4.1.

For setup steps, see the [setup guide](../setup/README.md). For conventions, see [development standards](../development/standards.md).
