/**
 * TimePicker: choose a time with hours and minutes. Any time is allowed: hours 0 to 23
 * and every minute 0 to 59 (no 5-minute steps).
 *
 *   const [time, setTime] = useState({ hour: 7, minute: 0 });
 *   <TimePicker value={time} onChange={setTime} label={t("alarmEdit.time")} />
 *
 * Each of Hour and Minute has a number box in the middle with a "+" button above and a
 * "-" button below. The person can tap the buttons (going past the end wraps around, so
 * 23 + 1 = 00) or type the number. A typed number that is too big, such as 27 hours, is
 * set to the largest allowed value when the box loses focus.
 *
 * Accessibility built in
 *  - AX-03: every button and box has a spoken name from en.ts ("Increase hour" ...).
 *  - AX-04: the buttons and the boxes are at least 48 dp tall and wide.
 *  - AX-07: the time is shown as digits. A focused box also gets a thicker border.
 *  - AX-01: the boxes use minWidth and wrap, so large text makes them grow, not break.
 *  - AX-06: no non-essential animations.
 *  - AX-02: digits are the main text colour on the surface colour (13:1 or better).
 */
import React, { useState } from "react";
import { TextInput, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { t } from "../../text";
import { minTouchSize, radius, spacing, useTheme } from "../theme";
import { AppText } from "./AppText";
import { SecondaryButton } from "./SecondaryButton";

export type TimeValue = {
  /** 0 to 23 */
  hour: number;
  /** 0 to 59 */
  minute: number;
};

export type TimePickerProps = {
  value: TimeValue;
  /** Called with the new time whenever the hour or the minute changes. */
  onChange: (value: TimeValue) => void;
  /** Optional caption above the picker. Pass text from t(). */
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

type TimeFieldProps = {
  value: number;
  /** Largest allowed number: 23 for hours, 59 for minutes. */
  max: number;
  label: string;
  upLabel: string;
  downLabel: string;
  onChange: (value: number) => void;
  testID?: string;
};

function TimeField({ value, max, label, upLabel, downLabel, onChange, testID }: TimeFieldProps) {
  const { colors, text } = useTheme();
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const step = (delta: number) => {
    setDraft(null);
    onChange((value + delta + max + 1) % (max + 1));
  };

  const handleChangeText = (typed: string) => {
    const digits = typed.replace(/\D/g, "").slice(0, 2);
    setDraft(digits);
    if (digits !== "" && Number(digits) <= max) onChange(Number(digits));
  };

  const finishTyping = () => {
    if (draft !== null && draft !== "") onChange(Math.min(Number(draft), max));
    setDraft(null);
    setFocused(false);
  };

  return (
    <View style={{ alignItems: "center", gap: spacing.sm }}>
      <SecondaryButton label="+" accessibilityLabel={upLabel} onPress={() => step(1)} testID={testID && `${testID}-up`} />

      <TextInput
        value={draft ?? pad2(value)}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        onBlur={finishTyping}
        onSubmitEditing={finishTyping}
        accessibilityLabel={label}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={2}
        selectTextOnFocus
        returnKeyType="done"
        testID={testID}
        style={[
          text.title,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: focused ? colors.accent : colors.controlOff,
            borderWidth: focused ? 3 : 1,
            borderRadius: radius.md,
            minWidth: 72,
            minHeight: minTouchSize + 8,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            textAlign: "center",
          },
        ]}
      />

      <SecondaryButton label="−" accessibilityLabel={downLabel} onPress={() => step(-1)} testID={testID && `${testID}-down`} />
    </View>
  );
}

export function TimePicker({ value, onChange, label, style, testID }: TimePickerProps) {
  return (
    <View testID={testID} style={[{ gap: spacing.md }, style]}>
      {label ? <AppText variant="bodyStrong">{label}</AppText> : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
        }}
      >
        <TimeField
          value={value.hour}
          max={23}
          label={t("timePicker.hour")}
          upLabel={t("timePicker.hourUp")}
          downLabel={t("timePicker.hourDown")}
          onChange={(hour) => onChange({ ...value, hour })}
          testID={testID && `${testID}-hour`}
        />

        <AppText
          variant="title"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          :
        </AppText>

        <TimeField
          value={value.minute}
          max={59}
          label={t("timePicker.minute")}
          upLabel={t("timePicker.minuteUp")}
          downLabel={t("timePicker.minuteDown")}
          onChange={(minute) => onChange({ ...value, minute })}
          testID={testID && `${testID}-minute`}
        />
      </View>
    </View>
  );
}
