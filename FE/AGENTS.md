# Frontend project context

Follow the [root agent instructions](../AGENTS.md), [frontend README](readme.md), [development standards](../docs/development/standards.md), and [frontend architecture](../docs/architecture/frontend.md).

- Run npm commands from `FE/`. Preserve `package-lock.json`, installed dependencies, and unrelated changes; do not scaffold or reinstall merely to verify.
- Keep strict TypeScript and React Router Declarative Mode. Preserve `app -> features -> shared`; shared code must not import app/features, and cross-feature access uses deliberate public entry points.
- Create feature/shared folders only when needed. Authentication, an API client, server-state/form libraries, and business features are not part of the starter.
- Use `npm run check` for type/lint/format/Vitest. Run `npm run build` for artifact checks and `npm run test:e2e` for browser/navigation behavior. The smoke test manages its preview server and needs a free port 4173.
- Use `npm run format` to apply fixes; check commands do not rewrite source. Review the Babel parser/TypeScript compiler split before changing lint rules or adding a parser.
- Vitest tests are colocated `*.test.ts(x)`; Playwright scenarios live in `e2e/`. Keep shared DOM cleanup in `src/test/setup.ts`.
- `VITE_*` values are public. Do not add secrets, credentials, backend implementation imports, or arbitrary-origin authenticated requests.
- All frontend commands must work without PHP, MySQL, or a live backend. Backend production preparation must never invoke this application.
- Do not change architecture, install packages, commit, or push without an explicit request.
