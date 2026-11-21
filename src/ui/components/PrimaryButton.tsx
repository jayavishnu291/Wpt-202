/**
 * PrimaryButton: the main action on a screen (e.g. "Start focus"). Filled with the accent colour.
 *
 *   <PrimaryButton label={t("home.startFocus")} onPress={start} />
 *
 * Words come from the caller (from t()); this file types none.
 *
 * Accessibility built in
 *  - Role "button" and a disabled state, so a screen reader says "button, dimmed".
 *  - At least 48 dp tall and wide (minHeight / minWidth, not a fixed height, so bigger
 *    system text makes the button taller instead of cutting the label).
 *  - Follows W2 button corner radius: 14 dp (radius.button).
 *  - Pressed feedback is a darker fill with the same readable label, with no movement.
 *  - Label colour has at least 4.5:1 contrast on the accent in both themes (AX-02).
 */
import React from "react";
import { Pressable } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { minTouchSize, radius, spacing, useTheme } from "../theme";
import { AppText } from "./AppText";

export type PrimaryButtonProps = {
  /** The words on the button. Pass text from t(). */
  label: string;
  onPress: () => void;
  /** A disabled button cannot be pressed and looks dimmed. */
  disabled?: boolean;
  /** Read by screen readers. Defaults to the label, so usually leave it out. */
  accessibilityLabel?: string;
  /** Extra spoken help, e.g. what happens after pressing. */
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: PrimaryButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        {
          minHeight: minTouchSize,
          minWidth: minTouchSize,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: radius.button,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: disabled
            ? colors.disabledBackground
            : pressed
              ? colors.accentPressed
              : colors.accent,
        },
        style,
      ]}
    >
      <AppText
        variant="button"
        tone="onAccent"
        style={[{ textAlign: "center" }, disabled && { color: colors.disabledText }]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
