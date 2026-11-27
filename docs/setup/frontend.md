# Frontend setup

Run these commands from `FE/`. The SPA installs, tests, and builds without PHP, Composer, MySQL access, or a running backend. Start with the [setup guide](README.md) and [environment configuration](environment.md). See the [project scope](../scope.md), [development standards](../development/standards.md), and [frontend architecture](../architecture/frontend.md).

## Prerequisites and installation

Use Node.js 24 LTS; the verified version is 24.22.1 with npm 11.4.1. `.node-version`, `package.json`, and `.npmrc` record/enforce the supported runtime. Install the existing lockfile:

```sh
npm ci
```

Do not delete or regenerate `package-lock.json` for a normal installation. `npm ci` replaces the local dependency directory. Resolved application versions are React/React DOM 19.3.1, React Router 8.5.3, TypeScript 7.0.2, and Vite 8.4.0. Testing uses Vitest 5.1.2, Testing Library React 16.3.3 / DOM 10.4.2, jsdom 31.0.1, and Playwright 1.65.1. The full exact dependency graph is in the lockfile.

No environment file is required for the foundation. `.env.example` records the public, future `VITE_API_ORIGIN=http://localhost:8000`; the current shell makes no API requests. If future work needs it, copy the example to `.env` only when it does not exist. All `VITE_*` values are public build inputs; never place credentials or session secrets there.

## Commands

```sh
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run check
npm run build
```

The development URL is `http://localhost:5173`; the production output is `dist/`. `npm run preview` serves that build at `http://localhost:4173`. Both ports are strict, so a conflicting listener causes an error instead of silently changing ports. Future static hosting must serve `index.html` for SPA navigation paths; a provider has not been selected.

`npm run test:watch` starts interactive Vitest. `npm run format` applies Prettier formatting. `npm run check` runs type checking, linting, the formatting check, and Vitest without applying source fixes. Build and browser smoke checks remain separate commands. ESLint and Prettier ignore generated builds, coverage, browser reports, and test output. Private environment files are excluded from formatting. The parser decision and static layer import restrictions are described in the development standards.

The shell uses `BrowserRouter`, `Routes`, and `Route` in Declarative Mode, with home and fallback navigation. It has no authentication UI, business features, API client, or server-state/form libraries. The architecture documents describe these for future feature work; they are not part of the starter.

## Browser smoke test

Install Playwright's matching Chromium binary once per machine, or after a Playwright upgrade:

```sh
npx playwright install chromium
npm run test:e2e
```

On Linux, browser OS dependencies may also be required (`npx playwright install --with-deps chromium` requires suitable installation privileges). If the matching Chromium binary is already installed, no download is needed.

`test:e2e` builds the SPA and starts its preview server itself. Port 4173 must be free; existing servers are not reused. The Chromium test loads home, visits an unknown path, returns home, and checks that no external HTTP requests were made. It requires no backend server. This smoke test does not claim authentication, cookie, CORS, or CSRF coverage.

## Lint and formatter dependency decision

The starter uses exact development-only versions of ESLint 10.15.0, `@eslint/js` 10.0.1, `@babel/core` 8.1.3, `@babel/eslint-parser` 8.1.2, React Hooks ESLint plugin 7.1.1, `globals` 17.14.0, and Prettier 3.10.1. They are maintained upstream tools, use MIT licenses, and support Node.js 24.22.1. None adds production application behavior.

The current `typescript-eslint` 8.74.0 peer range excludes TypeScript 7 (`>=4.8.4 <6.1.0`). The foundation preserves its installed TypeScript 7.0.2 and uses Babel's TypeScript/JSX syntax parser for ESLint instead. ESLint applies recommended JavaScript and React Hooks rules. TypeScript owns undefined-name, unused-declaration, and type checks, so those two overlapping ESLint rules are disabled for TypeScript files. This provides syntax linting plus separate compiler checks, not TypeScript-aware ESLint rules. Run both `typecheck` and `lint`. Revisit the parser when upstream TypeScript 7 support is available; no compiler downgrade or ignored peer dependency conflict is required.

## Independence verification

Independence was verified with a clean `npm ci`, then type checking, lint, Prettier, Vitest, build, and Playwright with PHP, Composer, and MySQL clients removed from `PATH` and no backend listening on port 8000. The lockfile stayed unchanged. MySQL may run independently for backend verification; frontend commands require neither access nor credentials. See [backend setup](backend.md) for the independent PHP workflow.

The checks were repeated in a separate copy without private environments or backend tools. The repeated build produced identical artifact hashes on the verified Windows platform. See the [verified baseline](../verification/baseline.md) for evidence and portability limits.
