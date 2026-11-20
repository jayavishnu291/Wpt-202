# G2 Navigation and G6 Alarm Test Report

## Environment

- Platform: Expo SDK 58 / React Native 0.88
- Branch: `golf/navigation`
- Automated test date: 2026-11-20
- Phone brand: Pending
- Phone model: Pending
- Android version: Pending

## Test Results

| Test case | Expected result | Actual result | Status | Bug details |
|---|---|---|---|---|
| Home tab navigation | Home opens through Expo Router | Home route is registered and uses an Expo Router link | Pass | None |
| Onboarding navigation | Welcome, how-it-works, and set-times screens transition correctly | Expo Router links and replace navigation are implemented | Pass | None |
| Focus navigation | Setup, running, and result screens transition correctly | Expo Router links and replace navigation are implemented | Pass | None |
| Alarm list | Saved alarms are displayed | Database-backed alarm list loads from `listAlarms` | Pass | None |
| Alarm empty state | Empty state is shown without alarms | Correct empty card is rendered | Pass | None |
| Disabled alarm | Disabled alarm remains visible and editable | Disabled state is stored and displayed | Pass | None |
| Five-alarm limit | No sixth alarm can be added | UI and repository enforce the maximum of five | Pass | None |
| Alarm updates | Toggle, edit, save, and delete update the list | State and database operations update the list | Pass | None |
| Duplicate alarm | Duplicate time and repeat-day entries are rejected | Repository and screen both validate duplicates | Pass | None |
| Invalid alarm data | Invalid time and repeat-day values are rejected safely | Validation and safe row parsing reject invalid data | Pass | None |
| Add alarm | New alarm can be created | Alarm edit screen creates and saves a new alarm | Pending device | Requires Android Dev APK testing |
| Edit alarm | Existing values are preserved and can be changed | Initial alarm values populate the editor | Pass | None |
| Repeat-day circles | Day selections can be added or removed | Repeat-day buttons update `repeat_days` | Pending device | Requires Android Dev APK testing |
| Alarm label | Optional label can be entered and saved | Label input limits input to the configured character maximum | Pass | None |
| Alarm mission | Maths or Shake mission can be selected | Mission selection and mission-specific fields are implemented | Pending device | Requires Android Dev APK testing |
| Alarm sound preview | Selected sound can be previewed | Expo Audio preview is implemented | Pending device | Native audio/device testing required |
| Android visual layout | Alarm screens fit Android layouts | Static implementation complete | Pending device | Device testing required |

## Automated Evidence

- `npm run lint`: Passed.
- `npm run typecheck`: Passed.
- `npm test -- --runInBand`: 13 suites passed, 197 tests passed.
- `npm run test:text`: 13 text tests passed.
- `npm run check:text`: 16 files scanned, 0 problems.
- Metro `http://127.0.0.1:8081/status`: HTTP 200.

## Pending Dependency

Team Hotel has not provided `expo-dev-client` or a matching Android development APK. Physical Android testing cannot be completed until the development build is installed.
