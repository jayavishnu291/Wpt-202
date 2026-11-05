/**
 * src/ui/garden/GardenScene.tsx
 *
 * WPT 202 - FC-6 Garden Drawing Test, Step 6
 * PRD refs: FR-GA-01, FR-GA-03, FR-GA-04, FR-GA-05, FR-GA-07, FR-GA-08, NFR-07
 *
 * Draws a GardenLayout (flowers + four-point stars) with React Native Skia.
 * Uses only the types in flowerTypes.ts and gardenLayout.ts.
 *
 * Speed idea: all 150 flowers are recorded ONCE into a single Skia Picture
 * (a saved list of draw commands), so each frame is one cheap "replay".
 * Stars are a few batched Paths. No Math.random() anywhere.
 *
 * IMPORTANT: pass a STABLE `layout` (create it with useMemo in the parent).
 * A new layout object means the whole scene is rebuilt.
 */
import { memo, useMemo } from 'react';
import { Canvas, Path, Picture, Rect, Skia } from '@shopify/react-native-skia';
import type { SkCanvas, SkPaint, SkPath, SkPathBuilder, SkPicture } from '@shopify/react-native-skia';
import type { GardenLayout, PositionedFlower, PositionedStar } from '../../domain/gardenLayout';
import type { PetalShape } from '../../domain/flowerTypes';

// ---------------------------------------------------------------------------
// Look (PLACEHOLDER colours: replace with the HTML design pack when provided)
// ---------------------------------------------------------------------------
const SKY_COLOR = '#0B1020'; // PRD Night theme background
const GROUND_COLOR = '#10261B';
const STAR_COLOR = '#F5D76E'; // PRD star gold
const STEM_COLOR = '#4F8A4F';
const LEAF_COLOR = '#6BAA5B';

// ---------------------------------------------------------------------------
// Shape numbers
// ---------------------------------------------------------------------------
/** Petal width compared with the plain shape. Long petals are slimmer. */
const SHAPE_WIDTH: Record<PetalShape, number> = {
  round: 1,
  pointed: 0.9,
  heart: 1,
  long: 0.6,
};
const PETAL_WIDTH_MIN = 0.16; // petal half-width / petal length, many petals
const PETAL_WIDTH_MAX = 0.42; // ... few petals
const PETAL_WIDTH_BASE = 2.0; // half-width ratio = 2.0 / petalCount (then clamped)
const INNER_LAYER_SCALE = 0.6; // rare flowers: inner petal layer size
const CENTER_RATIO = 0.22; // centre disc radius / head radius
const STEM_WIDTH_RATIO = 0.09; // stem half-width / head radius
const STEM_BEND_RATIO = 0.25; // sideways curve of the stem / head radius
const LEAF_ATTACH_RATIO = 0.85; // how far down the stem the leaves start
const LEAF_LENGTH_RATIO = 0.8; // leaf length / head radius
const LEAF_WIDTH_RATIO = 0.26; // leaf half-width / leaf length
const LEAF_ANGLE = (70 * Math.PI) / 180; // leaf direction from straight up
const TWO_PI = Math.PI * 2;

/** Star brightness groups: stars with different twinklePhase get different (static) brightness. */
const STAR_OPACITIES: readonly number[] = [0.6, 0.8, 1];

// ---------------------------------------------------------------------------
// Small drawing helpers (no objects created per point)
// ---------------------------------------------------------------------------
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** A cache so each colour makes only one SkPaint. */
function createPaintCache(): (hex: string) => SkPaint {
  const cache = new Map<string, SkPaint>();
  return (hex: string): SkPaint => {
    const existing = cache.get(hex);
    if (existing !== undefined) return existing;
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color(hex));
    cache.set(hex, paint);
    return paint;
  };
}

/**
 * Adds one pointed-leaf / petal-like outline to `path`.
 * Local frame: start at (originX, originY), "v" runs outward along `angle`
 * (angle 0 = straight up), "u" runs sideways.
 */
