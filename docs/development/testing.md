# Testing conventions

Use the existing Pest, Vitest, and Playwright foundations. See [development standards](standards.md) for application check commands, [backend setup](../setup/backend.md) and [frontend setup](../setup/frontend.md) for prerequisites, and the [project scope](../scope.md) for what the starter includes.

## Test placement and responsibilities

| Tool/location | Responsibility | Naming |
| --- | --- | --- |
| Pest `BE/tests/Unit/` when needed | Pure behavior without Laravel boot or database access | `*Test.php` |
| Pest `BE/tests/Feature/` | Laravel HTTP behavior, configuration safeguards, and MySQL integration | `*Test.php` |
| Vitest beside `FE/src/` code | Unit and component behavior, observed through public interfaces | `*.test.ts`, `*.test.tsx` |
| `FE/src/test/setup.ts` | Shared DOM setup and cleanup | Existing shared bootstrap |
| Playwright `FE/e2e/` | Real browser navigation and starter smoke behavior | `*.spec.ts` |

Create suites and directories only when meaningful tests need them. Future architecture and contract suites require corresponding implemented boundaries and endpoints; no authentication or business fixtures are needed for this starter. Prefer descriptive behavior names, one coherent scenario per test, and assertions about visible results or public outputs. Cover relevant failures as well as success. Do not add tests that merely repeat configuration values or private implementation details.

## Isolation and fixtures

Backend feature tests extend the existing `Tests\TestCase` through `tests/Pest.php`. It rejects an environment other than `testing`, a driver other than MySQL, a database other than `friday_test`, and a nonempty database URL override before test database transactions. Retain those safeguards and the separate restricted test account. Never substitute SQLite for MySQL integration checks.

Database tests use `DatabaseTransactions` against explicitly prepared tables and roll fixtures back. Use factories and deterministic overrides, unique fixture values where constraints require them, and no real personal data. Do not use refresh traits, `migrate:fresh`, database wipes, or automatic migration/seed hooks in test/check commands. Prepare a new test schema separately following the setup guide. Run database suites serially against the shared test schema; parallel test execution needs separately provisioned databases and explicit review.

Pure tests should avoid framework boot, database access, clocks, randomness, and external network dependencies unless their behavior requires them. Freeze or inject time where relevant; fake external services at their boundaries. Do not test another module's private model or tables through a caller's suite.

Frontend tests use the existing jsdom environment and Testing Library. Render the component or public hook interface, query accessible roles/names, and assert user-visible behavior. Keep cleanup centralized and restore spies or mocks after use. Use a fresh router and any future query client per test. Mock future HTTP behavior at the documented API boundary; do not couple tests to Axios internals or invent endpoints merely for coverage. Add a mocking dependency only when an actual scenario needs it.

Playwright owns browser contexts through its fixtures. Keep tests independent, avoid fixed sleeps, and use awaited locator assertions. The current smoke test runs the production preview on port 4173, refuses to reuse another server, and verifies navigation without external HTTP calls. It requires no backend. Browser parallelism is acceptable for these independent frontend-only scenarios; it does not authorize concurrent database tests. Traces and reports are ignored artifacts and may contain sensitive data if future scenarios introduce it.

## Selecting checks

From `BE/`, run a focused file with `composer test -- tests/Feature/FoundationHealthTest.php` or select behavior with Pest's `--filter` option. Run `composer run check` before submitting backend or backend tooling changes when the isolated MySQL prerequisites are available. From `FE/`, run `npm test -- src/app/App.test.tsx` for a focused component suite, and `npm run check` for frontend changes. Run `npm run build` for compiler/build configuration changes and `npm run test:e2e` for browser, navigation, preview, or Playwright changes.

After formatter or lint configuration changes, check the whole affected application. After a test change, rerun the changed test. An unavailable database/browser is a reported blocker, not permission to alter private environments, reset data, download tools, or claim the check passed. Do not broaden a focused change into a full clean-installation verification.

No arbitrary coverage percentage is required. Review whether tests would detect a meaningful regression. Starter smoke tests do not prove authentication, authorization, cookies, CORS, CSRF, session lifecycle, or production readiness; those require future implementation and appropriate real-server browser checks.
