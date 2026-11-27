# Agent Instructions

## Purpose and audience

This repository is a reusable, team-ready Laravel REST API and React SPA starter. It contains two independent applications — `BE/` (Laravel 13 API) and `FE/` (React + TypeScript SPA) — plus shared documentation. The starter delivers technical foundations, development standards, quality checks, and onboarding material; it is not a finished business application.

Follow these instructions together with the user's current request and the linked architecture documents. If instructions conflict, stop the affected work, explain the conflict, and ask for clarification. Do not silently change an approved architectural decision.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `BE/` | Independent Laravel REST backend (PHP only; no Node.js asset build) |
| `FE/` | Independent React + TypeScript SPA and static build |
| `docs/` | Architecture, setup, development standards, scope, and verification |

Each application owns its manifest and lockfile (`BE/composer.*`, `FE/package*`). There is no root install, combined development script, Docker setup, CI/CD configuration, or monorepo orchestrator.

## Approved stack

| Component | Baseline |
| --- | --- |
| Repository | Monorepo with independent `BE/` and `FE/` applications |
| Backend | Laravel 13 (PHP 8.5) |
| Frontend | React + TypeScript, Vite, React Router Declarative Mode |
| Communication | Decoupled REST API under `/api/v1` |
| Database | MySQL 8.4 |
| Backend organization | Modular Monolith |
| Frontend organization | Feature-Based (`app -> features -> shared`) |
| HTTP client | Axios |
| Server state | TanStack Query |
| Forms / validation | React Hook Form + Zod |
| Testing | Pest (backend), Vitest (frontend), Playwright (browser) |
| API documentation | OpenAPI 3.1.2 with generated TypeScript types |
| Deployment | Provider-neutral; provider and production origins undecided |

Axios, TanStack Query, React Hook Form, Zod, OpenAPI, and generated contract types are approved choices for future feature work. They are not installed until a feature needs them. Sanctum SPA Cookie Authentication is the approved future authentication design; it is not implemented in the starter.

Do not replace Laravel 13 or another approved component to resolve a conflict without approval.

## Commands

Run commands from the owning application root.

| Root | Command | Purpose |
| --- | --- | --- |
| `BE/` | `composer run dev` | Serve the API at `http://localhost:8000` |
| `BE/` | `composer run check` | Pint formatting check + Pest (needs a prepared MySQL test schema) |
| `BE/` | `composer run format` | Apply Pint formatting |
| `BE/` | `composer run prepare-production` | Cache config/routes/events with PHP only |
| `FE/` | `npm run dev` | Serve the SPA at `http://localhost:5173` |
| `FE/` | `npm run check` | Type-check, lint, formatting check, Vitest |
| `FE/` | `npm run build` | Build the static artifact into `dist/` |
| `FE/` | `npm run test:e2e` | Build and run the Playwright smoke test |

Backend commands must not require Node.js or frontend assets. Frontend commands must not require PHP, MySQL, or a running API. See [development standards](docs/development/standards.md) and [testing conventions](docs/development/testing.md).

## Backend rules

- Follow [backend architecture](docs/architecture/backend.md).
- Organize business capabilities under `BE/app/Modules/` when they are introduced. Do not add empty modules or speculative abstractions.
- Keep controllers focused on HTTP translation, Form Requests on validation, Actions on use cases, Policies on authorization, and Resources on external representations.
- Use Laravel and Eloquent directly when sufficient. Do not add a Repository Pattern, generic CRUD base classes, or a service layer for every Action.
- Introduce Services, DTOs, contracts, events, and jobs only for a concrete responsibility, and explain the benefit.
- Keep module dependencies explicit and acyclic. Only documented public interfaces may cross module boundaries.
- Keep MySQL migrations centrally ordered under `BE/database/migrations/`; record module ownership when modules are added.
- Enforce authorization and business invariants on the backend, including ownership and protected fields.
- Use PHP type declarations, PSR-4 namespaces, and Laravel-compatible formatting. Keep transactions around coherent operations.
- Do not introduce microservices, internal HTTP calls between modules, or speculative distributed infrastructure.

## Frontend rules

