# Git collaboration workflow

This workflow builds on the existing `Develop` integration branch, `origin/Develop` default branch, and pull-request history. It documents contributor practice; it does not create branches, change Git configuration or remote protections, commit, or push. See [development standards](standards.md), [testing conventions](testing.md), and the [project scope](../scope.md).

## Branches and changes

- Use `Develop` as the integration and pull-request target; preserve its exact case. No additional long-lived `main`, release branch, or deployment workflow is introduced.
- Start a short-lived branch from an up-to-date `Develop`, using `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>`, or `test/<topic>`. Use lowercase kebab-case topics; include an issue number when one exists.
- Inspect status before starting. Preserve unrelated edits and never move, reset, or stash another contributor's work without authorization. AI agents require explicit authorization before switching branches, committing, or pushing.
- Keep changes focused and reviewable. Include corresponding documentation and meaningful tests when behavior changes. Avoid unrelated formatting, lockfile churn, scaffold generation, and dependency upgrades.
- Update a published branch by merging `Develop` when needed. Rebase only private, unpublished work; do not force-push shared history. Resolve conflicts deliberately and rerun affected checks.

## Commits and pull requests

Use descriptive imperative commit subjects in the form `type(scope): change`, with an optional scope. For example, `chore(frontend): enforce formatting checks` or `docs: clarify database test isolation`. Common types are `feat`, `fix`, `chore`, `docs`, `test`, and `refactor`. Keep a commit coherent; explain material decisions in its body. This convention is reviewed by people; no commit-message or hook package is installed.

Open pull requests against `Develop`. Explain the concrete problem, resulting behavior, scope, actual checks run, and material limitations. Link an issue when available and flag architecture or dependency changes for explicit approval. Do not claim historical results as checks for the current change. Keep generated lockfile changes with the dependency change that requires them.

Request review from at least one teammate before merging; resolve feedback and conflicts, then use the team's available pull-request merge mechanism. Do not infer remote branch protection, mandatory status checks, merge permissions, or a specific merge strategy from this document. Those hosting settings require separate administration and are not configured here.

## Review checklist

- The change is limited to starter responsibilities; authentication, business features, deployment, Docker, and CI/CD need separate scope.
- Application roots, independent execution, approved architecture, and module/feature boundaries remain intact.
- Applicable formatting, linting, type checks, tests, and build/browser checks pass, or explicit blockers and their impact are reported.
- API response conventions remain consistent; endpoint contracts and generated types evolve together when endpoints are introduced.
- No credentials, private environments, database exports, build output, test reports, or dependency directories are included.
- Dependency changes are necessary and reviewed; corresponding lockfiles are included without unrelated updates.
- Documentation describes real commands and current behavior. Review the complete diff, including pre-existing workspace changes, before proposing a commit.

Formatting runs intentionally rewrite files; check commands do not. Git hooks and CI/CD are not prerequisites for running the application-scoped quality commands. The [contribution guide](../../CONTRIBUTING.md) is the contributor entry point and links to this workflow as the detailed process.
