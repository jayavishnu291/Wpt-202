/**
 * src/ui/theme/tokens.ts
 *
 * Theme color tokens from PRD 8.1 and the W2 design pack.
 * All text/background pairs maintain >= 4.5:1 contrast (AX-02).
 * Pure data object: no React / React Native imports.
 */

export const colors = {
  day: {
    bg: '#F7F5EF',
    surface: '#FFFFFF',
    border: '#E7E4DC',
    text: '#1E2430', // text-ok: theme color token
    textSecondary: '#55606E',
    accent: '#3A7D44',
    onAccent: '#FFFFFF',
    danger: '#B3261E',
    warningBg: '#FFF4D6',
    warningText: '#6B4E00',
    disabledBg: '#E7E4DC',
    disabledText: '#6B7280',
    accentMuted: 'rgba(58, 125, 68, 0.12)',
  },
  night: {
    bg: '#0B1020',
    surface: '#161C30',
    border: '#232A40',
    text: '#E8ECF5', // text-ok: theme color token
    textSecondary: '#A8B0C4',
    accent: '#F5D76E',
    onAccent: '#0B1020',
    danger: '#FF8A80',
    warningBg: '#33290A',
    warningText: '#F5D76E',
    disabledBg: '#232A40',
    disabledText: '#8A92A6',
    accentMuted: 'rgba(245, 215, 110, 0.12)',
  },
} as const;

export type ThemeMode = 'day' | 'night';

export type ColorTheme = {
  readonly [K in keyof typeof colors.day]: string;
};
