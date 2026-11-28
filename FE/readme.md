# Frontend

Independent React + TypeScript SPA built with Vite and React Router Declarative Mode. It contains a home/fallback shell and tests, with no API requests, login, authentication, or business features. It installs, tests, and builds without PHP, MySQL, or a running backend.

## Setup

Use Node.js 24 LTS or 26 LTS (`^24.22.1 || ^26.0.0`) and npm 11 or 12 (`>=11 <13`). The package manager baseline is npm 11.4.1; `.node-version`, `package.json`, and `.npmrc` record/enforce runtime expectations.

On a new checkout, run `npm ci` from `FE/` to install the existing lockfile. It replaces the target `node_modules/`; do not repeat installation on a working setup without a reason. No environment file is required for the current shell. See [frontend setup](../docs/setup/frontend.md) and [environment configuration](../docs/setup/environment.md).

## Commands

Run from `FE/`:

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start development at `http://localhost:5173`       |
| `npm run check`        | Type-check, lint, check formatting, and run Vitest |
| `npm run typecheck`    | Run strict TypeScript checking                     |
| `npm run lint`         | Run ESLint with zero warnings allowed              |
| `npm run format:check` | Check Prettier formatting                          |
| `npm run format`       | Apply Prettier formatting fixes                    |
| `npm test`             | Run Vitest once                                    |
| `npm run test:watch`   | Watch Vitest tests interactively                   |
| `npm run build`        | Type-check and build static files into `dist/`     |
| `npm run preview`      | Serve an existing build at `http://localhost:4173` |
| `npm run test:e2e`     | Build and run the Chromium navigation smoke test   |
| `npm audit`            | Review current dependency advisories               |

Install the matching browser once after dependency installation with `npx playwright install chromium`, or again after a Playwright upgrade. `test:e2e` starts and stops its own preview server and refuses to reuse an existing listener on port 4173. The smoke test verifies navigation and absence of external HTTP requests; it does not verify browser authentication or CORS/CSRF.

Use both ESLint and TypeScript checks. The existing Babel parser provides syntax linting while the compiler checks TypeScript names/types; the tooling decision and its limitations are in [development standards](../docs/development/standards.md).

Frontend configuration is public build input. Never place credentials or application keys in `VITE_*` variables. `dist/`, `node_modules/`, and browser reports remain ignored and are not source deliverables.

See [frontend architecture](../docs/architecture/frontend.md), [testing conventions](../docs/development/testing.md), [troubleshooting](../docs/setup/troubleshooting.md), and [frontend agent instructions](AGENTS.md).
