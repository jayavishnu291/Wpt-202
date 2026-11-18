# Handover note: India · Sprint 1

**Written by:** Sanjay Kumar.A · **Date:** Wednesday, 18 November 2026 · **Sprint end:** Day 26
**For:** Sprint 2 testing team. Nobody signs off their own work.

---

## 1. Summary
India built the shared foundations for Sprint 1: the rules config, date/time helpers, the shared text file and helper, the device info helper, the bug tracker and results sheet, this handover template, six alarm sounds, the privacy/terms pages, the landing page, and the automatic checks (CI). Most cards are merged to `main`. Some are only partly finished: the brand guide steps are not in the text file yet, the sound names are missing from the live text file, and a few files still sit in the repo root instead of their folders.

## 2. Cards finished

| Card (Planka link) | PRD references | Status |
|---|---|---|
| [I1 Repo and app project](https://tasks.whitepixeltechnologies.in/cards/1893643514005161240) | see card | Partly done |
| [I2 Business rule config](https://tasks.whitepixeltechnologies.in/cards/1893643514013549850) | see card | Done |
| [I3 Shared text file and `t()` helper](https://tasks.whitepixeltechnologies.in/cards/1893643514021938460) | PRD 17, 9.1.1, 9.11 | Done (merged late; not every PRD 17 line re-checked) |
| [I4 Bug tracker and results sheet](https://tasks.whitepixeltechnologies.in/cards/1893643514013549849) | PRD 19, 20; BRD 23 | Done |
| [I5 Brand guide content](https://tasks.whitepixeltechnologies.in/cards/1893643514072270110) | PRD 9.1.2 | Partly done |
| [I6 Date and time helpers](https://tasks.whitepixeltechnologies.in/cards/1893643514063881501) | see card | Done |
| [I7 Handover template and India note](https://tasks.whitepixeltechnologies.in/cards/1893643514105824543) | PRD 20; BRD 22.4, 22.5 | Done |
| [I8 Device info helper](https://tasks.whitepixeltechnologies.in/cards/1893643514147767584) | see card | Partly done |
| [I9 FAQ content](https://tasks.whitepixeltechnologies.in/cards/1893643514206487841) | see card | Partly done |
| [I10 Six alarm sounds](https://tasks.whitepixeltechnologies.in/cards/1893643514256819490) | PRD FR-AL-03 | Partly done |
| [I11 Privacy and terms pages](https://tasks.whitepixeltechnologies.in/cards/1893643514332316963) | see card | Done (merged; web address waits on W4) |
| [I12 Landing page](https://tasks.whitepixeltechnologies.in/cards/1893643515489944883) | see card | Done (merged; web address waits on W4) |
| [I13 Automatic checks (CI), import rules, PR template](https://tasks.whitepixeltechnologies.in/cards/1893643515565442356) | PRD 14.4; BRD 22.3–22.5; Tech Architecture 2, 5.3, 13, 15 | Done |

## 3. How to check each item

**I4 Bug tracker:** open the repo Issues page, click New issue, choose the bug report template. Sample bug #3 shows a filled example. Labels: critical, high, medium, low, android, ios, both, bug. Results sheet: link on the I4 card (3 tabs).
**Tester should see:** the template fields (steps, expected, actual, phone brand, version, screenshot) and all 8 labels.

**I7 Handover template:** `docs/handover-note-template.md`.

**I10 Sounds:** the six `.wav` files are in `assets/sounds/` with `LICENCES.md`. Play each one on a phone. **Tester should see:** six clear sounds, none harsh. India played all six on a Realme C61 (Android 16): clear and loud enough.

**I2, I6 Rules and date/time:** run `npm test`. **Tester should see:** their tests pass.

**I13 Checks:** open any pull request to `main`. **Tester should see:** the "PR CI" workflow run typecheck, lint and tests. A direct push to `main` should open a "Direct push to main" issue labelled high.

**I11, I12 Pages:** files are in `site/` (`landingpage.html`, `privacy.html`, `terms.html`). Open them in a browser.

**Build:** dev. **Test settings:** none.

## 4. Feasibility check results
India had no feasibility checks (FC) this sprint.

## 5. Phones used

| Brand and model | Android / iOS version | Used for |
|---|---|---|
| Realme C61 (RMX3933) | Android 16 | Playing the alarm sounds (I10) |

No iPhone was used by India in Sprint 1.

## 6. Known problems

| Problem | Bug link | Severity |
|---|---|---|
| PR CI fails on every pull request (typecheck). `package.json` on `main` was cut from about 50 lines to 16 in commit `9ed8b32` (PR #32), so packages such as `expo-router`, `expo-sqlite` and the React types are missing, and there are no `lint` or `test` scripts. Needs restoring by the text file owner or the senior | not filed yet | High |
| The six sound names are not in the live text file `src/text/en.ts` (they were added to the old root `en.ts` in PR #23, which is no longer the live file) | not filed yet | Medium |
| I5 brand guide steps are in `brandGuide.ts` and `i5/`, not merged into `src/text/en.ts`. No brand was checked on a team phone. Hotel's FC-5 depends on this | not filed yet | High |
| I8 device info files are still in the repo root. `expo-device` and `expo-application` are not in `package.json`. Not checked on 2 Android brands or an iPhone | not filed yet | Medium |
| I1: `app.json` still has Android package `com.anonymous.Wpt202` and name `Wpt-202`. The dev package ID is only set when `APP_VARIANT=dev` | not filed yet | Medium |
| I1: backup rules plugin is not built (Core owns `plugins/`) | not filed yet | Medium |
| Old copies are still in the repo root (`en.ts`, `t.ts`, `text.test.ts`, `i5/`, `i9/`, `i11/`). They can confuse imports | not filed yet | Low |

## 7. Not finished
- Add the six sound names to `src/text/en.ts` (I10). The change is ready on branch `india/sound-names-2` with a PR open, but it can't be merged until PR CI is green (see section 6).
- I10 checks done: all six sounds were played on a Realme C61 (Android 16) and are clear and loud enough. iPhone sound format: not confirmed. The sounds are WAV; Hotel's FC-10 result decides whether they need converting (for example to CAF). Not tested on an iPhone by India.
- Merge I5 brand steps into `src/text/en.ts`, check brands on real phones, then tell Hotel.
- Move I8 files into `src/native/` and `src/domain/`, add the two Expo packages, check on phones.
- Fix I1 app name and Android package; ask Hotel for the backup rules plugin.
- Delete the old root copies and the `i5/`, `i9/`, `i11/` folders once their content is merged.
- Checks on `main`: PR CI typecheck is failing on every pull request (see section 6). Lint and tests do not run because typecheck stops first.

## 8. Decisions or questions for the Product Owner
- Approve the "PROPOSED" wording in `src/text/en.ts`, including the six sound names.
- Approve the 10 FAQ answers (I9).
- OK to treat the I5 brand steps as "public source" until a team phone is available for each brand?

## 9. Where things are
- Branch: `main` in `jayavishnu291/wpt-202`.
- Text: `src/text/en.ts`, `src/text/t.ts`, `src/text/__tests__/text.test.ts`.
- Config: `config/rules.ts`, `config/app.ts`.
- Sounds: `assets/sounds/`.
- Pages: `site/`.
- CI: `.github/workflows/`, `.github/pull_request_template.md`; README "Checks" section.
- Bug template and labels: `.github/ISSUE_TEMPLATE/`.
- Template: `docs/handover-note-template.md`.
