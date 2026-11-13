// S-65 FAQ content (PRD 9.13.1). English only.
// Merge into src/text/en.ts under your existing key style if you keep all text there (PRD 14.4).
// Rules (PRD 8.5): kind, short, < 80 words, no medical words, "estimate" next to sleep numbers,
// "the app" (never the app name), max one "!" per answer.
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_EN: readonly FaqItem[] = [
  {
    id: "alarm-didnt-ring",
    question: "Why didn't my alarm ring?",
    answer:
      "Please check three things. First, your phone's alarm volume is up and the alarm is on. Second, on Android open Settings → Phone setup and follow the steps for your phone brand. Third, fix any permission banner on the Alarms screen. The alarm may stay quiet if the app was force-stopped or Do Not Disturb blocks alarms. Still stuck? Write to contactus@whitepixeltechnologies.in and we'll help.",
  },
  {
    id: "alarm-needs-mission",
    question: "Why can't I stop or switch off my alarm without the mission?",
    answer:
      "The alarm stops only after you finish its mission, and skipping the next alarm needs that mission too. This helps you really wake up. You are never locked in: \"Delete all data\" and uninstalling the app are never blocked.",
  },
  {
    id: "app-blocking",
    question: "How does app blocking work? Is it on iPhone?",
    answer:
      "On Android, the apps you choose show a calm \"resting\" screen when opened during focus or night. Phone, emergency calls, clock, Settings and the home screen always stay open. It needs the permissions the app asks for. App blocking is coming to iPhone soon.",
  },
  {
    id: "night-phone-use",
    question: "What counts as using my phone at night?",
    answer:
      "On Android, it counts when you use an app that isn't allowed, including the home screen, for more than 30 seconds in a row. On iPhone, it counts when you leave the app for more than 30 seconds. Calls, the alarm and its mission, the app itself, allowed apps (Android), locking your phone and passes never count.",
  },
  {
    id: "what-is-a-pass",
    question: "What is a pass?",
    answer:
      "A pass lets you step away without losing your session. In focus, you get one pass of up to 3 minutes; your timer pauses. At night, you get one pass of up to 5 minutes; nothing you do in that time counts as phone use.",
  },
  {
    id: "rest-nights",
    question: "What are rest nights?",
    answer:
      "Rest nights are a gentle safety net. If a night ends with a faint star, or a day has no night, the app uses a rest night, so your streak stays the same. You get two rest nights in any seven sleep days. They start once your streak is at least 1.",
  },
  {
    id: "bud-or-faint-star",
    question: "Why did I get a bud or a faint star?",
    answer:
      "A bud is a focus flower that ended early, for example you left the app, gave up, or said you used other apps. A faint star means you slept 3 hours or more (estimate) but used your phone. Under 3 hours doesn't earn a star. Tomorrow is a fresh sky.",
  },
  {
    id: "morning-question",
    question: "Why was I asked a question this morning?",
    answer:
      "Sometimes the app can't see what happened, for example when the phone closed it while you slept or focused. So it asks one simple question to keep your result fair. There's no blame, and a quick honest answer is all it needs.",
  },
  {
    id: "sleep-score",
    question: "How is my sleep score worked out?",
    answer:
      "Your sleep score is an estimate from 0 to 100, not a medical measurement. It looks at four things: how long you slept compared with your goal (estimate), how close you started to your usual bedtime, how phone-free your night was, and how you woke up. It's just a gentle guide.",
  },
  {
    id: "privacy-and-delete",
    question: "Is my data private, and how do I delete it?",
    answer:
      "Yes. Your data stays on your phone. No account is needed, nothing is backed up elsewhere, and nothing is sent to us unless you choose to email. To delete it, open Settings → Privacy and data → \"Delete all data\" and confirm twice.",
  },
];