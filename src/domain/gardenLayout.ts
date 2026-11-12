/**
 * src/domain/gardenLayout.ts
 *
 * WPT 202 - FC-6 Garden Drawing Test, Step 4
 * PRD refs: FR-GA-01, FR-GA-02, FR-GA-06, FR-GA-07, AC-GA-3, NFR-07
 *
 * Works out WHERE every flower and star goes, from the screen width and height.
 * It does NOT draw anything. Pure TypeScript: no React, React Native, Skia,
 * Expo Router, theme code or Math.random().
 *
 * Same width + same height + same options = exactly the same output.
 */
import { createSeededRandom, generateFlower } from './flowers';
import type { FlowerSpec, SizeClass } from './flowerTypes';

// ---------------------------------------------------------------------------
// FC-6 test values
// ---------------------------------------------------------------------------
export const FC6_FLOWER_COUNT = 150;
export const FC6_STAR_COUNT = 31;
export const FC6_FLOWER_SEED_START = 1000; // flower seeds: 1000 .. 1149
export const FC6_STAR_LAYOUT_SEED = 202;
/** Session lengths cycle: flower 0 = 10 min, 1 = 25, 2 = 45, 3 = 60, 4 = 10 ... */
export const FC6_DURATIONS: readonly number[] = [10, 25, 45, 60];

// ---------------------------------------------------------------------------
// Layout tuning numbers (change here only, nowhere else)
// ---------------------------------------------------------------------------
/** Top 40% of the scene is sky (stars), the rest is garden (flowers). */
const SKY_HEIGHT_RATIO = 0.4;
/** Empty space at left and right edges, as a fraction of width. */
const SIDE_MARGIN_RATIO = 0.04;
/** Empty space at the bottom edge, as a fraction of height. */
const BOTTOM_MARGIN_RATIO = 0.03;
/** Flower head radius = (grid cell size) x this factor. */
const HEAD_RADIUS_FACTOR: Record<SizeClass, number> = {
  small: 0.26,
  medium: 0.34,
  large: 0.42,
};
/** Space reserved below the flower head for its stem, as a multiple of the head radius. */
const STEM_LENGTH_FACTOR = 1.4;
/** How far a flower may move from its grid slot, as a fraction of the slot size. */
const FLOWER_JITTER_X = 0.3;
const FLOWER_JITTER_Y = 0.25;
/** Star size: base unit is this fraction of the width; each star is 0.8x to 1.4x the unit. */
const STAR_UNIT_RATIO = 0.025;
const STAR_MIN_SCALE = 0.8;
const STAR_MAX_SCALE = 1.4;
/** A four-point star's inner radius = outer radius x this. */
const STAR_INNER_RATIO = 0.4;
/** Number of trial positions per star; the one furthest from other stars wins. */
const STAR_CANDIDATES = 12;
/** Used only if a duration list entry is missing (should never happen). */
const FALLBACK_DURATION_MINUTES = 25;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One flower plus where to draw it. x and y are the centre of the flower HEAD. */
export interface PositionedFlower {
  /** 0 = oldest (back), higher = newer (front). Draw in array order. */
  index: number;
  flower: FlowerSpec;
  x: number;
  y: number;
  /** Radius of the flower head (petals), in screen units. */
  headRadius: number;
  /** Space reserved below the head for the stem. The stem foot is at y + stemLength. */
  stemLength: number;
}

/** One four-point star. x and y are the centre. */
export interface PositionedStar {
  id: number;
  x: number;
  y: number;
  /** Distance from centre to each of the 4 tips. */
  outerRadius: number;
  /** Distance from centre to each of the 4 inner corners. */
  innerRadius: number;
  /** Number from 0 up to 1 (not including 1): lets stars twinkle at different moments. */
  twinklePhase: number;
}

export interface GardenLayout {
  width: number;
  height: number;
  /** Sky is from 0 to skyBottom; garden is from skyBottom to height. */
  skyBottom: number;
  /** In drawing order: first = back, last = front (newest in front). */
  flowers: readonly PositionedFlower[];
  stars: readonly PositionedStar[];
}

