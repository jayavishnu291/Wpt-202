# G2 Navigation and G6 Alarm Test Report

## Environment

- Platform: Expo SDK 58 / React Native 0.88.1
- Working repository: `C:\Users\BHUVANESWARI V\WPT-202-sync`
- Integration branch: `golf/sprint1-integration`
- Base commit: `c619ace0a3471fc2f2492747d46331e2ea821c16`
- Report updated: 2026-11-28
- Phone brand/model/Android version: **PENDING**
- Android SDK / `adb`: **NOT AVAILABLE**

## Automated validation actually executed

| Command | Result |
|---|---|
| `npm run typecheck` | **PASSED** |
| `npm run lint` | **PASSED** |
| `npm test -- --runInBand` | **PASSED**: 13 suites, 196 tests |
| `npm run test:data -- --runInBand` | **PASSED**: 5 suites, 13 tests |
| `npm run check:text` | **PASSED**: 25 files scanned, 0 problems |
| `npm run test:text` | **PASSED**: 14 tests |

## G2 code inspection and implementation

- The four bottom tabs remain registered: Home, History, Alarms and Settings.
- Onboarding and Focus are root-level Expo Router stacks and remain outside the bottom-tab navigator.
- The onboarding child components are stored under `src/ui/onboarding/`; `src/app/onboarding/` contains only `index.tsx`, so no helper route is exposed.
- The active Focus screen handles Android hardware back presses by consuming the event while mounted.
- The active Focus screen now has a real countdown and removes its back listener and interval on unmount.
- Tab bar height includes the safe-area bottom inset.
- Safe-area views are used by tabs, onboarding, alarms and Focus screens.
- Shared strings use `t()` and visible/accessibility strings are in `src/text/en.ts`.
- No obsolete translation imports or broken navigation paths were found.

### G2 physical tests remaining

All G2 physical-device checks remain PENDING:

- Verify the four tabs on Android.
- Verify onboarding and Focus do not show the bottom tab bar.
- Press Android hardware back during an active Focus session.
- Verify notch/status-bar and bottom-navigation safe areas.
- Verify old onboarding helper deep links do not open standalone routes.

## G6 code inspection and implementation

- Maximum alarm count is enforced at the UI and repository levels.
- Add Alarm is hidden at five alarms.
- Create, edit, enable, disable, delete and delete confirmation are implemented.
- Time, repeat days and label editing are implemented.
- Label limits use `Intl.Segmenter` grapheme clusters with a Unicode-aware fallback.
- Repository validation now accepts 30 user-perceived label characters and rejects labels above the limit.
- Maths and Shake missions are implemented; Shake is controlled by `SW-06`.
- Maths validation enforces configured difficulty and problem limits.
- Morning Bell, Soft Chimes, Birdsong, Rising Tone, Classic Beep and Strong Bell are available with preview playback.
- Vibration and snooze persist; snooze remains platform/feature aware.
- Defaults are 07:00, every day, Maths medium, two problems, Morning Bell, vibration enabled and snooze disabled.
- Database persistence uses the existing `DatabaseAdapter` and alarm repository.
- No duplicate database implementation or database bypass was added.
- Schema migration 002 preserves existing alarm rows and sets the database-level snooze default to disabled.
- Invalid time, repeat days, label, mission, level, count and sound values are rejected at repository boundaries where applicable.

### G6 physical tests remaining

All G6 physical-device checks remain PENDING:

- Create five alarms and verify Add disappears, then reappears after deletion.
- Edit and persist every alarm field.
- Verify FR-AL-03 defaults on a new alarm.
- Enter 30/35 plain characters and emoji/ZWJ/combining-character labels.
- Verify all six sound previews on the target Android runtime.
- Toggle vibration and snooze.
- Temporarily set `SW-06` false and verify Shake visibility/saving; restore the flag afterward.
- Verify alarm scheduling, ringing and mission behavior on a physical Android phone.

## Hotel review

**PENDING.** The alarm repository and migration changes require Hotel approval before they are considered accepted integration work:

- Grapheme-aware label validation and legacy-row truncation.
- Mission, level, count and sound validation.
- Alarm schema migration 002 and the snooze default.

No Hotel approval has been claimed.

## Android physical testing

**NOT COMPLETED.** No Android device or SDK/`adb` environment was available for this pass. No physical result is reported as passed.
