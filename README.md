# WPT 202 — Sprint 1 React sample

This is a small Vite + React sample for the Sprint 1 copy-management requirement.

## Run locally

1. Install Node.js (LTS).
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite.

## What is included

- `src/locales/en.json`: centralized English UI copy.
- `src/utils/text.js`: `t("key.path")` helper.
- `src/config/appConfig.js`: single app-name configuration value (PRD 8.7).
- `src/App.jsx`: one working S-01 sample screen using keys only for UI copy.
- A responsive skeleton-style sample UI; the Continue button shows a confirmation message.

## PRD alignment

- Section 17 key-copy lines included: S-01, S-02, N-01, S-13 bloom/bud, S-14, S-16, S-20, S-22, S-42, faint star, no night, sleep score label, delete confirmation, and iPhone blocking message.
- Additional user-facing strings from the supplied PRD are grouped by feature to prepare for the specified screen set.
- PRD 8.5: copy is short and kind; sleep figures are explicitly labelled as estimates when displayed.
- PRD 8.7: app name is read from `src/config/appConfig.js`.
- The sample screen demonstrates the helper; this is not a complete implementation of every listed screen.

## Important scope note

The supplied Sprint 1 brief requests all exact user-facing copy for the named screens. The PRD excerpt provides only some exact copy strings and does not define every title/button label for every screen in the requested set. Strings not explicitly specified in PRD Section 17 or the retrieved requirements are marked in this file as practical sample labels and should be confirmed against the complete screen designs/product-owner copy before release.

## Hardcoded text audit

Visible UI text in `App.jsx` is read via `t("...")` or `appConfig.appName`. Decorative glyphs and CSS labels are not user-facing copy.
