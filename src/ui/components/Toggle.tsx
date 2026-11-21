/**
 * Toggle: an on/off switch with a label, e.g. "Vibration".
 *
 *   <Toggle label={t("alarmEdit.vibration")} value={on} onValueChange={setOn} />
 *
 * "Controlled" component: the screen owns the true/false value and passes it in as
 * `value`; the Toggle only reports a tap through `onValueChange(newValue)`.
 *
 * Accessibility built in
 *  - Role "switch" with a checked state, so a screen reader says "Vibration, switch, on".
 *  - The WHOLE row is the tap target and is at least 48 dp tall (AX-04).
 *  - On/off is not shown by colour alone (AX-07): the round knob sits on the right
 *    when on and on the left when off, and a tick mark is drawn on the knob when on.
 *    The drawing is hidden from screen readers; they hear "on" or "off" instead.
 *  - Track colours stand out from the background by at least 3:1 in both themes.
 *  - The knob moves instantly (no animation), respecting reduced motion (AX-06).
 */
import React from "react";
import { Pressable, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { minTouchSize, radius, spacing, useTheme } from "../theme";
import { AppText } from "./AppText";

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const KNOB_SIZE = 24;
const KNOB_GAP = (TRACK_HEIGHT - KNOB_SIZE) / 2; // 4 dp
const TICK_WIDTH = 6;
const TICK_HEIGHT = 11;
const TICK_THICKNESS = 2.5;

export type ToggleProps = {
  /** The words next to the switch. Pass text from t(). */
  label: string;
  /** true = on. The screen keeps this value. */
  value: boolean;
  /** Called with the NEW value when the person taps. */
  onValueChange: (value: boolean) => void;
  /** A disabled toggle cannot be changed and looks dimmed. */
  disabled?: boolean;
  /** Extra spoken help. */
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Toggle({
  label,
  value,
  onValueChange,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: ToggleProps) {
  const { colors } = useTheme();

  const trackColor = disabled
    ? colors.disabledBackground
    : value
      ? colors.accent
      : colors.controlOff;
  const knobColor = disabled ? colors.disabledText : value ? colors.onAccent : colors.surface;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      testID={testID}
      style={[
        {
          minHeight: minTouchSize,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      <AppText
        variant="body"
        style={[{ flex: 1, paddingRight: spacing.md }, disabled && { color: colors.disabledText }]}
      >
        {label}
      </AppText>

      <View
        // Drawing hidden from screen readers; the parent Pressable handles accessibility.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: radius.pill,
          backgroundColor: trackColor,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: radius.pill,
            backgroundColor: knobColor,
            marginLeft: value ? TRACK_WIDTH - KNOB_SIZE - KNOB_GAP : KNOB_GAP,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value ? (
            <View
              style={{
                width: TICK_WIDTH,
                height: TICK_HEIGHT,
                borderRightWidth: TICK_THICKNESS,
                borderBottomWidth: TICK_THICKNESS,
                borderColor: trackColor,
                transform: [{ rotate: "45deg" }, { translateY: -1 }],
              }}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
