/**
 * Sample screen (S-01 Welcome) proving the helper. No text is typed here: every word comes from t().
 * Day theme colours from PRD 8.1; 48 dp touch target from PRD 8.3.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "./t";

type Props = { onGetStarted: () => void };

export default function WelcomeSample({ onGetStarted }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.scene} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
      <Text accessibilityRole="header" style={styles.title}>
        {t("onboarding.welcomeTitle")}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("onboarding.getStarted")}
        onPress={onGetStarted}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t("onboarding.getStarted")}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F5EF", padding: 24, justifyContent: "space-between" },
  scene: { flex: 1 },
  title: { fontSize: 28, color: "#1E2430", marginBottom: 24 },
  button: {
    minHeight: 48, borderRadius: 12, backgroundColor: "#3A7D44",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 24,
  },
  buttonText: { fontSize: 16, color: "#FFFFFF" },
});
