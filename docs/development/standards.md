# Development standards

These conventions apply to the starter. The [project scope](../scope.md) describes what it includes; the [backend](../architecture/backend.md), [frontend](../architecture/frontend.md), and [API](../architecture/api-conventions.md) architecture decisions remain authoritative. Authentication, Identity and business modules, application endpoints, domain schemas, deployment, Docker, and CI/CD are outside the starter.

## Directory and ownership conventions

| Location | Responsibility |
| --- | --- |
| `BE/app/Http/Controllers/` | Existing framework HTTP adapters; keep controllers thin |
| `BE/app/Models/` | Existing scaffold models; retain the single user model without implementing authentication |
| `BE/app/Providers/` | Application bootstrap and dependency registration |
| `BE/bootstrap/`, `BE/config/`, `BE/routes/` | Laravel bootstrap, configuration, and route composition |
| `BE/database/` | Centrally ordered migrations, factories, and seeders |
| `BE/tests/` | Pest bootstrap, unit and feature behavior |
| `FE/src/main.tsx` | Browser entry point |
| `FE/src/app/` | Application composition, declarative routing, layouts, and providers |
| `FE/src/styles.css` | Existing global foundation styles |
| `FE/src/test/` | Shared test setup and reusable test fixtures |
| `FE/e2e/` | Playwright browser scenarios |
| `docs/development/` | Team development conventions and tooling decisions |

Create directories only with actual responsibilities and content. Do not relocate scaffold models or introduce module registration just to resemble a target diagram. Future capabilities belong under `BE/app/Modules/<Capability>/` and `FE/src/features/<feature>/`; reusable domain-neutral frontend code belongs under `FE/src/shared/`. These future directories do not need placeholder files.

For future backend modules, use `App\Modules\<Capability>` under the existing PSR-4 root. Keep HTTP adapters, Actions, Models, and Policies owned by the module. Keep migrations centrally ordered and record ownership when module migrations are introduced. Use documented public interfaces for cross-module access; dependencies must remain acyclic. Do not add repository layers, generic CRUD bases, or interfaces without concrete need.

Frontend dependencies flow `app -> features -> shared`; app may also import shared directly. Features must not import app; shared must not import features or app. ESLint checks static imports and re-exports containing these layer path segments. It is a focused guard, not a complete dependency graph checker: review dynamic imports, cycles, path aliases, and cross-feature usage. Cross-feature access must use an explicit `index.ts` public entry point with deliberate exports; do not add barrels with no consumers. No new aliases or dependency-analysis packages are required.

## Coding and naming

Use UTF-8, LF line endings, spaces, and final newlines. Backend indentation is four spaces; frontend and documentation indentation is two spaces. EditorConfig assists editors; Pint and Prettier determine code formatting. Do not change global or local Git configuration to enforce editor settings.

| Concern | Convention |
| --- | --- |
| PHP classes and filenames | PascalCase, matching PSR-4 namespaces; one responsibility per class |
| PHP methods, properties, parameters | Descriptive camelCase; parameter and return types where applicable |
| PHP constants | UPPER_SNAKE_CASE; enum cases use TitleCase |
| PHP style | Laravel Pint `laravel` preset; braces for control structures; constructor promotion where appropriate |
| TypeScript components | PascalCase component and `.tsx` filename, such as `App.tsx` |
| Hooks | `use` prefix and camelCase filename, such as `useExample.ts` when a hook is needed |
| Other TypeScript modules | Descriptive camelCase `.ts` names; type-only imports with `import type` |
| Variables and functions | Descriptive camelCase; boolean names express a condition |
| Feature directories and URLs | Lowercase kebab-case |
| Public JSON and database names | snake_case fields/columns; conventional plural table names |
| Tests | Backend `*Test.php`; frontend `*.test.ts` or `*.test.tsx`; browser `*.spec.ts` |

Keep strict TypeScript enabled. Narrow `unknown` explicitly; avoid unexplained `any`, type assertions, non-null assertions, and diagnostic suppression. A necessary local exception must explain its reason and impact in a nearby comment and be reviewed. Do not broadly disable checks to resolve incompatibility.

Keep React components focused on rendering and interaction, use semantic HTML and accessible names, and extract reusable behavior only when needed. Future server state belongs to TanStack Query, forms to React Hook Form, client validation to Zod, and HTTP transport to the trusted Axios client. These decisions do not require installing unused packages now.

