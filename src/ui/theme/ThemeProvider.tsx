import React, { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { themeColors } from "./colors";
import type { ThemeColors, ThemeMode } from "./colors";
import { layout, radius, spacing } from "./tokens";
import { textStyles } from "./typography";

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  text: typeof textStyles;
  spacing: typeof spacing;
  radius: typeof radius;
  layout: typeof layout;
  setMode: (mode: ThemeMode) => void;
};

function buildTheme(mode: ThemeMode, setMode: (mode: ThemeMode) => void): Theme {
  return { mode, colors: themeColors[mode], text: textStyles, spacing, radius, layout, setMode };
}

const ThemeContext = createContext<Theme>(buildTheme("day", () => {}));

type Props = {
  children: ReactNode;
  mode?: ThemeMode;
  initialMode?: ThemeMode;
};

export function ThemeProvider({ children, mode, initialMode = "day" }: Props) {
  const [stateMode, setStateMode] = useState<ThemeMode>(initialMode);
  const activeMode = mode ?? stateMode;
  const theme = useMemo(() => buildTheme(activeMode, setStateMode), [activeMode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
