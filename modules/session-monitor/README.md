# Session monitor

The Android implementation uses a `specialUse` foreground service. Its
`PROPERTY_SPECIAL_USE_FGS_SUBTYPE` is configured by `app.plugin.js`; it does not
use `dataSync`. The service is intended to run only while a focus, night, or nap
session is active and displays a silent notification on the Status channel.

Events are appended as JSON Lines in device-protected storage so the boot
receiver can write `boot` before the first unlock. Each event includes a
monotonic sequence, an offset-aware wall-clock timestamp, elapsed realtime,
boot count, event type, and session ID. Optional event fields contain the
session kind, planned end, or an explanatory detail.

Heartbeat alarms are chained with `setExactAndAllowWhileIdle`. If Android has
not granted exact-alarm access, the module falls back to `setAndAllowWhileIdle`
and records `alarm_fallback`; these runs cannot establish exact-alarm FC-9
timing. Focus heartbeats are scheduled every 10 minutes, and night/nap
heartbeats every 30 minutes. Night and nap sessions are capped at 14 and 4
hours respectively.

The selected service type is **`specialUse` (PI-01)**. FC-9 is **not yet
verified**: this workspace has no three-brand device run results or Overnight
runs sheet. The forced-stop, missing-service, missed-session-end, shutdown,
normal-night, and Android 15+ restart cases must be run on physical devices;
this code change alone is not evidence that NFR-15 passes.

Build and run a development client with `npx expo run:android`; Expo Go does
not include this local native module. Allow app notifications on Android 13+
so N-06 is visible in the notification drawer. On Android 12 and newer, grant
the app **Alarms & reminders** access before recording FC-9 results. If exact
alarm access is unavailable, the event log records `alarm_fallback`, and that
run does not verify exact-alarm heartbeat timing.

Local checks completed: TypeScript, Expo config evaluation, Android
autolinking, and generated manifest assertions. Android Kotlin compilation
has not passed yet: Gradle detects an incomplete NDK installation
(`source.properties` is missing), and downloading the official NDK archive was
interrupted by network errors. Do not report the native build or FC-9 as
passing until rebuilt successfully and tested on the required phones.
