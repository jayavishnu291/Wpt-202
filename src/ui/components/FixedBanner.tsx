/**
 * FixedBanner: a persistent, fixed-position warning banner (e.g. pinned to top or bottom of a screen).
 *
 *   <FixedBanner message={t("alarmList.bannerLate")} onFix={openSettings} position="top" />
 *
 * Wraps Banner with absolute/fixed positioning and elevation/z-index so it stays visible over scrollable content.
 */
import React from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { spacing } from "../theme";
import { Banner } from "./Banner";
import type { BannerProps } from "./Banner";

export type FixedBannerProps = BannerProps & {
  /** Pinned to "top" or "bottom" of parent/screen. Defaults to "top". */
  position?: "top" | "bottom";
  /** Optional top or bottom inset/offset in dp. */
  inset?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FixedBanner({
  position = "top",
  inset = spacing.md,
  containerStyle,
  style,
  ...bannerProps
}: FixedBannerProps) {
  const positionStyle: ViewStyle =
    position === "top"
      ? { position: "absolute", top: inset, left: spacing.md, right: spacing.md, zIndex: 100 }
      : { position: "absolute", bottom: inset, left: spacing.md, right: spacing.md, zIndex: 100 };

  return (
    <View pointerEvents="box-none" style={[positionStyle, containerStyle]}>
      <Banner style={style} {...bannerProps} />
    </View>
  );
}
