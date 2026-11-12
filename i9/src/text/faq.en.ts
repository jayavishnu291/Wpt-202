// I9 - [India] FAQ content
// Merge this `faq` block into src/text/en.ts (keys: faq.qN.question / faq.qN.answer).
// Rules: < 80 words, simple English, kind, no medical words, sleep numbers say "estimate",
// max one "!", say "the app", only contact: contactus@whitepixeltechnologies.in
// TODO(verify with PRD before PR): Q2 (FR-AL-13 wording), Q4 (PRD 9.5.1), Q7 ("bud" meaning, PRD 11.2), Q9 (PRD 11.2).

export const faq = {
  q1: {
    question: "Why didn't my alarm ring?",
    answer:
      "We're sorry about that. Some phones close apps in the background to save battery, and that can stop the alarm. Open Settings → Phone setup and follow the brand guide for your phone. Also check that your alarm volume is turned up. Still stuck? Write to contactus@whitepixeltechnologies.in.",
  },
  q2: {
    question: "Why can't I stop or switch off my alarm without the mission?",
    answer:
      "The alarm is there to help you get up, so it stays on until you finish the mission. A protected alarm can't be changed in the 12 hours before it rings. \"Delete all data\" and uninstalling the app are never blocked.",
  },
  q3: {
    question: "How does app blocking work? Is it on iPhone?",
    answer:
      "On Android, the app blocks the apps you choose during focus time and at night, so they are harder to open. App blocking is coming to iPhone soon.",
  },
  q4: {
    question: "What counts as using my phone at night?",
    answer:
      "Using your phone with the screen on during your night counts as phone use. Time inside a pass does not count. If you are unsure about a night, you can always email contactus@whitepixeltechnologies.in.",
  },
  q5: {
    question: "What is a pass?",
    answer:
      "A pass lets you step away without losing your session. In focus, you get one pass of up to 3 minutes; your timer pauses. At night, you get one pass of up to 5 minutes; nothing you do in that time counts as phone use.",
  },
  q6: {
    question: "What are rest nights?",
    answer:
      "A rest night is a night that doesn't break your streak. You can have 2 rest nights in any 7 sleep days. Life happens, so they give you a little room without losing your progress.",
  },
  q7: {
    question: "Why did I get a bud or a faint star?",
    answer:
      "A faint star means the estimate shows you slept 3 hours or more, but you used your phone during the night. A bud means the night didn't reach a full star. Both are gentle nudges, not a judgement. Tomorrow is a fresh start.",
  },
  q8: {
    question: "Why was I asked a question this morning?",
    answer:
      "Sometimes the app can't see your phone use, for example if the phone closed the app during the night. So the app asks you instead. Your answer helps keep your estimate fair.",
  },
  q9: {
    question: "How is my sleep score worked out?",
    answer:
      "Your sleep score is an estimate. It is based on when you slept and how much you used your phone at night. It is not medical advice and it can be a little off, so use it as a friendly guide.",
  },
  q10: {
    question: "Is my data private, and how do I delete it?",
    answer:
      "Yes. Your data stays on your phone. There is no account and no backup. To remove it, open Settings → Privacy and data → \"Delete all data\".",
  },
} as const;
