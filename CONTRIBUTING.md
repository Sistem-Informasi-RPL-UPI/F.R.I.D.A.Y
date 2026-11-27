# Contributing

Read the [root README](README.md), complete the applicable [onboarding checklist](docs/onboarding.md), and use the [setup guide](docs/setup/README.md). The repository is a technical starter; authentication, business features, production deployment, Docker, and CI/CD need separate scope approval.

## Working on a change

Use `Develop` as the integration and pull-request target. Start work on a short-lived `feat/`, `fix/`, `chore/`, `docs/`, or `test/` branch with a lowercase kebab-case topic. Inspect Git status first and preserve unrelated work. See the [Git workflow](docs/development/workflow.md) for branch updates, review expectations, commit subjects, and merge guidance.

Keep changes focused. Follow [development standards](docs/development/standards.md) and [testing conventions](docs/development/testing.md), preserve independent applications, and avoid unrelated formatting or dependency updates. Architecture changes require review and approval before implementation. When endpoint work is introduced, keep API contracts and generated types in sync.

## Checks before review

| Change | Relevant checks |
| --- | --- |
| Backend source/tooling | From `BE/`: `composer validate --strict` when the manifest changes; `composer run check` with the isolated MySQL test environment |
| Frontend source/tooling | From `FE/`: `npm run check`; add `npm run build` for compiler/build changes |
| Browser/navigation/preview behavior | From `FE/`: `npm run test:e2e` with matching Chromium and free port 4173 |
| Documentation | Check links, command accuracy, safe example values, Markdown formatting, and agreement with real manifests and scope |
| Dependencies | Review necessity, compatibility, license/security implications, and applicable advisories; include only intended manifest/lockfile changes |

Run focused tests while editing and the applicable application checks before review. Report unavailable prerequisites and actual results honestly; do not present a past verification run as a check for a new change. Formatter commands apply fixes intentionally; check commands do not.

## Pull requests

Explain the concrete problem and resulting behavior, link an issue when available, list relevant checks actually run, and identify material limitations. Request at least one teammate's review, resolve feedback/conflicts, and use the team's available pull-request merge mechanism. No remote branch protection, CI status checks, hook manager, or merge strategy is configured by this guide.

Use descriptive imperative commit subjects such as `docs: clarify setup prerequisites` or `chore(frontend): enforce formatting checks`. Do not include private environments, keys/passwords, database exports, installed dependencies, generated caches/builds, or browser reports. Before proposing a commit, review the full diff and distinguish your change from existing workspace edits.

AI agents follow [AGENTS.md](AGENTS.md) and application instructions. Agents must not switch branches, commit, push, discard another contributor's work, or expand the starter scope without an explicit request. General cleanup is limited to confirmed unused files and reproducible artifacts; inspect references before removing source or scaffold files.
