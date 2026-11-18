/**
 * The ONE place for the app name and company contact details (PRD 8.7, BR-LP-05).
 * Sentences in src/text/en.ts never contain the name. A screen that needs it
 * (feedback subject, About, and the two PRD lines that name the app) passes it in:
 *   t("help.feedbackSubject", { appName: appConfig.appName })
 */
export const appConfig = {
  appName: "WPT 202",
  companyName: "White Pixel Technologies",
  supportEmail: "contactus@whitepixeltechnologies.in",
  website: "www.whitepixeltechnologies.in",
} as const;
