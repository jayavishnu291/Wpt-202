/**
 * Nunito typography (G3).
 *
 * Why font names instead of `fontWeight`: with a custom font, React Native does NOT
 * pick the bold file for you. Each weight is its own font file with its own name,
 * so a style says  fontFamily: fontFamilies.bold  and leaves `fontWeight` out.
 *
 * The names below must match what App.tsx loads with useFonts().
 */
import type { TextStyle } from "react-native";

export const fontFamilies = {
  regular: "Nunito_400Regular",
  semiBold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extraBold: "Nunito_800ExtraBold",
} as const;

/** The text styles a component can ask for, e.g. <AppText variant="title">. */
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

/**
 * Nunito typography scale matching W2 Design Pack & PRD 8.1–8.6:
 *  - Title: 28 px, line height 34 (bold)
 *  - Heading: 22 px, line height 28 (bold)
 *  - Body: 16 px, line height 24 (regular)
 *  - Body strong: 16 px, line height 24 (semiBold)
 *  - Small: 13 px, line height 18 (regular)
 *  - Caption: 13 px, line height 18 (regular)
 *  - Button: 16 px, line height 20 (bold)
 *  - Timer: 48 px, line height 56 (bold, tabular-nums)
 *  - Display: 28 px, line height 34 (extraBold)
 *
 * Note: Never disable font scaling (AX-01). allowFontScaling stays enabled.
 */
export const textStyles: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fontFamilies.extraBold, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.semiBold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 20 },
  timer: { fontFamily: fontFamilies.bold, fontSize: 48, lineHeight: 56, fontVariant: ["tabular-nums"] },
};
