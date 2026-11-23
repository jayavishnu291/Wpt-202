/**
 * src/ui/theme/colors.ts
 *
 * Theme color tokens and hooks from PRD 8.1 and the W2 design pack.
 * All text/background pairs maintain >= 4.5:1 contrast (AX-02).
 */

import { useColorScheme } from 'react-native';
import { colors, ColorTheme, ThemeMode } from './tokens';

export { colors, ColorTheme, ThemeMode };

export interface ThemeState {
  colors: ColorTheme;
  mode: ThemeMode;
  isNight: boolean;
}

export function getThemeColors(mode: ThemeMode = 'day'): ColorTheme {
  return colors[mode];
}

export function useTheme(modeOverride?: ThemeMode): ThemeState {
  const scheme = useColorScheme();
  const mode: ThemeMode = modeOverride ?? (scheme === 'dark' ? 'night' : 'day');
  return {
    colors: colors[mode],
    mode,
    isNight: mode === 'night',
  };
}

export function useDayTheme(): ThemeState {
  return useTheme('day');
}

export function useThemeColors(modeOverride?: ThemeMode): ColorTheme {
  return useTheme(modeOverride).colors;
}
