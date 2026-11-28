/**
 * Banner: a warning banner with a Fix action, e.g. "Alarms may be late"  [Fix].
 *
 *   <Banner message={t("alarmList.bannerLate")} onFix={openSettings} />
 *
 * Follows W2 Design Pack:
 *  - Background: colors.warningBackground (#FFF4D6 Day, #33290A Night)
 *  - Text: colors.warningText (#6B4E00 Day, #F5D76E Night)
 *  - Corner radius: 14 dp (radius.button)
 *  - Fix action: text-style button with underline, 48x48 min touch area, working callback
 *
 * Accessibility built in
 *  - AX-07 (never colour alone): warning indicator "!" in circle + warning text + Fix action.
 *  - AX-03: Fix button has role "button", label, and accessibilityHint repeating the message.
 *  - AX-04: Fix button touch target is at least 48x48 dp.
 *  - AX-02: warning text & button contrast is >= 7:1 in both Day and Night (passes AAA).
 *  - AX-01: scalable text; flexWrap ensures Fix moves under the message if text is enlarged.
 */
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { t } from "../../text";
import { fontFamilies, minTouchSize, radius, spacing, useTheme } from "../theme";
import { AppText } from "./AppText";

export type BannerProps = {
  /** The warning sentence. Pass text from t(). */
  message: string;
  /** Called when the person presses Fix. */
  onFix: () => void;
  /** Words on the button. Defaults to t("common.fix"). */
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const MARK_SIZE = 24;

export function Banner({
  message,
  onFix,
  actionLabel = t("common.fix"),
  style,
  testID,
}: BannerProps) {
  const { colors, text } = useTheme();

  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={[
        {
          backgroundColor: colors.warningBackground,
          borderRadius: radius.button,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 200,
        }}
      >
        <View
          // Decorative "!" mark (AX-07): meaning is not conveyed by colour alone.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: MARK_SIZE,
            height: MARK_SIZE,
            borderRadius: radius.pill,
            borderWidth: 2,
            borderColor: colors.warningText,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={[
              text.small,
              {
                color: colors.warningText,
                fontFamily: fontFamilies.bold,
                lineHeight: 18,
                textAlign: "center",
              },
            ]}
          >
            !
          </Text>
        </View>

        <AppText
          variant="body"
          style={{
            flex: 1,
            color: colors.warningText,
          }}
        >
          {message}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        accessibilityHint={message}
        onPress={onFix}
        style={({ pressed }) => [
          {
            minHeight: minTouchSize,
            minWidth: minTouchSize,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            justifyContent: "center",
            alignItems: "center",
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <Text
          style={[
            text.button,
            {
              color: colors.warningText,
              textDecorationLine: "underline",
              textAlign: "center",
            },
          ]}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
