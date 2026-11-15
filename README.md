# WPT 202

## Development requirements

- Node.js 24 (`.nvmrc`)

On Windows, `npm ci` builds `better-sqlite3`. Install Visual Studio Build Tools with the **Desktop development with C++** workload before installing dependencies.

## Checks

Run these commands locally:

- `npm run typecheck` checks TypeScript without emitting files.
- `npm run lint` runs ESLint and fails on warnings or errors.
- `npm test` runs the Jest test suite.

The **PR CI** workflow runs for pull requests targeting `main` when they are opened, synchronized, reopened, or marked ready for review. Typecheck, lint, and tests must all pass before merging. Merge queue (`merge_group`) is not used because it is unavailable for private repositories on the GitHub Free plan.

The **Android Debug Build** workflow runs on pushes to `main` and can also be started manually. It uses Java 17, runs Expo prebuild, and builds the debug APK with Gradle using the development application ID `in.whitepixeltechnologies.wpt202a.dev`. Download the `wpt202-android-debug` artifact from the workflow run; it is retained for 14 days.

ESLint enforces these layer boundaries:

- `src/ui/**` must not import `src/data/db/**`; UI code should use services for persistence.
- `src/data/**` must not import `src/ui/**` or `src/services/**`.
- `src/services/**` must not import `src/ui/**`.
- Production code must not import `src/dev/**`; developer tools (`src/dev/**` and `app/dev/**`), tests, and `site/**` are excluded from this restriction.

Use the [pull request template](.github/pull_request_template.md) to summarize changes, testing, checklist status, and screenshots when the UI changes.

The **Direct Push Alarm** workflow checks pushes to `main` for an associated merged pull request. If none is found, it creates a `direct-push` issue with the pusher, commit link, and message, then fails the workflow. Branch protection is unavailable for private repositories on the GitHub Free plan, so this alarm detects direct pushes after they happen; it cannot block them. If it fires, review the issue and commit, then follow up with the team to resolve the direct push.
