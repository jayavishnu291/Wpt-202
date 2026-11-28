/**
 * Theme colours for the Day and Night looks (G3).
 */
export type ThemeMode = "day" | "night";

export type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textSoft: string;
  mutedText: string;
  textSecondary: string;
  accent: string;
  accentPressed: string;
  onAccent: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  starGold: string;
  faintStarOpacity: number;
  border: string;
  danger: string;
  warningBackground: string;
  warnBg: string;
  bannerBackground: string;
  warningText: string;
  warnText: string;
  controlOff: string;
  overlay: string;
  disabledBackground: string;
  disabledBg: string;
  disabledText: string;
};

export const dayColors: ThemeColors = {
  background: "#F7F5EF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardBg: "#FFFFFF",
  cardBorder: "#E7E4DC",
  // text-ok: theme colour token, not on-screen text
  text: "#1E2430",
  textSoft: "#55606E",
  mutedText: "#55606E",
  textSecondary: "#55606E",
  accent: "#3A7D44",
  accentPressed: "#285A30",
  onAccent: "#FFFFFF",
  primaryButtonBg: "#3A7D44",
  primaryButtonText: "#FFFFFF",
  secondaryButtonBg: "#FFFFFF",
  secondaryButtonBorder: "#3A7D44",
  secondaryButtonText: "#3A7D44",
  starGold: "#F5D76E",
  faintStarOpacity: 0.4,
  border: "#E7E4DC",
  danger: "#B3261E",
  warningBackground: "#FFF4D6",
  warnBg: "#FFF4D6",
  bannerBackground: "#FFF4D6",
  warningText: "#6B4E00",
  warnText: "#6B4E00",
  controlOff: "#7F8491",
  overlay: "rgba(30, 36, 48, 0.45)",
  disabledBackground: "#E7E4DC",
  disabledBg: "#E7E4DC",
  disabledText: "#6B7280",
};

export const nightColors: ThemeColors = {
  background: "#0B1020",
  surface: "#161C30",
  card: "#161C30",
  cardBg: "#161C30",
  cardBorder: "#232A40",
  // text-ok: theme colour token, not on-screen text
  text: "#E8ECF5",
  textSoft: "#A8B0C4",
  mutedText: "#A8B0C4",
  textSecondary: "#A8B0C4",
  accent: "#F5D76E",
  accentPressed: "#D4B545",
  onAccent: "#0B1020",
  primaryButtonBg: "#F5D76E",
  primaryButtonText: "#0B1020",
  secondaryButtonBg: "#161C30",
  secondaryButtonBorder: "#F5D76E",
  secondaryButtonText: "#F5D76E",
  starGold: "#F5D76E",
  faintStarOpacity: 0.4,
  border: "#232A40",
  danger: "#FF8A80",
  warningBackground: "#33290A",
  warnBg: "#33290A",
  bannerBackground: "#33290A",
  warningText: "#F5D76E",
  warnText: "#F5D76E",
  controlOff: "#6B7390",
  overlay: "rgba(0, 0, 0, 0.6)",
  disabledBackground: "#232A40",
  disabledBg: "#232A40",
  disabledText: "#8A92A6",
};

export const themeColors: Record<ThemeMode, ThemeColors> = {
  day: dayColors,
  night: nightColors,
};

export function getTheme(isNight: boolean): ThemeColors {
  return isNight ? nightColors : dayColors;
}
