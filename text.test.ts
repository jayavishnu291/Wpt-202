import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { en } from "../en";
import { t, type TextKey } from "../t";
import { appConfig } from "../../../config/app";

(globalThis as any).__DEV__ = true;
const root = path.resolve(__dirname, "../../..");
const name = appConfig.appName;

function leaves(obj: any, prefix = ""): Array<[string, string]> {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "string" ? [[`${prefix}${k}`, v] as [string, string]] : leaves(v, `${prefix}${k}.`),
  );
}
const all = leaves(en);

// [where in the PRD, key, exact PRD text]
const prd: Array<[string, TextKey, string]> = [
  // Section 17 Key copy
  ["17 S01", "onboarding.welcomeTitle", "Grow flowers by day. Collect stars by night."],
  ["17 S02 (1)", "onboarding.howPoint1", "Focus to grow flowers"],
  ["17 S02 (2)", "onboarding.howPoint2", "Put your phone down at night to collect stars"],
  ["17 S02 (3)", "onboarding.howPoint3", "Wake up with a small mission"],
  ["17 N01", "notifications.n01", "Your flower is still growing. Come back within 10 seconds."],
  ["17 S-13 bloom", "focus.resultBloom", "A new flower bloomed. Added to your garden."],
  ["17 S-13 bud", "focus.resultBud", "Your flower stayed a bud this time. Ready for another?"],
  ["17 S14 focus", "blockedApp.bodyFocus", "This app is resting while you focus."],
  ["17 S14 sleep", "blockedApp.bodyNight", "This app is resting while you sleep."],
  ["17 S16", "focus.questionBody", `${name} was closed while you were away. Did you use other apps during your session?`],
  ["17 S20", "night.outsideBody", "It's outside your night window."],
  ["17 S22", "night.awakeShortWarning", "Nights under 3 hours don't earn a star. End anyway?"],
  ["17 S42", "morningQuestion.body", "Did you use your phone after starting your night?"],
  ["17 Faint star", "report.starFaint", "A faint star tonight. Tomorrow's a fresh sky."],
  ["17 No night", "home.noNight", "No night recorded. Tonight's a fresh start."],
  ["17 Score label", "report.scoreLabel", "Sleep score (estimate)"],
  ["17 Delete", "privacy.deletePrompt", "Delete everything? This can't be undone."],
  ["17 iPhone blocking", "settings.iphoneBlocking", "App blocking is coming to iPhone soon."],
  // 9.1.1 permission explainers
  ["9.1.1 Notifications", "permissions.notifications.explainer", "So we can tell you when your flower blooms and remind you at bedtime."],
  ["9.1.1 Alarms iPhone", "permissions.alarmsIphone.explainer", "So your alarm can ring even in silent mode."],
  ["9.1.1 Exact alarms", "permissions.exactAlarms.explainer", "So your alarm rings exactly on time."],
  ["9.1.1 Exact alarms refused", "permissions.exactAlarms.refused", "Alarms may be late"],
  ["9.1.1 Full-screen alarm", "permissions.fullScreenAlarm.explainer", "So the alarm can appear on your lock screen."],
  ["9.1.1 Usage access", "permissions.usageAccess.explainer", "So we can see which app is open, never what is inside it. Used only to block apps and count night phone use."],
  ["9.1.1 Overlay", "permissions.overlay.explainer", "So we can show the 'resting' screen when you open a blocked app."],
  ["FR-BL-07", "permissions.usageAccess.refused", "Blocking is off: permissions needed"],
  // 9.11 notifications N-01 to N-07
  ["9.11 N02", "notifications.n02", "Focus complete. A new flower bloomed."],
  ["9.11 N03", "notifications.n03", "Time to start your night."],
  ["9.11 N04", "notifications.n04", "Your night is still running. Come back to keep your star."],
  ["9.11 N05", "notifications.n05", "Alarm"],
  ["9.11 N06 focus", "notifications.n06Focus", "Focus in progress"],
  ["9.11 N06 night", "notifications.n06Night", "Night in progress"],
  ["9.11 N07", "notifications.n07", "Still awake?"],
  // FR-NO-05 channel names
  ["FR-NO-05 Alarms", "notifications.channelAlarms", "Alarms"],
  ["FR-NO-05 Sessions", "notifications.channelSessions", "Sessions"],
  ["FR-NO-05 Reminders", "notifications.channelReminders", "Reminders"],
  ["FR-NO-05 Status", "notifications.channelStatus", "Status"],
  // Other exact PRD wording used on screens
  ["FR-FO-10", "focus.giveUpConfirm", "End now? Your flower will stay a bud."],
  ["FR-FO-11b", "focus.iphoneLockWarning", `Keep ${name} open. Locking your phone will count as leaving.`],
  ["FR-NI-18", "night.noAlarm", "No alarm set. Add one?"],
  ["FR-SU-02", "help.feedbackSubject", `${name} feedback`],
];

test("every PRD line (17, 9.1.1, 9.11, channels) is in en.ts word for word", () => {
  const params = { appName: name };
  for (const [where, key, expected] of prd) assert.equal(t(key, params), expected, `${where} (${key})`);
});

