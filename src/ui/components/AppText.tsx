/**
 * AppText: the central Text component for the app (G3).
 * Adds typography variants and theme-aware tones:
 *   variant  -> Nunito text styles (display, title, heading, body, bodyStrong, small, caption, button, timer)
 *   tone     -> Theme-aware text colours (default, muted, accent, onAccent, danger, warning)
 *
 *   <AppText variant="title">{t("home.title")}</AppText>
 *
 * Never types user-facing text itself: callers pass text from t().
 * Font scaling is always supported (AX-01: allowFontScaling stays enabled by default).
 * Long text wraps naturally and never clips.
 */
import React from "react";
import { Text } from "react-native";
import type { TextProps } from "react-native";

import { useTheme } from "../theme";
import type { TextVariant, ThemeColors } from "../theme";

export type TextTone = "default" | "muted" | "accent" | "onAccent" | "danger" | "warning";

const toneToColorName: Record<TextTone, keyof ThemeColors> = {
  default: "text",
  muted: "mutedText",
  accent: "accent",
  onAccent: "onAccent",
  danger: "danger",
  warning: "warningText",
};

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

export function AppText({ variant = "body", tone = "default", style, ...rest }: AppTextProps) {
  const { colors, text } = useTheme();

  return (
    <Text
      {...rest}
      style={[
        text[variant],
        { color: colors[toneToColorName[tone]] },
        style,
      ]}
    />
  );
}
