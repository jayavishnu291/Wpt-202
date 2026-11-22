import type { TextStyle } from "react-native";

export const fontFamilies = {
  regular: "Nunito_400Regular",
  semiBold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extraBold: "Nunito_800ExtraBold",
} as const;

export type TextVariant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "bodyStrong"
  | "small"
  | "caption"
  | "button"
  | "timer";

export const textStyles: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fontFamilies.extraBold, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.semiBold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 20 },
  timer: {
    fontFamily: fontFamilies.bold,
    fontSize: 48,
    lineHeight: 56,
    fontVariant: ["tabular-nums"],
  },
};