export interface GardenLayoutOptions {
  flowerCount?: number;
  starCount?: number;
  flowerSeedStart?: number;
  starSeed?: number;
  /** Session lengths in minutes, repeated in order. Must not be empty. */
  durations?: readonly number[];
  /** Keep stars below this many units from the top (for example under a status label). */
  topInset?: number;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Keeps value between min and max. If min > max (tiny screen), uses the middle. */
function clamp(value: number, min: number, max: number): number {
  if (min > max) return (min + max) / 2;
  return Math.min(Math.max(value, min), max);
}

/**
 * Turns a flower seed into a DIFFERENT seed for its position, so a flower's
 * jitter is not linked to its petal count, colours etc.
 */
function positionSeed(flowerSeed: number): number {
  return (Math.imul(Math.floor(flowerSeed) | 0, 0x9e3779b1) ^ 0x85ebca6b) >>> 0;
}

function assertCount(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a whole number of 0 or more, got ${value}`);
  }
}

// ---------------------------------------------------------------------------
// Flowers: loose grid with seeded jitter (FR-GA-06)
// ---------------------------------------------------------------------------
function layoutFlowers(
  width: number,
  height: number,
  skyBottom: number,
  count: number,
  seedStart: number,
  durations: readonly number[],
): PositionedFlower[] {
  if (count === 0) return [];

  const marginX = width * SIDE_MARGIN_RATIO;
  const gardenTop = skyBottom;
  const gardenBottom = height - height * BOTTOM_MARGIN_RATIO;
  const usableWidth = width - 2 * marginX;
  const usableHeight = gardenBottom - gardenTop;

  // Choose columns so grid cells are roughly square, then rows to fit all flowers.
  const cols = Math.max(1, Math.round(Math.sqrt((count * usableWidth) / usableHeight)));
  const rows = Math.ceil(count / cols);

  // Cell size decides the flower size, so flowers scale with the screen.
  const unit = Math.min(usableWidth / cols, usableHeight / rows);

  // Reserve room for the biggest flower so heads and stems stay on screen.
  const largeRadius = unit * HEAD_RADIUS_FACTOR.large;
  const headTop = gardenTop + largeRadius;
  const headBottom = gardenBottom - largeRadius * STEM_LENGTH_FACTOR;
  const rowHeight = (headBottom - headTop) / rows;

  const result: PositionedFlower[] = [];

  for (let row = 0; row < rows; row += 1) {
    // Share flowers evenly between rows (for 150 flowers: rows of 10 or 11, no gaps).
    const first = Math.floor((row * count) / rows);
    const last = Math.floor(((row + 1) * count) / rows);
    const rowCount = last - first;
    const slotWidth = usableWidth / rowCount;
    const rowY = headTop + (row + 0.5) * rowHeight;

    for (let slot = 0; slot < rowCount; slot += 1) {
      const index = first + slot;
      const seed = seedStart + index;
      const duration = durations[index % durations.length] ?? FALLBACK_DURATION_MINUTES;
      const flower = generateFlower(seed, duration);

      const headRadius = unit * HEAD_RADIUS_FACTOR[flower.sizeClass];
      const stemLength = headRadius * STEM_LENGTH_FACTOR;

      // Two random numbers per flower, from its own position seed.
      const random = createSeededRandom(positionSeed(seed));
      const jitterX = (random() * 2 - 1) * FLOWER_JITTER_X * slotWidth;
      const jitterY = (random() * 2 - 1) * FLOWER_JITTER_Y * rowHeight;

      const x = clamp(
        marginX + (slot + 0.5) * slotWidth + jitterX,
        marginX + headRadius,
        width - marginX - headRadius,
      );
      const y = clamp(rowY + jitterY, gardenTop + headRadius, gardenBottom - stemLength);

      result.push({ index, flower, x, y, headRadius, stemLength });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Stars: seeded "best candidate" spread (FR-GA-07)
// ---------------------------------------------------------------------------
function layoutStars(
  width: number,
  skyBottom: number,
  topInset: number,
  count: number,
  seed: number,
): PositionedStar[] {
  const random = createSeededRandom(seed);
  const marginX = width * SIDE_MARGIN_RATIO;
  const unit = width * STAR_UNIT_RATIO;
  const maxOuter = unit * STAR_MAX_SCALE;

  const minX = marginX + maxOuter;
  const maxX = width - marginX - maxOuter;
  const minY = topInset + marginX + maxOuter;
  const maxY = skyBottom - maxOuter;
  const spanX = Math.max(0, maxX - minX);
  const spanY = Math.max(0, maxY - minY);

  if (count > 0 && (minX > maxX || minY > maxY)) {
  throw new Error(
    'Not enough space to place stars within the sky. Reduce topInset or increase screen size.'
  );
}

  const stars: PositionedStar[] = [];

  for (let id = 0; id < count; id += 1) {
    // Try a few random spots and keep the one furthest from the stars already placed.
    let bestX = minX;
    let bestY = minY;
    let bestDistance = -1;

    for (let attempt = 0; attempt < STAR_CANDIDATES; attempt += 1) {
      const candidateX = minX + random() * spanX;
      const candidateY = minY + random() * spanY;

      let nearest = Infinity;
      for (const other of stars) {
        const dx = candidateX - other.x;
        const dy = candidateY - other.y;
        nearest = Math.min(nearest, dx * dx + dy * dy);
      }

      if (nearest > bestDistance) {
        bestDistance = nearest;
        bestX = candidateX;
        bestY = candidateY;
      }
    }

    const outerRadius = unit * (STAR_MIN_SCALE + (STAR_MAX_SCALE - STAR_MIN_SCALE) * random());
    stars.push({
      id,
      x: bestX,
      y: bestY,
      outerRadius,
      innerRadius: outerRadius * STAR_INNER_RATIO,
      twinklePhase: random(),
    });
  }

  return stars;
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Creates the whole layout. Call it ONCE per screen size (for example inside
 * useMemo later), not on every frame.
 */
export function createGardenLayout(
  width: number,
  height: number,
  options: GardenLayoutOptions = {},
): GardenLayout {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`width and height must be positive numbers, got ${width} x ${height}`);
  }

  const flowerCount = options.flowerCount ?? FC6_FLOWER_COUNT;
  const starCount = options.starCount ?? FC6_STAR_COUNT;
  const flowerSeedStart = options.flowerSeedStart ?? FC6_FLOWER_SEED_START;
  const starSeed = options.starSeed ?? FC6_STAR_LAYOUT_SEED;
  const durations = options.durations ?? FC6_DURATIONS;
  const topInset = options.topInset ?? 0;

  assertCount('flowerCount', flowerCount);
  assertCount('starCount', starCount);
  if (durations.length === 0) {
    throw new Error('durations must not be empty');
  }

  const skyBottom = height * SKY_HEIGHT_RATIO;

  return {
    width,
    height,
    skyBottom,
    flowers: layoutFlowers(width, height, skyBottom, flowerCount, flowerSeedStart, durations),
    stars: layoutStars(width, skyBottom, topInset, starCount, starSeed),
  };
}