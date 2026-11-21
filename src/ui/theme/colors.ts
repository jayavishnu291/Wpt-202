/**
 * Theme colours for the Day and Night looks (G3).
 *
 * How to read this file
 *  - Both themes use the SAME names (background, text, accent ...), so a component
 *    asks for `colors.background` and gets the right colour for the current theme.
 *  - `ThemeColors` is the list of names. If one theme forgets a name, TypeScript
 *    shows an error, so Day and Night can never drift apart.
 *  - Lines marked  // CONFIRMED  were given in the G3 task.
 *  - Lines marked  // W2         are from the Sprint 1 Design Pack (W2).
 *  - Contrast: text pairs are at least 4.5:1 and the toggle "off" colour is at
 *    least 3:1 against its background. tests/theme/colors.test.ts will check this.
 */

/** The two looks of the app. Later the real app can pick one from the night-window logic. */
export type ThemeMode = "day" | "night";

export type ThemeColors = {
  /** Screen background. */
  background: string;
  /** Cards and sheets sit on this, a little apart from the background. */
  surface: string;
  /** Card surface colour (alias to surface). */
  card: string;
  /** Main text. */
  text: string;
  /** Quieter text such as hints and captions. */
  mutedText: string;
  /** Secondary text colour (alias to mutedText). */
  textSecondary: string;
  /** The brand colour: primary button, selected items, "on" toggle. */
  accent: string;
  /** The accent colour while a primary button is being pressed (a little darker). */
  accentPressed: string;
  /** Text or icons drawn ON TOP of the accent colour (e.g. a button label). */
  onAccent: string;
  /** Thin lines around cards and secondary buttons. */
  border: string;
  /** Danger and error colour. */
  danger: string;
  /** Warning background (W2: #FFF4D6 Day, #33290A Night). */
  warningBackground: string;
  /** Warning background alias. */
  warnBg: string;
  /** Legacy banner background alias. */
  bannerBackground: string;
  /** Warning text (W2: #6B4E00 Day, #F5D76E Night). */
  warningText: string;
  /** Warning text alias. */
  warnText: string;
  /** The "off" colour of a toggle track. Must stand out from the background (3:1). */
  controlOff: string;
  /** Dark layer behind a bottom sheet. */
  overlay: string;
  /** Background of a button that cannot be pressed. */
  disabledBackground: string;
  /** Disabled background alias. */
  disabledBg: string;
  /** Text of a button that cannot be pressed. */
  disabledText: string;
};

export const dayColors: ThemeColors = {
  background: "#F7F5EF", // CONFIRMED
  surface: "#FFFFFF", // W2
  card: "#FFFFFF",
  text: "#1E2430", // CONFIRMED  text-ok: a colour code, not words
  mutedText: "#55606E", // W2
  textSecondary: "#55606E",
  accent: "#3A7D44", // CONFIRMED
  accentPressed: "#285A30", // white label on it is 8.1:1
  onAccent: "#FFFFFF", // W2
  border: "#E7E4DC", // W2
  danger: "#B3261E", // W2
  warningBackground: "#FFF4D6", // W2
  warnBg: "#FFF4D6",
  bannerBackground: "#FFF4D6",
  warningText: "#6B4E00", // W2
  warnText: "#6B4E00",
  controlOff: "#7F8491",
  overlay: "rgba(30, 36, 48, 0.45)",
  disabledBackground: "#E7E4DC", // W2
  disabledBg: "#E7E4DC",
  disabledText: "#6B7280", // W2
};

export const nightColors: ThemeColors = {
  background: "#0B1020", // CONFIRMED
  surface: "#161C30", // W2
  card: "#161C30",
  text: "#E8ECF5", // CONFIRMED  text-ok: a colour code, not words
  mutedText: "#A8B0C4", // W2
  textSecondary: "#A8B0C4",
  accent: "#F5D76E", // CONFIRMED
  accentPressed: "#D4B545", // dark label on it is 9.5:1
  onAccent: "#0B1020", // W2
  border: "#232A40", // W2
  danger: "#FF8A80", // W2
  warningBackground: "#33290A", // W2
  warnBg: "#33290A",
  bannerBackground: "#33290A",
  warningText: "#F5D76E", // W2
  warnText: "#F5D76E",
  controlOff: "#6B7390",
  overlay: "rgba(0, 0, 0, 0.6)",
  disabledBackground: "#232A40", // W2
  disabledBg: "#232A40",
  disabledText: "#8A92A6", // W2
};

export const themeColors: Record<ThemeMode, ThemeColors> = {
  day: dayColors,
  night: nightColors,
};
