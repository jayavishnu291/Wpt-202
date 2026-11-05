/**
 * src/domain/gardenLayout.test.ts
 *
 * WPT 202 - FC-6 Garden Drawing Test
 * Run (Windows PowerShell):
 *   npx.cmd tsx src/domain/gardenLayout.test.ts
 *
 * Uses only node:assert/strict. No React, React Native, Skia or Math.random().
 * Edge-case tests (tiny screens, large topInset) report failures; they do not
 * change the implementation.
 */
import assert from 'node:assert/strict';

import {
  FC6_DURATIONS,
  FC6_FLOWER_COUNT,
  FC6_FLOWER_SEED_START,
  FC6_STAR_COUNT,
  FC6_STAR_LAYOUT_SEED,
  createGardenLayout,
} from './gardenLayout';
import type { GardenLayout } from './gardenLayout';

// ---------------------------------------------------------------------------
// Tiny test runner
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
const EPS = 1e-9;
const SCREENS: readonly (readonly [number, number])[] = [
  [360, 800],
  [393, 852],
];

function isFiniteNumber(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Throws a message naming the first flower that leaves the garden area. */
function assertFlowersInGarden(layout: GardenLayout, label: string): void {
  for (const item of layout.flowers) {
    const where = `${label}: flower ${item.index}`;
    assert.ok(item.x - item.headRadius >= -EPS, `${where} left edge outside (x=${item.x})`);
    assert.ok(
      item.x + item.headRadius <= layout.width + EPS,
      `${where} right edge outside (x=${item.x}, width=${layout.width})`,
    );
    assert.ok(
      item.y - item.headRadius >= layout.skyBottom - EPS,
      `${where} head above the garden (y=${item.y}, skyBottom=${layout.skyBottom})`,
    );
    assert.ok(
      item.y + item.stemLength <= layout.height + EPS,
      `${where} stem below the screen (y=${item.y}, stem=${item.stemLength}, height=${layout.height})`,
    );
  }
}

/** Throws a message naming the first star that leaves the sky area. */
function assertStarsInSky(layout: GardenLayout, topInset: number, label: string): void {
  for (const star of layout.stars) {
    const where = `${label}: star ${star.id}`;
    assert.ok(star.x - star.outerRadius >= -EPS, `${where} left edge outside (x=${star.x})`);
    assert.ok(
      star.x + star.outerRadius <= layout.width + EPS,
      `${where} right edge outside (x=${star.x}, width=${layout.width})`,
    );
    assert.ok(
      star.y - star.outerRadius >= topInset - EPS,
      `${where} above topInset (y=${star.y}, topInset=${topInset})`,
    );
    assert.ok(
      star.y + star.outerRadius <= layout.skyBottom + EPS,
      `${where} below the sky (y=${star.y}, skyBottom=${layout.skyBottom})`,
    );
  }
}

function assertAllFinite(layout: GardenLayout, label: string): void {
  for (const item of layout.flowers) {
    for (const value of [item.x, item.y, item.headRadius, item.stemLength]) {
      assert.ok(isFiniteNumber(value), `${label}: flower ${item.index} has a non-finite value`);
    }
  }
  for (const star of layout.stars) {
    for (const value of [star.x, star.y, star.outerRadius, star.innerRadius, star.twinklePhase]) {
      assert.ok(isFiniteNumber(value), `${label}: star ${star.id} has a non-finite value`);
    }
  }
}

console.log('Garden layout tests\n');

// ---------------------------------------------------------------------------
// 1. Default counts
// ---------------------------------------------------------------------------
test('default layout has exactly 150 flowers and 31 stars', () => {
  assert.equal(FC6_FLOWER_COUNT, 150);
  assert.equal(FC6_STAR_COUNT, 31);
  for (const [width, height] of SCREENS) {
    const layout = createGardenLayout(width, height);
    assert.equal(layout.flowers.length, 150, `${width}x${height} flowers`);
    assert.equal(layout.stars.length, 31, `${width}x${height} stars`);
    assert.equal(layout.width, width);
    assert.equal(layout.height, height);
  }
});

// ---------------------------------------------------------------------------
// 2. Determinism
// ---------------------------------------------------------------------------
test('same dimensions and options give identical output', () => {
  for (const [width, height] of SCREENS) {
    assert.deepStrictEqual(createGardenLayout(width, height), createGardenLayout(width, height));
  }
  const options = { flowerCount: 40, starCount: 12, flowerSeedStart: 77, starSeed: 9, topInset: 30 };
  assert.deepStrictEqual(
    createGardenLayout(360, 800, options),
    createGardenLayout(360, 800, options),
  );
});

test('result does not depend on earlier calls (no hidden state)', () => {
  const first = createGardenLayout(360, 800);
  createGardenLayout(411, 890);
  createGardenLayout(100, 100, { flowerCount: 5 });
  const second = createGardenLayout(360, 800);
  assert.deepStrictEqual(first, second);
});

test('different screen sizes give different positions', () => {
  const small = createGardenLayout(360, 800);
  const large = createGardenLayout(393, 852);
  assert.notDeepStrictEqual(small.flowers.map((f) => f.x), large.flowers.map((f) => f.x));
});

// ---------------------------------------------------------------------------
// 3. Indices and seeds
// ---------------------------------------------------------------------------
test('flower indices are unique, in order 0..149, with seeds 1000..1149', () => {
  assert.equal(FC6_FLOWER_SEED_START, 1000);
  const { flowers } = createGardenLayout(360, 800);
  assert.equal(new Set(flowers.map((f) => f.index)).size, 150, 'indices not unique');
  flowers.forEach((item, position) => {
    assert.equal(item.index, position, `array position ${position} has index ${item.index}`);
    assert.equal(item.flower.seed, 1000 + position, `flower ${position} has wrong seed`);
  });
});

test('newest flowers are in front: last flower is lower on screen than first', () => {
  const { flowers } = createGardenLayout(360, 800);
  const first = flowers[0];
  const last = flowers[flowers.length - 1];
  assert.ok(first !== undefined && last !== undefined);
  assert.ok(last.y > first.y, 'last flower should be nearer the bottom');
});

// ---------------------------------------------------------------------------
// 4. Durations
// ---------------------------------------------------------------------------
test('durations cycle 10, 25, 45, 60', () => {
  assert.deepStrictEqual([...FC6_DURATIONS], [10, 25, 45, 60]);
  const expected = [10, 25, 45, 60];
  const { flowers } = createGardenLayout(360, 800);
  flowers.forEach((item, position) => {
    assert.equal(item.flower.durationMinutes, expected[position % 4], `flower ${position}`);
  });
  const sizes = new Set(flowers.map((f) => f.flower.sizeClass));
  assert.equal(sizes.size, 3, 'expected small, medium and large flowers');
});

// ---------------------------------------------------------------------------
// 5. Numbers are sane
// ---------------------------------------------------------------------------
test('all coordinates are finite; radii and stem lengths are positive', () => {
  for (const [width, height] of SCREENS) {
    const layout = createGardenLayout(width, height);
    assertAllFinite(layout, `${width}x${height}`);
    for (const item of layout.flowers) {
      assert.ok(item.headRadius > 0, `flower ${item.index} headRadius not positive`);
      assert.ok(item.stemLength > 0, `flower ${item.index} stemLength not positive`);
    }
  }
});

test('larger session lengths give larger flower heads', () => {
  const { flowers } = createGardenLayout(360, 800);
  const radiusFor = (size: string): number => {
    const found = flowers.find((f) => f.flower.sizeClass === size);
    assert.ok(found !== undefined, 'no ' + size + ' flower found');
    return found.headRadius;
  };
  assert.ok(radiusFor('small') < radiusFor('medium'));
  assert.ok(radiusFor('medium') < radiusFor('large'));
});

// ---------------------------------------------------------------------------
// 6. Flowers inside the garden
// ---------------------------------------------------------------------------
test('flower heads and stems stay inside the garden (360x800 and 393x852)', () => {
  for (const [width, height] of SCREENS) {
    assertFlowersInGarden(createGardenLayout(width, height), `${width}x${height}`);
  }
});

// ---------------------------------------------------------------------------
// 7. Star geometry
// ---------------------------------------------------------------------------
test('stars have valid geometry and twinklePhase in [0, 1)', () => {
  for (const [width, height] of SCREENS) {
    const { stars } = createGardenLayout(width, height);
    assert.equal(new Set(stars.map((s) => s.id)).size, 31, 'star ids not unique');
    stars.forEach((star, position) => {
      assert.equal(star.id, position, `star at position ${position} has id ${star.id}`);
      assert.ok(star.outerRadius > 0, `star ${star.id} outerRadius not positive`);
      assert.ok(star.innerRadius > 0, `star ${star.id} innerRadius not positive`);
      assert.ok(star.innerRadius < star.outerRadius, `star ${star.id} inner not smaller than outer`);
      assert.ok(
        star.twinklePhase >= 0 && star.twinklePhase < 1,
        `star ${star.id} twinklePhase out of range: ${star.twinklePhase}`,
      );
    });
  }
});

test('star positions are not all the same and do not sit on top of each other', () => {
  const { stars } = createGardenLayout(360, 800);
  for (let i = 0; i < stars.length; i += 1) {
    for (let j = i + 1; j < stars.length; j += 1) {
      const a = stars[i];
      const b = stars[j];
      assert.ok(a !== undefined && b !== undefined);
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      assert.ok(distance > a.outerRadius, `stars ${i} and ${j} are too close (${distance})`);
    }
  }
});

// ---------------------------------------------------------------------------
// 8. Stars inside the sky
// ---------------------------------------------------------------------------
test('stars are fully inside the sky (360x800 and 393x852)', () => {
  for (const [width, height] of SCREENS) {
    assertStarsInSky(createGardenLayout(width, height), 0, `${width}x${height}`);
  }
});

test('stars and flowers use separate areas (no star below the sky line)', () => {
  const layout = createGardenLayout(360, 800);
  const lowestStar = Math.max(...layout.stars.map((s) => s.y + s.outerRadius));
  const highestFlower = Math.min(...layout.flowers.map((f) => f.y - f.headRadius));
  assert.ok(lowestStar <= highestFlower + EPS, `star bottom ${lowestStar} overlaps flower top ${highestFlower}`);
});

// ---------------------------------------------------------------------------
// 9. Custom counts and seeds
// ---------------------------------------------------------------------------
test('custom flower and star counts work', () => {
  const layout = createGardenLayout(360, 800, { flowerCount: 10, starCount: 5 });
  assert.equal(layout.flowers.length, 10);
  assert.equal(layout.stars.length, 5);
  assertAllFinite(layout, 'custom counts');
  assertFlowersInGarden(layout, 'custom counts');
  assertStarsInSky(layout, 0, 'custom counts');

  for (const count of [1, 2, 3, 7, 151, 300]) {
    const many = createGardenLayout(360, 800, { flowerCount: count, starCount: count });
    assert.equal(many.flowers.length, count, `flowerCount ${count}`);
    assert.equal(many.stars.length, count, `starCount ${count}`);
    assertFlowersInGarden(many, `count ${count}`);
  }
});

test('custom flower seed start and durations work', () => {
  const layout = createGardenLayout(360, 800, {
    flowerCount: 10,
    flowerSeedStart: 5000,
    durations: [30],
  });
  layout.flowers.forEach((item, position) => {
    assert.equal(item.flower.seed, 5000 + position);
    assert.equal(item.flower.durationMinutes, 30);
    assert.equal(item.flower.sizeClass, 'medium');
  });
});

test('custom star seed changes the stars; the same star seed repeats them', () => {
  const defaultStars = createGardenLayout(360, 800).stars;
  const sevenA = createGardenLayout(360, 800, { starSeed: 7 }).stars;
  const sevenB = createGardenLayout(360, 800, { starSeed: 7 }).stars;
  const explicitDefault = createGardenLayout(360, 800, { starSeed: FC6_STAR_LAYOUT_SEED }).stars;
  assert.notDeepStrictEqual(defaultStars, sevenA, 'seed 7 should differ from seed 202');
  assert.deepStrictEqual(sevenA, sevenB);
  assert.deepStrictEqual(defaultStars, explicitDefault);
});

test('star seed does not change flower positions', () => {
  const a = createGardenLayout(360, 800, { starSeed: 1 }).flowers;
  const b = createGardenLayout(360, 800, { starSeed: 2 }).flowers;
  assert.deepStrictEqual(a, b);
});

// ---------------------------------------------------------------------------
// 10. Zero counts
// ---------------------------------------------------------------------------
test('zero counts work', () => {
  const noFlowers = createGardenLayout(360, 800, { flowerCount: 0 });
  assert.equal(noFlowers.flowers.length, 0);
  assert.equal(noFlowers.stars.length, 31);

  const noStars = createGardenLayout(360, 800, { starCount: 0 });
  assert.equal(noStars.flowers.length, 150);
  assert.equal(noStars.stars.length, 0);

  const nothing = createGardenLayout(360, 800, { flowerCount: 0, starCount: 0 });
  assert.equal(nothing.flowers.length, 0);
  assert.equal(nothing.stars.length, 0);
  assert.equal(nothing.skyBottom, 800 * 0.4);
});

// ---------------------------------------------------------------------------
// 11. Invalid input
// ---------------------------------------------------------------------------
test('invalid width or height throws', () => {
  const bad = [0, -1, -360, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
  for (const value of bad) {
    assert.throws(() => createGardenLayout(value, 800), Error, `width ${value} should throw`);
    assert.throws(() => createGardenLayout(360, value), Error, `height ${value} should throw`);
  }
});

test('negative or fractional counts throw', () => {
  assert.throws(() => createGardenLayout(360, 800, { flowerCount: -1 }), Error);
  assert.throws(() => createGardenLayout(360, 800, { starCount: -1 }), Error);
  assert.throws(() => createGardenLayout(360, 800, { flowerCount: 1.5 }), Error);
  assert.throws(() => createGardenLayout(360, 800, { starCount: 2.5 }), Error);
  assert.throws(() => createGardenLayout(360, 800, { flowerCount: Number.NaN }), Error);
});

test('empty durations list throws', () => {
  assert.throws(() => createGardenLayout(360, 800, { durations: [] }), Error);
});

// ---------------------------------------------------------------------------
// 12. Edge cases: tiny screens and large topInset
//     These check the behaviour we WANT. A FAIL here is a finding to report,
//     not something this test file fixes.
// ---------------------------------------------------------------------------
const TINY_SCREENS: readonly (readonly [number, number])[] = [
  [200, 400],
  [100, 100],
  [50, 50],
  [20, 20],
  [1, 1],
];

test('tiny screens: no crash, correct counts, finite numbers, repeatable', () => {
  for (const [width, height] of TINY_SCREENS) {
    const layout = createGardenLayout(width, height);
    assert.equal(layout.flowers.length, 150, `${width}x${height} flowers`);
    assert.equal(layout.stars.length, 31, `${width}x${height} stars`);
    assertAllFinite(layout, `${width}x${height}`);
    assert.deepStrictEqual(layout, createGardenLayout(width, height), `${width}x${height} repeat`);
  }
});

test('tiny screens: radii and stem lengths stay positive', () => {
  for (const [width, height] of TINY_SCREENS) {
    const layout = createGardenLayout(width, height);
    for (const item of layout.flowers) {
      assert.ok(item.headRadius > 0, `${width}x${height}: flower ${item.index} headRadius`);
      assert.ok(item.stemLength > 0, `${width}x${height}: flower ${item.index} stemLength`);
    }
    for (const star of layout.stars) {
      assert.ok(star.outerRadius > 0, `${width}x${height}: star ${star.id} outerRadius`);
    }
  }
});

test('tiny screens: flowers stay inside the garden', () => {
  for (const [width, height] of TINY_SCREENS) {
    assertFlowersInGarden(createGardenLayout(width, height), `${width}x${height}`);
  }
});

test('tiny screens: stars stay inside the sky', () => {
  for (const [width, height] of TINY_SCREENS) {
    assertStarsInSky(createGardenLayout(width, height), 0, `${width}x${height}`);
  }
});

test('moderate topInset (100): stars stay between topInset and the sky line', () => {
  const layout = createGardenLayout(360, 800, { topInset: 100 });
  assert.equal(layout.stars.length, 31);
  assertAllFinite(layout, 'topInset 100');
  assertStarsInSky(layout, 100, 'topInset 100');
});

test('large topInset (300, 400, 800): rejects impossible star layouts', () => {
  for (const topInset of [300, 400, 800]) {
    assert.throws(
      () => createGardenLayout(360, 800, { topInset }),
      /Not enough space to place stars within the sky/,
      `topInset ${topInset} should throw`
    );
  }
});

test('valid topInset does not move the flowers', () => {
  const normal = createGardenLayout(360, 800).flowers;
  const inset = createGardenLayout(360, 800, { topInset: 100 }).flowers;
  assert.deepStrictEqual(normal, inset);
});
// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}