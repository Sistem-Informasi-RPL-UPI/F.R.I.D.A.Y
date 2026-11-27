# Team onboarding checklist

Use this checklist for each contributor; check items only after completing them. The [setup guide](setup/README.md), application READMEs, and [contribution guide](../CONTRIBUTING.md) contain the working instructions.

## Repository and scope

- [ ] Confirm the checkout includes both manifests, both lockfiles, and the expected starter source.
- [ ] Read the [root README](../README.md) and [project scope](scope.md). Understand that authentication, business features, deployment, Docker, and CI/CD are not part of the starter.
- [ ] Read [development standards](development/standards.md), [testing conventions](development/testing.md), and [Git workflow](development/workflow.md).
- [ ] Identify the teammate responsible for repository review and the local MySQL service. Agree how private credentials are supplied without placing them in Git or shared diagnostics.

## Backend contributors

- [ ] Confirm PHP 8.5.x, Composer, and required extensions using the [backend README](../BE/readme.md).
- [ ] On a fresh checkout only, install from `BE/composer.lock`. Preserve existing dependencies/environments on a working checkout.
- [ ] Create missing private development/testing files from the safe examples, generate separate new keys, and supply distinct restricted database credentials.
- [ ] Verify the intended MySQL endpoint, exact-schema grants, and own-schema access/cross-schema denial. Do not use an administrator account in the application.
- [ ] Review and apply forward migrations to the confirmed development and test targets when needed; avoid seeds, wipes, refresh traits, or resets.
- [ ] Run `composer run check` from `BE/` with no frontend requirement and record actual results.
- [ ] Start `composer run dev`, verify `/up`, and stop the server when finished. Health does not prove database readiness.

## Frontend contributors

- [ ] Confirm Node.js/npm satisfy `FE/package.json` and `.node-version` using the [frontend README](../FE/readme.md).
- [ ] On a fresh checkout only, run `npm ci` from `FE/` without PHP, MySQL, or a live API requirement.
- [ ] Run `npm run check` and `npm run build`; keep public frontend configuration free of secrets.
- [ ] Install the matching Chromium binary if absent, ensure port 4173 is free, and run `npm run test:e2e` when browser work is part of your role.
- [ ] Start `npm run dev`, verify navigation and the fallback page, and stop the server when finished.

## Handover and first contribution

- [ ] Read [environment configuration](setup/environment.md) and [troubleshooting](setup/troubleshooting.md). Know how to inspect a failure without exposing private values or resetting data.
- [ ] Review the [verified baseline](verification/baseline.md) for the last known-good environment and its limits.
- [ ] Confirm ignored environments, dependency directories, caches, builds, and reports are absent from the proposed source change.
- [ ] AI-assisted contributors read [root](../AGENTS.md), [backend](../BE/AGENTS.md), and [frontend](../FE/AGENTS.md) instructions as applicable.
- [ ] Prepare a focused pull request to `Develop` with real check results and at least one teammate's review.
