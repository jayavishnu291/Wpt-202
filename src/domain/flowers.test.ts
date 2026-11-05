/**
 * src/domain/flowers.test.ts
 *
 * WPT 202 - FC-6 Garden Drawing Test, Step 3
 * PRD refs: FR-GA-02, FR-GA-03, FR-GA-04, AC-GA-1, AC-GA-2
 *
 * Run (Windows PowerShell):
 *   npx.cmd tsx src/domain/flowers.test.ts
 *
 * Uses only Node's built-in assert. No React, React Native, Skia or Math.random().
 */
import assert from 'node:assert/strict';

import {
  CENTER_COLORS,
  LEAF_COUNT_OPTIONS,
  PETAL_COLORS,
  PETAL_COUNT_MAX,
  PETAL_COUNT_MIN,
  PETAL_SHAPES,
} from './flowerTypes';
import type { FlowerSpec } from './flowerTypes';
import { createSeededRandom, generateFlower, getSizeClass } from './flowers';

// ---------------------------------------------------------------------------
// Tiny test runner (prints PASS / FAIL, exit code 1 if anything fails)
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function test(name: string, run: () => void): void {
  try {
    run();
    passed += 1;
    console.log('  PASS  ' + name);
  } catch (error) {
    failed += 1;
    console.log('  FAIL  ' + name);
    console.log('        ' + (error instanceof Error ? error.message : String(error)));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ALL_DURATIONS = [10, 24, 25, 45, 59, 60, 90] as const;
const SMALL_AND_MEDIUM_DURATIONS = [10, 24, 25, 45, 59] as const;

function isOneOf(list: readonly (string | number)[], value: string | number): boolean {
  return list.includes(value);
}

/** Checks every rule that must be true for ANY flower. */
function assertValidSpec(flower: FlowerSpec): void {
  assert.ok(
    Number.isInteger(flower.petalCount) &&
      flower.petalCount >= PETAL_COUNT_MIN &&
      flower.petalCount <= PETAL_COUNT_MAX,
    'bad petalCount: ' + flower.petalCount,
  );
  assert.ok(isOneOf(PETAL_SHAPES, flower.petalShape), 'bad petalShape: ' + flower.petalShape);
  assert.ok(isOneOf(PETAL_COLORS, flower.petalColor), 'bad petalColor: ' + flower.petalColor);
  assert.ok(isOneOf(CENTER_COLORS, flower.centerColor), 'bad centerColor: ' + flower.centerColor);
  assert.ok(isOneOf(LEAF_COUNT_OPTIONS, flower.leafCount), 'bad leafCount: ' + flower.leafCount);

  if (flower.rare) {
    assert.equal(flower.doubleLayer, true, 'rare flower must have doubleLayer true');
    assert.notEqual(flower.petalColorSecondary, null, 'rare flower needs a secondary colour');
    assert.ok(
      flower.petalColorSecondary !== null && isOneOf(PETAL_COLORS, flower.petalColorSecondary),
      'secondary colour must be in PETAL_COLORS',
    );
    assert.notEqual(
      flower.petalColorSecondary,
      flower.petalColor,
      'secondary colour must differ from the main colour',
    );
    assert.equal(flower.sizeClass, 'large', 'only large flowers can be rare');
  } else {
    assert.equal(flower.doubleLayer, false, 'non-rare flower must have doubleLayer false');
    assert.equal(flower.petalColorSecondary, null, 'non-rare flower must have null secondary');
  }
}

/** Makes flowers for seeds from..to-1 at a given duration. */
function makeFlowers(fromSeed: number, toSeed: number, durationMinutes: number): FlowerSpec[] {
  const flowers: FlowerSpec[] = [];
  for (let seed = fromSeed; seed < toSeed; seed += 1) {
    flowers.push(generateFlower(seed, durationMinutes));
  }
  return flowers;
}

console.log('Flower generator tests\n');

// ---------------------------------------------------------------------------
// 1. Determinism (FR-GA-02, AC-GA-2)
// ---------------------------------------------------------------------------
test('same seed + same duration gives exactly the same FlowerSpec', () => {
  for (let seed = 0; seed < 300; seed += 1) {
    for (const duration of ALL_DURATIONS) {
      assert.deepStrictEqual(
        generateFlower(seed, duration),
        generateFlower(seed, duration),
        `seed ${seed}, duration ${duration} changed between calls`,
      );
    }
  }
});

test('result does not depend on what was generated before (no hidden state)', () => {
  const first = generateFlower(42, 60);
  makeFlowers(0, 500, 60); // generate lots of other flowers in between
  const second = generateFlower(42, 60);
  assert.deepStrictEqual(first, second);
});

test('createSeededRandom repeats its numbers for the same seed', () => {
  const a = createSeededRandom(123);
  const b = createSeededRandom(123);
  for (let i = 0; i < 100; i += 1) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1, 'random number out of range: ' + x);
  }
});

