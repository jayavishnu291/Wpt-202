/**
 * ComponentGalleryScreen (G3): a developer-only page that shows every theme piece and
 * component, so they can be checked by eye in Day and in Night.
 *
 * How to open it: in App.tsx SHOW_COMPONENT_GALLERY is enabled in development (__DEV__).
 * It never appears in a production/release build.
 *
 * Two switches at the top:
 *  - "Night theme": manual Day/Night switch changing the whole page.
 *  - "Show Day and Night together": stacks one Day panel and one Night panel.
 *
 * All text comes from centralized en.ts via t().
 */
import React, { useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { t } from "../text";
import {
  AppText,
  Banner,
  BottomSheet,
  Card,
  ContinueButton,
  PrimaryButton,
  SecondaryButton,
  TimePicker,
  Toggle,
} from "../ui/components";
import type { TimeValue } from "../ui/components";
import { ThemeProvider, spacing, useTheme } from "../ui/theme";
import type { ThemeMode } from "../ui/theme";

const pad2 = (n: number) => String(n).padStart(2, "0");

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

/** Every component, drawn in whatever theme the nearest ThemeProvider says. */
function GalleryPanel({ heading }: { heading: string }) {
  const { colors } = useTheme();
  const [toggleOff, setToggleOff] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [time, setTime] = useState<TimeValue>({ hour: 7, minute: 0 });
  const [fixCount, setFixCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  const noop = () => {};
  const closeSheet = () => setSheetOpen(false);

  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.lg, gap: spacing.xl }}>
      <AppText variant="title" accessibilityRole="header">
        {heading}
      </AppText>

      <Section title={t("devGallery.sectionText")}>
        <AppText variant="display">{t("devGallery.sampleDisplay")}</AppText>
        <AppText variant="title">{t("devGallery.sampleTitle")}</AppText>
        <AppText variant="heading">{t("devGallery.sampleHeading")}</AppText>
        <AppText variant="body">{t("devGallery.sampleBody")}</AppText>
        <AppText variant="bodyStrong">{t("devGallery.sampleBodyStrong")}</AppText>
        <AppText variant="small">{t("devGallery.sampleSmall")}</AppText>
        <AppText variant="caption" tone="muted">
          {t("devGallery.sampleCaption")}
        </AppText>
        <AppText variant="button">{t("devGallery.sampleButton")}</AppText>
        <AppText variant="timer" tone="accent">
          {t("devGallery.sampleTimer")}
        </AppText>
      </Section>

      <Section title={t("devGallery.sectionButtons")}>
        <PrimaryButton label={t("devGallery.primary")} onPress={noop} />
        <PrimaryButton label={t("devGallery.primaryDisabled")} onPress={noop} disabled />
        <SecondaryButton label={t("devGallery.secondary")} onPress={noop} />
        <SecondaryButton label={t("devGallery.secondaryDisabled")} onPress={noop} disabled />
        <ContinueButton label={t("devGallery.continueBtn")} onPress={noop} />
      </Section>

      <Section title={t("devGallery.sectionCard")}>
        <Card>
          <AppText variant="heading">{t("devGallery.cardTitle")}</AppText>
          <AppText variant="body" tone="muted">
            {t("devGallery.cardBody")}
          </AppText>
        </Card>
      </Section>

      <Section title={t("devGallery.sectionToggle")}>
        <Card>
          <Toggle label={t("devGallery.toggleOff")} value={toggleOff} onValueChange={setToggleOff} />
          <Toggle label={t("devGallery.toggleOn")} value={toggleOn} onValueChange={setToggleOn} />
          <Toggle label={t("devGallery.toggleDisabled")} value onValueChange={noop} disabled />
        </Card>
      </Section>

      <Section title={t("devGallery.sectionTime")}>
        <Card>
          <TimePicker value={time} onChange={setTime} label={t("alarmEdit.time")} />
          <AppText variant="caption" tone="muted" style={{ textAlign: "center", marginTop: spacing.md }}>
            {t("devGallery.timeValue", { time: `${pad2(time.hour)}:${pad2(time.minute)}` })}
          </AppText>
        </Card>
      </Section>

      <Section title={t("devGallery.sectionBanner")}>
        <Banner message={t("alarmList.bannerLate")} onFix={() => setFixCount((n) => n + 1)} />
        {fixCount > 0 ? (
          <AppText variant="caption" tone="muted">
            {t("devGallery.fixPressed", { count: fixCount })}
          </AppText>
        ) : null}
      </Section>

      <Section title={t("devGallery.sectionSheet")}>
        <SecondaryButton label={t("devGallery.openSheet")} onPress={() => setSheetOpen(true)} />
        <BottomSheet
          visible={sheetOpen}
          onClose={closeSheet}
          title={t("onboarding.permissionSheetTitle")}
          closeLabel={t("onboarding.permissionNotNow")}
        >
          <AppText variant="body">{t("permissions.notifications.explainer")}</AppText>
          <PrimaryButton label={t("onboarding.permissionContinue")} onPress={closeSheet} />
          <SecondaryButton label={t("onboarding.permissionNotNow")} onPress={closeSheet} />
        </BottomSheet>
      </Section>
    </View>
  );
}

/** The page: switches on top, then one panel, or a Day panel and a Night panel. */
function GalleryPage({
  night,
  setNight,
  both,
  setBoth,
}: {
  night: boolean;
  setNight: (value: boolean) => void;
  both: boolean;
  setBoth: (value: boolean) => void;
}) {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: spacing.xxl + spacing.xl, paddingBottom: spacing.xxl }}
    >
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}>
        <AppText variant="display" accessibilityRole="header">
          {t("devGallery.screenTitle")}
        </AppText>
        <AppText variant="caption" tone="muted">
          {t("devGallery.devOnly")}
        </AppText>
        <Toggle label={t("devGallery.nightSwitch")} value={night} onValueChange={setNight} disabled={both} />
        <Toggle label={t("devGallery.bothSwitch")} value={both} onValueChange={setBoth} />
      </View>

      {both ? (
        <>
          <ThemeProvider mode="day">
            <GalleryPanel heading={t("devGallery.dayHeading")} />
          </ThemeProvider>
          <ThemeProvider mode="night">
            <GalleryPanel heading={t("devGallery.nightHeading")} />
          </ThemeProvider>
        </>
      ) : (
        <GalleryPanel heading={night ? t("devGallery.nightHeading") : t("devGallery.dayHeading")} />
      )}
    </ScrollView>
  );
}

export default function ComponentGalleryScreen() {
  const [night, setNight] = useState(false);
  const [both, setBoth] = useState(false);
  const mode: ThemeMode = night ? "night" : "day";

  return (
    <ThemeProvider mode={mode}>
      <GalleryPage night={night} setNight={setNight} both={both} setBoth={setBoth} />
    </ThemeProvider>
  );
}
