/**
 * src/ui/theme.ts
 *
 * WPT 202 - App Themes (PRD 8.1)
 *
 * Day theme:
 *   Background: #F7F5EF
 *   Main text:  #1E2430
 *   Accent:     #3A7D44
 *
 * Night theme:
 *   Background: #0B1020
 *   Main text:  #E8ECF5
 *   Accent:     #F5D76E
 *
 * Text contrast is at least 4.5:1 in both themes.
 */

export interface ThemeColors {
  readonly mode: 'day' | 'night';
  readonly background: string;
  readonly surface: string;
  readonly surfaceBorder: string;
  readonly text: string;
  readonly textSoft: string;
  readonly accent: string;
  readonly accentPressed: string;
  readonly primaryButtonBg: string;
  readonly primaryButtonText: string;
  readonly secondaryButtonBg: string;
  readonly secondaryButtonBorder: string;
  readonly secondaryButtonText: string;
  readonly cardBg: string;
  readonly cardBorder: string;
  readonly starGold: string;
  readonly faintStarOpacity: number;
}

export const DAY_THEME: ThemeColors = {
  mode: 'day',
  background: '#F7F5EF',
  surface: '#FFFFFF',
  surfaceBorder: '#E6E4DC',
  text: '#1E2430',
  textSoft: '#4A5160',
  accent: '#3A7D44',
  accentPressed: '#2F6638',
  primaryButtonBg: '#3A7D44',
  primaryButtonText: '#FFFFFF',
  secondaryButtonBg: '#FFFFFF',
  secondaryButtonBorder: '#3A7D44',
  secondaryButtonText: '#3A7D44',
  cardBg: '#FFFFFF',
  cardBorder: '#E6E4DC',
  starGold: '#F5D76E',
  faintStarOpacity: 0.4,
};

export const NIGHT_THEME: ThemeColors = {
  mode: 'night',
  background: '#0B1020',
  surface: '#161F36',
  surfaceBorder: '#232D48',
  text: '#E8ECF5',
  textSoft: '#9AA4BA',
  accent: '#F5D76E',
  accentPressed: '#E5C75E',
  primaryButtonBg: '#F5D76E',
  primaryButtonText: '#0B1020',
  secondaryButtonBg: '#161F36',
  secondaryButtonBorder: '#F5D76E',
  secondaryButtonText: '#F5D76E',
  cardBg: '#161F36',
  cardBorder: '#232D48',
  starGold: '#F5D76E',
  faintStarOpacity: 0.4,
};

/** Returns the active theme colors based on day/night flag. */
export function getTheme(isNight: boolean): ThemeColors {
  return isNight ? NIGHT_THEME : DAY_THEME;
}
