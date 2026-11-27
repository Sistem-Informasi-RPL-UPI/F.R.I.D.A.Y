# Project scope and status

FRIDAY is a reusable technical starter for a decoupled Laravel REST API and React SPA. It provides independent application foundations, development standards, quality checks, and onboarding documentation. It is not a business application.

**Status:** The starter is complete. Both applications install, run, test, and build independently. There is no active phase or pending setup work; the next work is whatever feature a team chooses to build.

## What the starter includes

- `BE/`: Laravel 13 API foundation on PHP 8.5 with MySQL 8.4 configuration, Pest tests, Pint formatting, and PHP-only production preparation.
- `FE/`: React + TypeScript SPA on Vite with React Router Declarative Mode, strict TypeScript, Vitest, a Playwright smoke test, ESLint, and Prettier.
- Independent manifests and lockfiles; no root install or combined script.
- Separate development and test database configuration with a guard against unsafe test targets.
- Documentation for setup, environment, troubleshooting, development standards, testing, and architecture.

## What is intentionally not included

- Authentication, login, registration, Sanctum setup, and session flows.
- Roles, permissions, dashboards, and business modules.
- Application `/api/v1` endpoints, an OpenAPI file, and generated API types.
- Domain-specific database schemas.
- Production deployment, Docker, and CI/CD.

Sanctum SPA Cookie Authentication, Axios, TanStack Query, React Hook Form, Zod, and OpenAPI 3.1.2 are approved directions for future feature work. They are documented so the team can build on them, but they are not implemented or installed until a feature needs them.

## Where to go next

- New contributor: [onboarding checklist](onboarding.md).
- Setup: [setup guide](setup/README.md), [environment](setup/environment.md), [troubleshooting](setup/troubleshooting.md).
- Conventions: [development standards](development/standards.md), [testing](development/testing.md), [Git workflow](development/workflow.md).
- Architecture: [overview](architecture/overview.md), [backend](architecture/backend.md), [frontend](architecture/frontend.md), [authentication](architecture/authentication.md), [API conventions](architecture/api-conventions.md).
- Verified environment: [verified baseline](verification/baseline.md).
