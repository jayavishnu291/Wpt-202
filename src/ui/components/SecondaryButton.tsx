/**
 * SecondaryButton: a quieter action next to a primary one (e.g. "Later", "Cancel").
 * Same size and behaviour as PrimaryButton, but an outline instead of a fill.
 *
 *   <SecondaryButton label={t("common.later")} onPress={skip} />
 *
 * The outline uses the accent colour (borderWidth: 1.5 dp), which stands out from the
 * background by more than 3:1 in both themes (AX-07). Follows W2 button radius: 14 dp.
 * Touch area is at least 48 dp (AX-04). When pressed, it fills with the accent colour.
 */
import React from "react";
import { Pressable } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { minTouchSize, radius, spacing, useTheme } from "../theme";
import { AppText } from "./AppText";

export type SecondaryButtonProps = {
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

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: SecondaryButtonProps) {
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
          borderWidth: 1.5,
          borderColor: disabled ? colors.border : colors.accent,
          backgroundColor: pressed ? colors.accent : "transparent",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {({ pressed }) => (
        <AppText
          variant="button"
          tone={pressed ? "onAccent" : "accent"}
          style={[{ textAlign: "center" }, disabled && { color: colors.disabledText }]}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
