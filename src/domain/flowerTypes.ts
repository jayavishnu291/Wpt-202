/**
 * src/domain/flowerTypes.ts
 *
 * WPT 202 - FC-6 Garden Drawing Test, Step 1
 * PRD refs: FR-GA-02, FR-GA-03, FR-GA-04
 *
 * This file only has TYPES and CONSTANTS (no drawing, no random logic).
 * It does not import React, React Native or Skia, so it is safe to use anywhere.
 */

// ---------------------------------------------------------------------------
// Fixed rules from the PRD (FR-GA-03)
// ---------------------------------------------------------------------------

/** Petal count range: 5 to 12 (FR-GA-03). */
export const PETAL_COUNT_MIN = 5;
export const PETAL_COUNT_MAX = 12;

/** Every flower has 1 or 2 leaves on its stem (FR-GA-03). */
export const LEAF_COUNT_OPTIONS = [1, 2] as const;

/** The 4 petal shapes (FR-GA-03). */
export const PETAL_SHAPES = ['round', 'pointed', 'heart', 'long'] as const;

/**
 * 12 petal colours (FR-GA-03: "curated 12-colour palette").
 * PLACEHOLDER VALUES: replace with the HTML design pack colours when provided.
 * Keep exactly 12 entries.
 */
export const PETAL_COLORS = [
  '#E8607A', // rose
  '#F28C6B', // coral
  '#F5B642', // marigold
  '#F2D45C', // butter
  '#9BCB6B', // lime
  '#6FBF9B', // mint
  '#5BB5C9', // sky
  '#6E8FE0', // cornflower
  '#9A7FE0', // lavender
  '#C77DD6', // orchid
  '#E58AB8', // pink
  '#D9534F', // poppy
] as const;

/**
 * 4 centre colours (FR-GA-03).
 * PLACEHOLDER VALUES: replace with the design pack colours when provided.
 * Keep exactly 4 entries.
 */
export const CENTER_COLORS = [
  '#7A4A21', // brown
  '#F5D76E', // gold
  '#3B2A20', // dark
  '#E8A33D', // amber
] as const;

// ---------------------------------------------------------------------------
// Size and rarity rules (FR-GA-04)
// ---------------------------------------------------------------------------

export const SIZE_CLASSES = ['small', 'medium', 'large'] as const;

/**
 * Session length in minutes decides the size:
 * under 25 = small, 25 to 59 = medium, 60 or more = large.
 */
export const MEDIUM_MIN_MINUTES = 25;
export const LARGE_MIN_MINUTES = 60;

/** Only large (60 minute) flowers can be rare: 1-in-5 chance (FR-GA-04). */
export const RARE_ONE_IN = 5;

// ---------------------------------------------------------------------------
// Types (derived from the lists above, so they can never go out of sync)
// ---------------------------------------------------------------------------

export type PetalShape = (typeof PETAL_SHAPES)[number];
export type PetalColor = (typeof PETAL_COLORS)[number];
export type CenterColor = (typeof CENTER_COLORS)[number];
export type SizeClass = (typeof SIZE_CLASSES)[number];
export type LeafCount = (typeof LEAF_COUNT_OPTIONS)[number];

/**
 * Everything needed to draw ONE flower.
 * The generator (next step) creates this from a seed.
 * Same seed + same duration must always give the same FlowerSpec (FR-GA-02).
 */
export interface FlowerSpec {
  /** The random seed this flower came from (the PRD stores this per flower). */
  seed: number;
  /** Focus session length in minutes; decides size and rarity. */
  durationMinutes: number;
  sizeClass: SizeClass;
  /** Rare = double petal layer and two colours. Only for large flowers. */
  rare: boolean;
  /** Whole number from PETAL_COUNT_MIN to PETAL_COUNT_MAX. */
  petalCount: number;
  petalShape: PetalShape;
  /** Main petal colour. */
  petalColor: PetalColor;
  /** Second petal colour. Only set when rare is true, otherwise null. */
  petalColorSecondary: PetalColor | null;
  /** True when the flower has a second (inner) petal layer. Same as rare. */
  doubleLayer: boolean;
  centerColor: CenterColor;
  leafCount: LeafCount;
}