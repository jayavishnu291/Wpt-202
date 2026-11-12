/** One app that has an icon on the home screen (FR-BL-01). */
export type LauncherApp = {
  /** Android package name, e.g. "com.google.android.youtube". Needed to block the app. */
  packageName: string;
  /** The name the user sees under the icon. */
  label: string;
  /** Small PNG picture as a data URI ("data:image/png;base64,..."). Empty string if it could not be drawn. */
  icon: string;
};