function addPetal(
  path: SkPathBuilder,
  shape: PetalShape,
  originX: number,
  originY: number,
  angle: number,
  length: number,
  halfWidth: number,
): void {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const X = (u: number, v: number): number => originX + v * sin + u * cos;
  const Y = (u: number, v: number): number => originY - v * cos + u * sin;
  const cubic = (u1: number, v1: number, u2: number, v2: number, u3: number, v3: number): void => {
    path.cubicTo(X(u1, v1), Y(u1, v1), X(u2, v2), Y(u2, v2), X(u3, v3), Y(u3, v3));
  };
  const quad = (u1: number, v1: number, u2: number, v2: number): void => {
    path.quadTo(X(u1, v1), Y(u1, v1), X(u2, v2), Y(u2, v2));
  };

  const L = length;
  const w = halfWidth;
  path.moveTo(X(0, 0), Y(0, 0));

  switch (shape) {
    case 'round':
      cubic(-1.3 * w, 0.25 * L, -1.1 * w, 0.95 * L, 0, L);
      cubic(1.1 * w, 0.95 * L, 1.3 * w, 0.25 * L, 0, 0);
      break;
    case 'pointed':
      quad(-1.8 * w, 0.5 * L, 0, L);
      quad(1.8 * w, 0.5 * L, 0, 0);
      break;
    case 'heart':
      cubic(-1.6 * w, 0.3 * L, -1.2 * w, 1.05 * L, 0, 0.82 * L);
      cubic(1.2 * w, 1.05 * L, 1.6 * w, 0.3 * L, 0, 0);
      break;
    case 'long':
      cubic(-0.9 * w, 0.3 * L, -0.8 * w, 0.85 * L, 0, L);
      cubic(0.8 * w, 0.85 * L, 0.9 * w, 0.3 * L, 0, 0);
      break;
  }
  path.close();
}

/** A ring of petals around (cx, cy). */
function addPetalRing(
  path: SkPathBuilder,
  shape: PetalShape,
  petalCount: number,
  cx: number,
  cy: number,
  length: number,
  rotation: number,
): void {
  const halfWidth =
    length *
    clamp(PETAL_WIDTH_BASE / petalCount, PETAL_WIDTH_MIN, PETAL_WIDTH_MAX) *
    SHAPE_WIDTH[shape];
  for (let k = 0; k < petalCount; k += 1) {
    addPetal(path, shape, cx, cy, rotation + (k * TWO_PI) / petalCount, length, halfWidth);
  }
}

/** A slim curved stem from (cx, cy) down to (cx, cy + length). */
function addStem(
  path: SkPathBuilder,
  cx: number,
  cy: number,
  length: number,
  halfWidth: number,
  bend: number,
): void {
  const footY = cy + length;
  const midY = cy + length * 0.5;
  path.moveTo(cx - halfWidth, cy);
  path.quadTo(cx - halfWidth + bend, midY, cx - halfWidth, footY);
  path.lineTo(cx + halfWidth, footY);
  path.quadTo(cx + halfWidth + bend, midY, cx + halfWidth, cy);
  path.close();
}