// ---------------------------------------------------------------------------
// 2. Variation (AC-GA-1)
// ---------------------------------------------------------------------------
test('different seeds give variation in count, shape, colours and leaves', () => {
  const flowers = makeFlowers(1000, 1150, 25);
  const counts = new Set(flowers.map((f) => f.petalCount));
  const shapes = new Set(flowers.map((f) => f.petalShape));
  const petalColors = new Set(flowers.map((f) => f.petalColor));
  const centerColors = new Set(flowers.map((f) => f.centerColor));
  const leaves = new Set(flowers.map((f) => f.leafCount));

  assert.equal(counts.size, PETAL_COUNT_MAX - PETAL_COUNT_MIN + 1, 'not all petal counts appeared');
  assert.equal(shapes.size, PETAL_SHAPES.length, 'not all petal shapes appeared');
  assert.equal(petalColors.size, PETAL_COLORS.length, 'not all petal colours appeared');
  assert.equal(centerColors.size, CENTER_COLORS.length, 'not all centre colours appeared');
  assert.equal(leaves.size, LEAF_COUNT_OPTIONS.length, 'not all leaf counts appeared');
});

test('most flowers in a set of 150 look different from each other', () => {
  const flowers = makeFlowers(1000, 1150, 25);
  const looks = new Set(
    flowers.map((f) =>
      [f.petalCount, f.petalShape, f.petalColor, f.centerColor, f.leafCount].join('|'),
    ),
  );
  // A few identical looks are possible by chance, but not many.
  assert.ok(looks.size > 100, 'too many identical flowers: only ' + looks.size + ' different');
});

// ---------------------------------------------------------------------------
// 3. Value ranges and palettes (FR-GA-03)
// ---------------------------------------------------------------------------
test('petal count is a whole number from 5 to 12', () => {
  for (const flower of makeFlowers(0, 1000, 25)) {
    assert.ok(Number.isInteger(flower.petalCount), 'not a whole number');
    assert.ok(flower.petalCount >= 5 && flower.petalCount <= 12, 'out of range');
  }
});

test('petal shapes belong to PETAL_SHAPES', () => {
  for (const flower of makeFlowers(0, 1000, 25)) {
    assert.ok(isOneOf(PETAL_SHAPES, flower.petalShape), 'bad shape: ' + flower.petalShape);
  }
});

test('petal colours and centre colours belong to their palettes', () => {
  for (const flower of makeFlowers(0, 1000, 25)) {
    assert.ok(isOneOf(PETAL_COLORS, flower.petalColor), 'bad petal colour: ' + flower.petalColor);
    assert.ok(isOneOf(CENTER_COLORS, flower.centerColor), 'bad centre colour: ' + flower.centerColor);
  }
});

test('leaf count is 1 or 2', () => {
  for (const flower of makeFlowers(0, 1000, 25)) {
    assert.ok(flower.leafCount === 1 || flower.leafCount === 2, 'bad leafCount');
  }
});

test('palettes have the sizes the PRD asks for (4 shapes, 12 petal, 4 centre)', () => {
  assert.equal(PETAL_SHAPES.length, 4);
  assert.equal(PETAL_COLORS.length, 12);
  assert.equal(CENTER_COLORS.length, 4);
  assert.equal(new Set(PETAL_COLORS).size, 12, 'petal colours must be all different');
  assert.equal(new Set(CENTER_COLORS).size, 4, 'centre colours must be all different');
});

