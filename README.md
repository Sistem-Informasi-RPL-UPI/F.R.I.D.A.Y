# FRIDAY — Laravel + React starter

A reusable technical starter for teams building a decoupled Laravel REST API and React SPA. The monorepo contains two independent applications, MySQL development/test configuration, smoke tests, code-quality tools, and team development documentation.

## Start here

- [Setup guide](docs/setup/README.md): choose backend, frontend, or both and follow the prerequisites.
- [Backend README](BE/readme.md) and [frontend README](FE/readme.md): application commands and responsibilities.
- [Environment configuration](docs/setup/environment.md) and [troubleshooting](docs/setup/troubleshooting.md).
- [Onboarding checklist](docs/onboarding.md) and [contribution guide](CONTRIBUTING.md).

Existing contributors should preserve their environment files, application keys, databases, and installed dependencies. Initial-install commands are for a new checkout or an intentional dependency installation; do not repeat them on an already configured workspace.

## Structure and stack

| Location | Responsibility | Baseline |
| --- | --- | --- |
| `BE/` | Independent Laravel REST backend; no Node.js asset build | Laravel 13, PHP 8.5, MySQL 8.4, Pest, Pint |
| `FE/` | Independent browser SPA and static build | React, strict TypeScript, Vite, React Router Declarative Mode, Vitest, Playwright, ESLint, Prettier |
| `docs/` | Architecture, setup, standards, onboarding, and verification | [Project scope](docs/scope.md) |

Use Composer from `BE/` and npm from `FE/`; each application owns its manifest and lockfile. There is no root install, combined development script, Docker setup, CI/CD configuration, or monorepo orchestrator. Frontend commands require no PHP, database, or live API. Backend commands require no frontend installation or Node.js.

The backend follows a Modular Monolith design, and the frontend follows Feature-Based organization with `app -> features -> shared` dependencies. Module/feature directories are added only when a feature needs them. Application API versioning remains `/api/v1`; no application API operations are implemented in the starter. `GET /up` is Laravel's operational health route.

## Available checks

| Application root | Command | Prerequisites |
| --- | --- | --- |
| `BE/` | `composer run check` | PHP/Composer dependencies and the prepared isolated MySQL test schema |
| `FE/` | `npm run check` | Node.js/npm dependencies |
| `FE/` | `npm run build` | Node.js/npm dependencies |
| `FE/` | `npm run test:e2e` | Node.js/npm dependencies, matching Chromium, and free port 4173 |

Backend development serves `http://localhost:8000`; frontend development serves `http://localhost:5173`. Commands, formatters, test selection, and independence rules are documented in [development standards](docs/development/standards.md) and [testing conventions](docs/development/testing.md).

## Scope and architecture

This starter includes technical foundations and team tooling. Authentication, login, registration, Sanctum setup, roles/permissions, dashboards, business modules, domain-specific schemas, and production deployment are outside its scope. Docker and CI/CD need separate approval. Deployment remains provider-neutral.

Sanctum SPA Cookie Authentication remains the approved future authentication design. Axios, TanStack Query, React Hook Form, Zod, OpenAPI 3.1.2, and generated TypeScript API types remain approved choices for applicable future work; several are deliberately not installed because the starter has no corresponding feature.

The [architecture overview](docs/architecture/overview.md) and its linked documents describe the approved design, including future application examples. The [project scope](docs/scope.md) lists what the starter actually includes.

## Verification and collaboration

The [verified baseline](docs/verification/baseline.md) records the environment in which the starter was last checked end to end: clean installs, MySQL isolation, independent artifacts, quality checks, dependency audits, and platform limits. It is a dated snapshot, not a guarantee for the current machine.

Contributions target `Develop` through the documented [Git workflow](docs/development/workflow.md). AI agents must follow [AGENTS.md](AGENTS.md) and the application instructions before making changes.
