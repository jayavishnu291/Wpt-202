/**
 * Expo config plugin: adds the <queries> intents that app blocking needs to AndroidManifest.xml.
 *
 * Why: since Android 11 an app can only "see" other apps that it declares in <queries>.
 * This lets us list launcher apps and find the default home app, dialler, clock and Settings
 * WITHOUT the QUERY_ALL_PACKAGES permission (never use that one: PRD 13.1, FR-BL-01).
 *
 * Intents declared here (Tech Architecture 8.12):
 *   - launcher apps : MAIN + LAUNCHER
 *   - home screen   : MAIN + HOME
 *   - dialler       : DIAL (tel:)
 *   - clock         : SHOW_ALARMS
 *   - Settings      : android.settings.SETTINGS
 *
 * It runs every time you run `npx expo prebuild`. Running it twice never adds anything twice.
 */
const { withAndroidManifest } = require('expo/config-plugins');

const WANTED_INTENTS = [
  {
    action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
    category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
  },
  {
    action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
    category: [{ $: { 'android:name': 'android.intent.category.HOME' } }],
  },
  {
    action: [{ $: { 'android:name': 'android.intent.action.DIAL' } }],
    data: [{ $: { 'android:scheme': 'tel' } }],
  },
  {
    action: [{ $: { 'android:name': 'android.intent.action.SHOW_ALARMS' } }],
  },
  {
    action: [{ $: { 'android:name': 'android.settings.SETTINGS' } }],
  },
];

function addBlockingQueries(manifest) {
  if (!Array.isArray(manifest.queries) || manifest.queries.length === 0) {
    manifest.queries = [{}];
  }
  const queries = manifest.queries[0];
  if (!Array.isArray(queries.intent)) {
    queries.intent = [];
  }
  const alreadyThere = new Set(queries.intent.map((item) => JSON.stringify(item)));
  for (const wanted of WANTED_INTENTS) {
    if (!alreadyThere.has(JSON.stringify(wanted))) {
      queries.intent.push(wanted);
    }
  }
  return manifest;
}

module.exports = function withBlockingQueries(config) {
  return withAndroidManifest(config, (modConfig) => {
    addBlockingQueries(modConfig.modResults.manifest);
    return modConfig;
  });
};

module.exports.addBlockingQueries = addBlockingQueries; // exported only so it can be tested
