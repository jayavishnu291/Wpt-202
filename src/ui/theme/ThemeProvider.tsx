/**
 * The ThemeProvider hands the current theme (colours, text styles, sizes) to every
 * component below it. A component calls  const { colors } = useTheme();  and never
 * needs to know whether it is Day or Night.
 *
 * Who decides the mode?
 *  - Dev gallery today: a manual switch calls setMode("night").
 *  - Real app later: pass the `mode` prop, e.g. <ThemeProvider mode={isNightWindow ? "night" : "day"}>.
 *    When `mode` is given, it always wins and setMode has no effect, so one rule
 *    (the night-window logic) stays in charge.
 */
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
  /** Switch the look. Ignored while the provider is controlled by its `mode` prop. */
  setMode: (mode: ThemeMode) => void;
};

function buildTheme(mode: ThemeMode, setMode: (mode: ThemeMode) => void): Theme {
  return { mode, colors: themeColors[mode], text: textStyles, spacing, radius, layout, setMode };
}

// Safe default: a component used outside a provider still draws in Day, it never crashes.
const ThemeContext = createContext<Theme>(buildTheme("day", () => {}));

type Props = {
  children: ReactNode;
  /** Controlled mode. Leave out to let setMode / initialMode decide. */
  mode?: ThemeMode;
  /** Starting mode when `mode` is not given. Defaults to "day". */
  initialMode?: ThemeMode;
};

export function ThemeProvider({ children, mode, initialMode = "day" }: Props) {
  const [stateMode, setStateMode] = useState<ThemeMode>(initialMode);
  const activeMode = mode ?? stateMode;

  const theme = useMemo(() => buildTheme(activeMode, setStateMode), [activeMode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Read the current theme inside any component. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