// ---------------------------------------------------------------------------
// 4. Size boundaries (FR-GA-04)
// ---------------------------------------------------------------------------
test('getSizeClass boundaries: 10, 24, 25, 59, 60, 90', () => {
  assert.equal(getSizeClass(10), 'small');
  assert.equal(getSizeClass(24), 'small');
  assert.equal(getSizeClass(25), 'medium');
  assert.equal(getSizeClass(59), 'medium');
  assert.equal(getSizeClass(60), 'large');
  assert.equal(getSizeClass(90), 'large');
});

test('generateFlower stores the right sizeClass, seed and duration', () => {
  const expected: [number, 'small' | 'medium' | 'large'][] = [
    [10, 'small'],
    [24, 'small'],
    [25, 'medium'],
    [59, 'medium'],
    [60, 'large'],
    [90, 'large'],
  ];
  for (const [duration, sizeClass] of expected) {
    const flower = generateFlower(7, duration);
    assert.equal(flower.sizeClass, sizeClass, `duration ${duration}`);
    assert.equal(flower.durationMinutes, duration);
    assert.equal(flower.seed, 7);
  }
});

// ---------------------------------------------------------------------------
// 5. Rarity (FR-GA-04)
// ---------------------------------------------------------------------------
test('flowers below 60 minutes are never rare', () => {
  for (const duration of SMALL_AND_MEDIUM_DURATIONS) {
    for (const flower of makeFlowers(0, 2000, duration)) {
      assert.equal(flower.rare, false, `seed ${flower.seed}, duration ${duration} was rare`);
    }
  }
});

test('rare flowers have doubleLayer and a different secondary colour', () => {
  let rareFound = 0;
  for (const duration of [60, 90]) {
    for (const flower of makeFlowers(0, 2000, duration)) {
      if (flower.rare) {
        rareFound += 1;
        assert.equal(flower.doubleLayer, true);
        assert.notEqual(flower.petalColorSecondary, null);
        assert.notEqual(flower.petalColorSecondary, flower.petalColor);
        assert.ok(
          flower.petalColorSecondary !== null && isOneOf(PETAL_COLORS, flower.petalColorSecondary),
          'secondary colour not in palette',
        );
      }
    }
  }
  // Guard: if no rare flower was found, this test would prove nothing.
  assert.ok(rareFound > 0, 'no rare flowers found, the test checked nothing');
});

test('non-rare flowers have doubleLayer false and no secondary colour', () => {
  let nonRareFound = 0;
  for (const duration of ALL_DURATIONS) {
    for (const flower of makeFlowers(0, 1000, duration)) {
      if (!flower.rare) {
        nonRareFound += 1;
        assert.equal(flower.doubleLayer, false);
        assert.equal(flower.petalColorSecondary, null);
      }
    }
  }
  assert.ok(nonRareFound > 0, 'no non-rare flowers found, the test checked nothing');
});

test('about 20% of 60-minute and 90-minute flowers are rare (17% to 23%)', () => {
  const sampleSize = 10000;
  for (const duration of [60, 90]) {
    let rareCount = 0;
    for (const flower of makeFlowers(0, sampleSize, duration)) {
      if (flower.rare) rareCount += 1;
    }
    const rate = rareCount / sampleSize;
    assert.ok(
      rate >= 0.17 && rate <= 0.23,
      `duration ${duration}: rare rate ${(rate * 100).toFixed(1)}% is outside 17% to 23%`,
    );
  }
});

// ---------------------------------------------------------------------------
// 6. The 150-flower set used by the FC-6 test screen (seeds 1000..1149)
// ---------------------------------------------------------------------------
test('150 flowers: all valid and exactly repeatable', () => {
  const durations = [10, 25, 45, 60];
  const build = (): FlowerSpec[] =>
    Array.from({ length: 150 }, (_, i) =>
      generateFlower(1000 + i, durations[i % durations.length] ?? 25),
    );

  const first = build();
  const second = build();

  assert.equal(first.length, 150);
  for (const flower of first) {
    assertValidSpec(flower);
  }
  assert.deepStrictEqual(first, second, 'two builds of the 150 flowers were not identical');

  // All three size classes should appear in the test set.
  const sizes = new Set(first.map((f) => f.sizeClass));
  assert.equal(sizes.size, 3, 'expected small, medium and large in the 150-flower set');
});

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}