/**
 * ContinueButton: a prominent primary action used for flow continuation (e.g. S-01 Welcome, S-05 Permissions, Onboarding).
 * Wraps PrimaryButton with full-width layout by default and defaults to t("common.continue") ("Continue").
 *
 *   <ContinueButton onPress={handleContinue} />
 *   <ContinueButton label={t("common.continue")} onPress={handleContinue} />
 *
 * Accessibility built in:
 *  - Role "button" and disabled state for screen readers.
 *  - Minimum 48x48 dp touch target (AX-04).
 *  - 14 dp corner radius (radius.button).
 *  - Label contrast >= 4.5:1 on accent fill (AX-02).
 */
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { t } from "../../text";
import { PrimaryButton } from "./PrimaryButton";

export type ContinueButtonProps = {
  /** Callback when the button is pressed. */
  onPress: () => void;
  /** Button label. Defaults to t("common.continue"). */
  label?: string;
  /** A disabled button cannot be pressed and looks dimmed. */
  disabled?: boolean;
  /** Read by screen readers. Defaults to label. */
  accessibilityLabel?: string;
  /** Extra spoken help. */
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function ContinueButton({
  onPress,
  label = t("common.continue"),
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ContinueButtonProps) {
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      style={[{ width: "100%", alignSelf: "stretch" }, style]}
      testID={testID}
    />
  );
}
