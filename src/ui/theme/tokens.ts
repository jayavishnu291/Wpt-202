/**
 * Sizes shared by every component, so spacing and shapes look the same everywhere.
 * All numbers are in dp (density-independent pixels).
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  // Scale access by number
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  48: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  button: 14,
  card: 16,
  lg: 16,
  sheet: 24,
  bottomSheet: 24,
  chip: 24,
  /** Fully rounded ends, e.g. toggles. */
  pill: 999,
} as const;

/**
 * Reusable layout tokens (G3 / W2 Design Pack).
 */
export const layout = {
  /** Screen side padding: 20 dp. */
  screenSidePadding: 20,
  /** Screen side padding alias. */
  screenPadding: 20,
  /** Section gap: 24 dp. */
  sectionGap: 24,
  /** Card internal padding: 16 dp. */
  cardPadding: 16,
  /** Button corner radius: 14 dp. */
  buttonRadius: 14,
  /** Card corner radius: 16 dp. */
  cardRadius: 16,
  /** BottomSheet top corner radius: 24 dp. */
  bottomSheetRadius: 24,
  /** Minimum touch target: 48 dp (AX-04). */
  minTouchTarget: 48,
} as const;

/**
 * Smallest height and width of anything the person can tap (PRD 8.3 / AX-04: 48 dp).
 * Components use `minHeight` / `minWidth` (never a fixed height) so that bigger
 * system text can make them taller instead of being cut off.
 */
export const minTouchSize = 48;