/** A four-point star: 8 corners, alternating tip and inner corner. */
function addStar(path: SkPathBuilder, star: PositionedStar): void {
  for (let k = 0; k < 8; k += 1) {
    const radius = k % 2 === 0 ? star.outerRadius : star.innerRadius;
    const angle = -Math.PI / 2 + (k * Math.PI) / 4;
    const x = star.x + radius * Math.cos(angle);
    const y = star.y + radius * Math.sin(angle);
    if (k === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }
  path.close();
}

// ---------------------------------------------------------------------------
// One flower
// ---------------------------------------------------------------------------
function drawFlower(canvas: SkCanvas, paintFor: (hex: string) => SkPaint, item: PositionedFlower): void {
  const { flower, x, y, headRadius, stemLength } = item;

  // Look choices that need a "random" feel come from the seed, never Math.random().
  const bend = ((flower.seed % 3) - 1) * headRadius * STEM_BEND_RATIO; // -, 0 or +
  const rotation = (((flower.seed * 47) % 360) * Math.PI) / 180;

  // 1. Stem
  const stem = Skia.PathBuilder.Make();
  addStem(stem, x, y, stemLength, Math.max(0.6, headRadius * STEM_WIDTH_RATIO), bend);
  canvas.drawPath(stem.detach(), paintFor(STEM_COLOR));

  // 2. Leaves (1 or 2), starting low on the stem
  const leaves = Skia.PathBuilder.Make();
  const leafLength = headRadius * LEAF_LENGTH_RATIO;
  const leafHalfWidth = leafLength * LEAF_WIDTH_RATIO;
  const leafY = y + stemLength * LEAF_ATTACH_RATIO;
  const leafX = x + 2 * LEAF_ATTACH_RATIO * (1 - LEAF_ATTACH_RATIO) * bend; // follows the stem curve
  const leafOnRight = flower.seed % 2 === 0;
  if (flower.leafCount === 2) {
    addPetal(leaves, 'pointed', leafX, leafY, -LEAF_ANGLE, leafLength, leafHalfWidth);
    addPetal(leaves, 'pointed', leafX, leafY, LEAF_ANGLE, leafLength, leafHalfWidth);
  } else {
    addPetal(
      leaves,
      'pointed',
      leafX,
      leafY,
      leafOnRight ? LEAF_ANGLE : -LEAF_ANGLE,
      leafLength,
      leafHalfWidth,
    );
  }
  canvas.drawPath(leaves.detach(), paintFor(LEAF_COLOR));

  // 3. Outer petals
  const outer = Skia.PathBuilder.Make();
  addPetalRing(outer, flower.petalShape, flower.petalCount, x, y, headRadius, rotation);
  canvas.drawPath(outer.detach(), paintFor(flower.petalColor));

  // 4. Rare flowers: smaller inner layer in the second colour, turned half a step
  if (flower.doubleLayer) {
    const inner = Skia.PathBuilder.Make();
    addPetalRing(
      inner,
      flower.petalShape,
      flower.petalCount,
      x,
      y,
      headRadius * INNER_LAYER_SCALE,
      rotation + Math.PI / flower.petalCount,
    );
    canvas.drawPath(inner.detach(), paintFor(flower.petalColorSecondary ?? flower.petalColor));
  }

  // 5. Centre
  const center = Skia.PathBuilder.Make();
  center.addCircle(x, y, headRadius * CENTER_RATIO);
  canvas.drawPath(center.detach(), paintFor(flower.centerColor));
}

/** Records all flowers once, in layout order (first = back, last = front). */
function buildFlowerPicture(layout: GardenLayout): SkPicture {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, layout.width, layout.height));
  const paintFor = createPaintCache();
  for (const item of layout.flowers) {
    drawFlower(canvas, paintFor, item);
  }
  return recorder.finishRecordingAsPicture();
}

// ---------------------------------------------------------------------------
// Stars: a few batched paths instead of 31 separate elements
// ---------------------------------------------------------------------------
interface StarBatch {
  key: number;
  opacity: number;
  path: SkPath;
}

function buildStarBatches(stars: readonly PositionedStar[]): StarBatch[] {
  const groups = STAR_OPACITIES.length;
  const paths: SkPathBuilder[] = [];
  const counts: number[] = [];
  for (let i = 0; i < groups; i += 1) {
    paths.push(Skia.PathBuilder.Make());
    counts.push(0);
  }

  for (const star of stars) {
    const group = Math.min(groups - 1, Math.floor(star.twinklePhase * groups));
    const path = paths[group];
    if (path !== undefined) {
      addStar(path, star);
      counts[group] = (counts[group] ?? 0) + 1;
    }
  }

  const batches: StarBatch[] = [];
  for (let i = 0; i < groups; i += 1) {
    const path = paths[i];
    if (path !== undefined && (counts[i] ?? 0) > 0) {
      batches.push({ key: i, opacity: STAR_OPACITIES[i] ?? 1, path: path.detach() });
    }
  }
  return batches;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export interface GardenSceneProps {
  /** Create with createGardenLayout() inside useMemo, so the reference stays stable. */
  layout: GardenLayout;
  /**
   * True when the phone's Reduce Motion setting is on.
   * This first version has NO animation (stars are static), so both values
   * draw the same scene. The twinkle step must switch off when this is true.
   */
  reduceMotion?: boolean;
}

export const GardenScene = memo(function GardenScene({ layout }: GardenSceneProps) {
  const flowerPicture = useMemo(() => buildFlowerPicture(layout), [layout]);
  const starBatches = useMemo(() => buildStarBatches(layout.stars), [layout]);
  const canvasStyle = useMemo(
    () => ({ width: layout.width, height: layout.height }),
    [layout.width, layout.height],
  );

  return (
    <Canvas style={canvasStyle}>
      <Rect x={0} y={0} width={layout.width} height={layout.skyBottom} color={SKY_COLOR} />
      <Rect
        x={0}
        y={layout.skyBottom}
        width={layout.width}
        height={layout.height - layout.skyBottom}
        color={GROUND_COLOR}
      />
      <Picture picture={flowerPicture} />
      {starBatches.map((batch) => (
        <Path key={batch.key} path={batch.path} color={STAR_COLOR} opacity={batch.opacity} />
      ))}
    </Canvas>
  );
});