- Follow [frontend architecture](docs/architecture/frontend.md).
- Use the dependency direction `app -> features -> shared`. Shared code must not import app or feature code.
- Features own their pages, components, API functions, query hooks, and form schemas. Cross-feature usage must go through an explicit public entry point.
- Use React Router Declarative Mode. Do not introduce Framework Mode, SSR, or a second data-loading architecture without approval.
- Use TanStack Query for server state, React Hook Form for forms, Zod for client validation, and local React state for temporary interaction state.
- Route feature HTTP calls through the trusted backend Axios client. Do not call undocumented endpoints or embed transport logic in presentation components.
- Keep strict TypeScript. Do not suppress errors with unexplained `any`, assertions, or ignored diagnostics.
- Generated API types mirror the wire contract. Do not edit generated files manually.
- Client validation and route guards improve UX; they never replace server checks.

## API and authentication direction

- Put application endpoints under `/api/v1`. `/sanctum/csrf-cookie` is the framework-owned, unversioned bootstrap exception.
- Use the documented resource, pagination, error, and status-code conventions. Return JSON for application errors; `204` has no body.
- Maintain OpenAPI 3.1.2 alongside endpoint changes and generate frontend types from it.
- Use session cookies for the SPA. Do not introduce JWT, bearer-token login, refresh tokens, or browser storage of credentials.
- Configure the backend Axios client with credentials and XSRF support. Never forward its configuration or headers to arbitrary origins.
- Preserve CSRF protection, session regeneration on login, and session invalidation on logout.
- Authentication determines identity; Policies determine permission.

See [API conventions](docs/architecture/api-conventions.md) and [authentication](docs/architecture/authentication.md).

## Security

- Production session cookies must be `Secure` and `HttpOnly`; the XSRF cookie is intentionally readable by the frontend.
- Use explicit CORS origins and Sanctum stateful hosts. Never use wildcard credentialed CORS or disable CSRF to fix integration problems.
- Preserve Laravel 13's origin-aware request-forgery protection with token fallback. Broad same-site trust or origin-only mode needs security review.
- Treat shared-cookie subdomains as trusted infrastructure. Unrelated production domains are incompatible with the Sanctum SPA model.
- Enforce backend validation, object-level authorization, mass-assignment controls, login throttling, and safe serialization.
- Do not commit secrets, real credentials, `.env` contents, session cookies, or private keys. `VITE_*` values are public build configuration.
- Do not log passwords, session identifiers, CSRF tokens, or complete sensitive request bodies. Disable production debug output and avoid unsafe HTML rendering.

## Testing

- Use Pest for backend unit, feature, and architecture checks; use an isolated MySQL database for persistence tests.
- Use Vitest for frontend unit/component behavior, query hooks, form validation, and error handling.
- Use Playwright for browser smoke tests.
- Ordinary Laravel HTTP tests bypass CSRF by default. `actingAs` tests and mocked HTTP tests do not prove browser authentication security.
- Test success paths and relevant failures of implemented behavior.
- Do not claim a check passed unless it ran. Report unavailable tooling and blocked checks honestly.
- Run the checks relevant to the change; do not install tooling merely to make a check available.

## Git workflow

- Inspect Git status and relevant files before editing. Preserve unrelated work and history.
- Keep changes limited to the requested scope. Do not switch branches, create commits, or push unless explicitly requested.
- Do not reset, discard, overwrite, or delete another contributor's work. Resolve ambiguity before destructive operations.
- Use focused changes and descriptive commit messages when committing is requested.
- Before finishing, review the diff, verify only intended files changed, and report checks and limitations.

## Changing the architecture

Before changing an approved technology, directory root, authentication model, API versioning policy, routing mode, architectural boundary, or deployment assumption:

1. Describe the problem and evidence.
2. Explain alternatives, trade-offs, compatibility, and migration impact.
3. Obtain explicit approval before making the change or installing related tooling.
4. Update the affected architecture documents, tests, and documentation.

Do not treat a recommendation, future design example, or external documentation as approval to change the baseline.

## Documentation map

- [Project scope](docs/scope.md)
- [Architecture overview](docs/architecture/overview.md)
- [Backend architecture](docs/architecture/backend.md)
- [Frontend architecture](docs/architecture/frontend.md)
- [Authentication architecture](docs/architecture/authentication.md)
- [API conventions](docs/architecture/api-conventions.md)
- [Development standards](docs/development/standards.md)
- [Testing conventions](docs/development/testing.md)
- [Git workflow](docs/development/workflow.md)
- [Setup guide](docs/setup/README.md)
- [Environment configuration](docs/setup/environment.md)
- [Troubleshooting](docs/setup/troubleshooting.md)
- [Onboarding checklist](docs/onboarding.md)
- [Verified baseline](docs/verification/baseline.md)
