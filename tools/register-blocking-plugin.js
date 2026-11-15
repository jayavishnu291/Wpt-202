/**
 * Adds "./plugins/withBlockingQueries" to the "plugins" list of app.json, safely.
 * Run it from the project folder:   node tools/register-blocking-plugin.js
 * - Makes a backup first (app.json.backup).
 * - Running it twice is harmless.
 * - If you use app.config.js / app.config.ts instead of app.json, it tells you to add the line by hand.
 */
const fs = require('fs');
const path = require('path');

const ENTRY = './plugins/withBlockingQueries';
const appJson = path.join(process.cwd(), 'app.json');

if (!fs.existsSync(path.join(process.cwd(), 'plugins', 'withBlockingQueries.js'))) {
  console.error('STOP: plugins/withBlockingQueries.js was not found. Copy the "plugins" folder from the first zip into the project first.');
  process.exit(1);
}
if (!fs.existsSync(appJson)) {
  console.error('app.json was not found in this folder.');
  console.error('If you use app.config.js or app.config.ts, add this line to its "plugins" list by hand:  "' + ENTRY + '"');
  process.exit(1);
}

let json;
try {
  json = JSON.parse(fs.readFileSync(appJson, 'utf8'));
} catch (error) {
  console.error('app.json could not be read as JSON (' + error.message + '). Add the line by hand: "' + ENTRY + '"');
  process.exit(1);
}

const expo = json.expo ? json.expo : json;
if (!Array.isArray(expo.plugins)) {
  expo.plugins = [];
}
const alreadyThere = expo.plugins.some((item) => (Array.isArray(item) ? item[0] : item) === ENTRY);
if (alreadyThere) {
  console.log('OK: the plugin is already registered. Nothing changed.');
  process.exit(0);
}

fs.copyFileSync(appJson, appJson + '.backup');
expo.plugins.push(ENTRY);
fs.writeFileSync(appJson, JSON.stringify(json, null, 2) + '\n');
console.log('DONE: registered ' + ENTRY + ' in app.json (backup saved as app.json.backup).');
console.log('plugins is now: ' + JSON.stringify(expo.plugins));