## Formatting, linting, and checks

Run commands from the indicated application root. Check commands fail on violations without rewriting source files; formatter commands intentionally apply fixes. Tests may create ignored caches and reports.

| Root | Command | Purpose |
| --- | --- | --- |
| `BE/` | `composer run format` | Apply Pint formatting |
| `BE/` | `composer run format:check` | Check PHP formatting and Pint's syntax validation without applying fixes |
| `BE/` | `composer test` | Run existing Pest tests against the configured isolated MySQL target |
| `BE/` | `composer run check` | Run formatting check, then Pest; requires the prepared test environment |
| `FE/` | `npm run format` | Apply Prettier formatting |
| `FE/` | `npm run format:check` | Check Prettier formatting |
| `FE/` | `npm run lint` | Run ESLint with zero warnings allowed |
| `FE/` | `npm run typecheck` | Check TypeScript types, names, and unused declarations |
| `FE/` | `npm test` | Run Vitest once |
| `FE/` | `npm run check` | Run type checking, linting, formatting check, and Vitest |
| `FE/` | `npm run build` | Type-check and build the independent frontend artifact |
| `FE/` | `npm run test:e2e` | Build and run the existing Playwright smoke test |

Backend formatting/checks never invoke npm. Frontend checks never invoke PHP, connect to MySQL, or require a live API. Browser tests remain an explicit command because they need the matching Chromium binary and a free preview port. See [testing conventions](testing.md) for test selection and [setup guides](../setup/backend.md) for environment prerequisites.

## Tooling decisions

Reuse the locked tools: Pint 1.32.3, ESLint 10.15.0, Prettier 3.10.1, TypeScript 7.0.2, Pest 5.3.7, Vitest 5.1.2, and Playwright 1.65.1. `BE/pint.json` explicitly selects Laravel's preset. Frontend Prettier explicitly sets two spaces, semicolons, single quotes, trailing commas, and LF. ESLint combines recommended JavaScript checks, React Hooks checks, and the layer import restrictions above.

Keep the existing Babel TypeScript/JSX parser: the foundation records that its evaluated `typescript-eslint` version excluded TypeScript 7. ESLint provides syntax and supported JavaScript/React rules, not TypeScript-aware semantic linting. TypeScript handles undefined names and unused declarations, so the overlapping ESLint rules remain disabled for TypeScript files. Both `lint` and `typecheck` are mandatory; neither replaces the other. The installed configuration must pass together. Reevaluate upstream compatibility during an intentional tooling upgrade; do not downgrade TypeScript or bypass peer requirements merely to add a parser.

No additional dependencies are required by the starter. A PHP static analyzer, additional mocking tools, import resolver, Git hook manager, OpenAPI validator, and type generator are deferred: the current starter has no application behavior requiring those additions. This is not a claim that formatting replaces semantic PHP analysis. Review purpose, compatibility, maintenance, license, and security before adding tools. Dependency audit results are a dated snapshot, not a current guarantee.

## API response conventions

The existing [REST API conventions](../architecture/api-conventions.md) establish the response standard; this phase adopts them without creating endpoints, a response wrapper, exception middleware, OpenAPI operations, or generated types.

- Future application paths use `/api/v1`, resource-oriented plural nouns, JSON, and snake_case public fields.
- Use explicit Laravel Resources: a single resource has a `data` object, collections a `data` array, and paginated collections `data`, `links`, and `meta`. Do not add a redundant success flag or expose arbitrary model serialization.
- Pagination defaults to page `1`, `per_page` `25`, maximum `100`, with validated parameters and stable ordering.
- Use meaningful HTTP statuses: `200` for a returned representation, `201` for creation, and `204` with no response body. Validation uses `422`; documented missing resources use `404`; unexpected failures use safe `500` responses.
- Application errors contain a safe `message`, stable snake_case `code`, and optional field `errors` mapping dot paths to arrays of strings. Preserve relevant headers such as `Retry-After`.
- Distinguish absent fields from null, use UTC ISO 8601 timestamps, and document identifier/decimal wire types. Future endpoint changes must maintain OpenAPI 3.1.2 and generated TypeScript types under separate implementation authorization.

The existing `/up` is an operational Laravel health route, not an application Resource or database-readiness check. Future authentication examples in the architecture remain outside starter implementation scope.
