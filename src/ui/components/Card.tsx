/**
 * Card: a rounded box that groups related content (e.g. "Next alarm" on Home).
 * It sits on the `surface` colour with a thin border, so it stands apart from the
 * screen background in both Day and Night without heavy shadows.
 *
 * Follows W2 Design Pack:
 *  - Corner radius: 16 dp (radius.card)
 *  - Internal padding: 16 dp (layout.cardPadding)
 *  - Background: surface
 *  - Border: 1 dp border token
 *
 *   <Card>
 *     <AppText variant="heading">{t("home.nextAlarm")}</AppText>
 *   </Card>
 */
import React from "react";
import { View } from "react-native";
import type { ViewProps } from "react-native";

import { layout, radius, useTheme } from "../theme";

export type CardProps = ViewProps;

export function Card({ style, children, ...rest }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.card,
          padding: layout.cardPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
