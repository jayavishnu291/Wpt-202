/**
 * BottomSheet: a panel that slides up from the bottom of the screen. Built for the S-05
 * permission explainer ("Why we ask"), but it holds any content.
 *
 * Follows W2 Design Pack:
 *  - Top corner radius: 24 dp (radius.bottomSheet)
 *  - Handle bar: 36x4 dp, radius 2 dp, centered, using border token
 *  - Scrollable content area
 *  - Modal backdrop with accessible close action
 *
 * Accessibility built in
 *  - AX-06 (reduced motion): when the phone asks for reduced motion, the sheet appears
 *    instantly ("none"). Otherwise it slides up (<400 ms).
 *  - AX-01: content scrolls inside the sheet (max 85% of screen height), so large text
 *    is never cut off.
 *  - AX-03: title is an accessible header; dark backdrop is a labelled button.
 *  - AX-02: text sits on the surface colour (13:1 or better in both themes).
 */
import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { radius, spacing, useTheme } from "../theme";
import { AppText } from "./AppText";

function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

export type BottomSheetProps = {
  /** true = shown. The screen keeps this value. */
  visible: boolean;
  /** Called when the person closes the sheet (outside tap, Back gesture, escape gesture). */
  onClose: () => void;
  /** Heading at the top of the sheet. Pass text from t(). */
  title: string;
  /** Screen-reader name for the dark area outside the sheet, e.g. t("common.cancel"). */
  closeLabel: string;
  children: ReactNode;
  testID?: string;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  closeLabel,
  children,
  testID,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const { height } = useWindowDimensions();

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={visible}
      animationType={reduceMotion ? "none" : "slide"}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        />

        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.bottomSheet,
            borderTopRightRadius: radius.bottomSheet,
            maxHeight: height * 0.85,
            paddingTop: spacing.md,
          }}
        >
          {/* Visual handle bar from W2 design pack */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginBottom: spacing.md,
            }}
          />

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.xxl,
              gap: spacing.lg,
            }}
          >
            <AppText variant="title" accessibilityRole="header">
              {title}
            </AppText>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
