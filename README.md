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

The **Android Debug Build** workflow runs on pushes to `main` and can also be started manually. It uses Java 17, runs Expo prebuild, and builds the debug APK with Gradle using the development application ID `in.whitepixeltechnologies.wpt202a.dev`.

ESLint enforces these layer boundaries:

- `src/domain/**` must not import React, React Native, Expo packages, `src/data/**`, `src/native/**`, or `src/services/**`.
- `src/data/**` must not import `src/ui/**`, `src/app/**`, `src/state/**`, or `src/native/**`.
- `src/native/**` must not import `src/ui/**`, `src/app/**`, `src/state/**`, or `src/data/**`.
- `src/services/**` must not import `src/ui/**`, `src/app/**`, or `src/state/**`.
- `src/state/**`, `src/ui/**`, and `src/app/**` must not import `src/data/**` or `src/native/**`.
- Production code must not import from `**/dev/**`.

Use the [pull request template](.github/pull_request_template.md) for the Planka card, PRD and Tech Architecture references, change summary, and required reviews.

The **Direct Push Alarm** workflow checks pushes to `main` for an associated merged pull request. If none is found, it creates a high-priority issue titled `Direct push to main` with the pusher, commit link, and message, then fails the workflow. Branch protection is unavailable for private repositories on the GitHub Free plan, so this alarm detects direct pushes after they happen; it cannot block them.

Team rules:

- Never merge a pull request with a red check.
- Never push straight to `main`.