test("every screen S-01..S-05, S-10..S-16, S-20..S-22, S-30..S-34, S-40..S-42 has a title and its buttons", () => {
  const titles: TextKey[] = [
    "onboarding.welcomeTitle", "onboarding.howTitle", "onboarding.timesTitle", "onboarding.brandGuideTitle", "onboarding.permissionSheetTitle",
    "home.title", "focus.setupTitle", "focus.runTitle", "focus.resultTitle", "blockedApp.title", "focus.passTitle", "focus.questionTitle",
    "night.outsideTitle", "night.runTitle", "night.awakeTitle",
    "alarmRinging.title", "mission.mathsTitle", "mission.shakeTitle", "alarmList.title", "alarmEdit.title",
    "report.title", "reportDetails.title", "morningQuestion.title",
  ];
  for (const k of titles) assert.ok(t(k, { appName: name }).length > 0, k);
  const buttons: TextKey[] = [
    "onboarding.getStarted", "onboarding.howNext", "onboarding.timesSave", "onboarding.brandGuideOpenSettings", "onboarding.permissionContinue",
    "home.startFocus", "home.startNight", "focus.start", "focus.takePass", "focus.giveUp", "focus.resultAgain", "blockedApp.goBack", "blockedApp.usePass",
    "focus.passBack", "focus.questionNo", "focus.questionYes", "night.startNap", "night.changeBedtime", "night.nightPass", "night.awake",
    "night.awakeConfirm", "alarmRinging.startMission", "mission.mathsCheck", "mission.shakeSwitch", "alarmList.add", "alarmEdit.save",
    "report.done", "morningQuestion.no", "morningQuestion.yes",
  ];
  for (const k of buttons) assert.ok(t(k).length > 0, k);
});

test("the app name is never typed in en.ts; it only arrives through {appName}", () => {
  for (const [key, value] of all) assert.ok(!/WPT\s*202/i.test(value), `${key} has the app name typed in`);
  const source = fs.readFileSync(path.join(root, "src/text/en.ts"), "utf8");
  assert.ok(!/WPT\s*202/i.test(source.replace(/\/\*[\s\S]*?\*\//, "")), "en.ts mentions the app name");
});

test("a missing key warns in dev and does not crash", () => {
  const seen: string[] = [];
  const original = console.warn;
  console.warn = (m: string) => void seen.push(m);
  try {
    assert.equal(t("nope.missing" as TextKey), "nope.missing");
    assert.equal(t("focus" as TextKey), "focus"); // a group, not a sentence
    t("help.feedbackSubject"); // forgot {appName}
  } finally {
    console.warn = original;
  }
  assert.match(seen[0], /Missing text key: nope\.missing/);
  assert.match(seen[1], /Missing text key: focus/);
  assert.match(seen[2], /needs a value for \{appName\}/);
});

test("values and one/many forms fill in", () => {
  assert.equal(t("alarmRinging.snooze", { count: 2 }), "Snooze (2 left)");
  assert.equal(t("home.streak", { count: 5 }), "5 nights");
  assert.equal(t("home.streak", { count: 1 }), "1 night");
  assert.equal(t("focus.blockingCount", { count: 25 }), "Blocking: 25 apps");
  assert.equal(t("report.lowestDuration", { slept: "6 h 10 m", goal: "8 h" }), "You slept 6 h 10 m, below your 8 h goal.");
});

test("every key renders with sample values and no warning", () => {
  const sample = { appName: name, count: 2, minutes: 25, hours: 7, time: "5:00", current: 1, total: 3, slept: "6 h", goal: "8 h", duration: "30 m", points: 40, max: 50, version: "1.0" };
  const original = console.warn;
  const seen: string[] = [];
  console.warn = (m: string) => void seen.push(m);
  try {
    for (const [key] of all) t(key as TextKey, sample);
  } finally {
    console.warn = original;
  }
  assert.deepEqual(seen, []);
});

test("tone rules (PRD 8.5): no medical words, at most one '!' per screen group", () => {
  const banned = /(diagnos|insomnia|apnea|disorder|treatment)/i;
  const marks = new Map<string, number>();
  for (const [key, value] of all) {
    assert.ok(!banned.test(value), `${key} uses a medical word`);
    const group = key.split(".")[0];
    marks.set(group, (marks.get(group) ?? 0) + (value.match(/!/g) ?? []).length);
  }
  for (const [group, n] of marks) assert.ok(n <= 1, `${group} has ${n} exclamation marks`);
});

test("PRD 17 sentences appear in en.ts only, nowhere else in src (checklist step 4)", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== "__tests__" && e.name !== "node_modules") walk(full); }
      else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(full);
    }
  };
  walk(path.join(root, "src"));
  for (const [where, key, expected] of prd.filter(([w]) => w.startsWith("17"))) {
    const needle = expected.replace(name, "{appName}");
    const hits = files.filter((f) => fs.readFileSync(f, "utf8").includes(needle) || fs.readFileSync(f, "utf8").includes(expected));
    assert.deepEqual(hits.map((f) => path.relative(root, f)), ["src/text/en.ts"], `${where}: ${key}`);
  }
});

test("code scan: no on-screen text typed in src/app or src/ui; scanner catches a bad fixture", () => {
  const run = (...dirs: string[]) =>
    spawnSync("node", [path.join(root, "scripts/check-no-raw-text.mjs"), ...dirs], { cwd: root, encoding: "utf8" });
  const good = run();
  assert.equal(good.status, 0, good.stdout);
  const bad = run("scripts/__fixtures__");
  assert.equal(bad.status, 1);
  const lines = new Set(bad.stdout.split("\n").filter((l) => l.includes("BadScreen.tsx:")).map((l) => l.split(":")[1].split(" ")[0]));
  assert.ok(lines.size >= 8, `scanner caught only ${lines.size} of 8 bad lines`);
});
