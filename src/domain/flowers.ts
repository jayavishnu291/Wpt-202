/**
 * src/domain/flowers.ts
 *
 * WPT 202 - FC-6 Garden Drawing Test, Step 2
 * PRD refs: FR-GA-02, FR-GA-03, FR-GA-04, AC-GA-1, AC-GA-2
 *
 * Makes a FlowerSpec from a seed. Same seed + same duration = same flower, always.
 * Pure TypeScript: no Math.random(), no React, no React Native, no Skia.
 */
import {
  CENTER_COLORS,
  LARGE_MIN_MINUTES,
  LEAF_COUNT_OPTIONS,
  MEDIUM_MIN_MINUTES,
  PETAL_COLORS,
  PETAL_COUNT_MAX,
  PETAL_COUNT_MIN,
  PETAL_SHAPES,
  RARE_ONE_IN,
} from './flowerTypes';
import type { FlowerSpec, SizeClass } from './flowerTypes';

// ---------------------------------------------------------------------------
// Seeded random number generator (mulberry32)
// ---------------------------------------------------------------------------

/** A function that gives a number from 0 (included) to 1 (not included). */
export type RandomFn = () => number;

/**
 * mulberry32: a small, fast seeded random generator.
 * Same seed = same sequence of numbers, every time, on every phone.
 */
export function createSeededRandom(seed: number): RandomFn {
  // Math.floor + ">>> 0" turns any number into a safe unsigned 32-bit integer.
  let state = Math.floor(seed) >>> 0;

  const next: RandomFn = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Throw away the first 2 numbers so nearby seeds (1000, 1001...) look unrelated.
  next();
  next();
  return next;
}

/** Whole number from min to max, both included. */
function randomInt(random: RandomFn, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/** Pick one item from a list. */
function pick<T>(random: RandomFn, items: readonly T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) {
    throw new Error('pick() needs a non-empty list');
  }
  return item;
}

// ---------------------------------------------------------------------------
// Size rule (FR-GA-04)
// ---------------------------------------------------------------------------

/** Under 25 min = small, 25 to 59 = medium, 60 or more = large. */
export function getSizeClass(durationMinutes: number): SizeClass {
  if (durationMinutes >= LARGE_MIN_MINUTES) return 'large';
  if (durationMinutes >= MEDIUM_MIN_MINUTES) return 'medium';
  return 'small';
}

// ---------------------------------------------------------------------------
// Flower generator (FR-GA-02, FR-GA-03)
// ---------------------------------------------------------------------------

/**
 * Same seed + same durationMinutes always returns exactly the same FlowerSpec.
 *
 * IMPORTANT: the random numbers are always drawn in the SAME ORDER and the SAME
 * COUNT, even when a value is not used (for example the second colour of a
 * non-rare flower). That way one rule never shifts the other values.
 * If you add new random values later, add them at the END of the list.
 */
export function generateFlower(seed: number, durationMinutes: number): FlowerSpec {
  const random = createSeededRandom(seed);

  // Draw 1 to 6: look
  const petalCount = randomInt(random, PETAL_COUNT_MIN, PETAL_COUNT_MAX);
  const petalShape = pick(random, PETAL_SHAPES);
  const petalColor = pick(random, PETAL_COLORS);
  // Second colour must be different from the first, so choose from the other 11.
  const otherColors = PETAL_COLORS.filter((color) => color !== petalColor);
  const secondaryColor = pick(random, otherColors);
  const centerColor = pick(random, CENTER_COLORS);
  const leafCount = pick(random, LEAF_COUNT_OPTIONS);

  // Draw 7: rare roll (1-in-5). Always drawn, but only counts for large flowers.
  const rareRoll = randomInt(random, 1, RARE_ONE_IN) === 1;

  const sizeClass = getSizeClass(durationMinutes);
  const rare = sizeClass === 'large' && rareRoll;

  return {
    seed,
    durationMinutes,
    sizeClass,
    rare,
    petalCount,
    petalShape,
    petalColor,
    petalColorSecondary: rare ? secondaryColor : null,
    doubleLayer: rare,
    centerColor,
    leafCount,
  };
}