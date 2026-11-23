/**
 * src/ui/focus/FocusFlowerCanvas.tsx
 *
 * Skia-based drawing for the flower growth stages and circular progress ring.
 * PRD refs: FR-FO-04, FR-FO-05, FR-GA-02, FR-GA-03, FR-GA-04, FR-GA-05,
 * Tech Architecture 12.4, and W2 design pack section 7.
 */

import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { SkPath, SkPathBuilder } from '@shopify/react-native-skia';
import { generateFlower } from '../../domain/flowers';
import type { PetalShape } from '../../domain/flowerTypes';
import type { FocusStage } from '../../domain/focus';
import { colors } from '../theme/colors';
import { FocusFlowerCanvasWeb } from './FocusFlowerCanvas.web';

const STEM_COLOR = '#4E8A4F';
const LEAF_COLOR = '#6BA35C';
const SEED_COLOR = '#8A6A4F';
const BUD_BASE_COLOR = '#7FB26E';
const TWO_PI = Math.PI * 2;

const SHAPE_WIDTH: Record<PetalShape, number> = {
  round: 1,
  pointed: 0.9,
  heart: 1,
  long: 0.6,
};

function addPetal(
  path: SkPathBuilder,
  shape: PetalShape,
  originX: number,
  originY: number,
  angle: number,
  length: number,
  halfWidth: number
): void {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const X = (u: number, v: number): number => originX + v * sin + u * cos;
  const Y = (u: number, v: number): number => originY - v * cos + u * sin;

  const cubic = (
    u1: number,
    v1: number,
    u2: number,
    v2: number,
    u3: number,
    v3: number
  ): void => {
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

function addPetalRing(
  path: SkPathBuilder,
  shape: PetalShape,
  petalCount: number,
  cx: number,
  cy: number,
  length: number,
  rotation: number
): void {
  const halfWidth =
    length * Math.min(0.42, Math.max(0.16, 2.0 / petalCount)) * SHAPE_WIDTH[shape];
  for (let k = 0; k < petalCount; k += 1) {
    addPetal(path, shape, cx, cy, rotation + (k * TWO_PI) / petalCount, length, halfWidth);
  }
}

function addLeaf(
  path: SkPathBuilder,
  x: number,
  y: number,
  dir: 1 | -1,
  len: number
): void {
  path.moveTo(x, y);
  path.quadTo(x + dir * len * 0.6, y - len * 0.55, x + dir * len, y - len * 0.15);
  path.quadTo(x + dir * len * 0.55, y + len * 0.25, x, y);
  path.close();
}

export interface FocusFlowerCanvasProps {
  stage?: FocusStage;
  progress?: number; // 0 to 1
  seed: number;
  durationMinutes: number;
  size?: number;
  showRing?: boolean;
  themeMode?: 'day' | 'night';
}

type StageDrawData =
  | { type: 'seed'; path: SkPath; color: string }
  | { type: 'sprout'; stem: SkPath; leaves: SkPath; stemWidth: number }
  | {
      type: 'bud';
      stem: SkPath;
      leaves: SkPath;
      bud: SkPath;
      stemWidth: number;
      color: string;
    }
  | {
      type: 'bloom';
      stem: SkPath;
      leaves: SkPath;
      outerPetals: SkPath;
      innerPetals: SkPath | null;
      center: SkPath;
      stemWidth: number;
      petalColor: string;
      secondaryColor: string;
      centerColor: string;
    };

function FocusFlowerCanvasNative({
  stage = 'bloom',
  progress = 1,
  seed,
  durationMinutes,
  size = 240,
  showRing = false,
  themeMode = 'day',
}: FocusFlowerCanvasProps) {
  const theme = colors[themeMode];
  const cx = size / 2;
  const cy = size / 2;

  // Build the flower spec using the domain generator
  const flower = useMemo(
    () => generateFlower(seed, durationMinutes),
    [seed, durationMinutes]
  );

  // Progress ring paths (only for S-12)
  const ringPaths = useMemo(() => {
    if (!showRing) return null;
    const R = size * 0.43; // ~103.2 inside 240
    const clampedProgress = Math.max(0, Math.min(1, progress));

    const bgBuilder = Skia.PathBuilder.Make();
    bgBuilder.addCircle(cx, cy, R);
    const bgCircle = bgBuilder.detach();

    let progressArc: SkPath | null = null;
    if (clampedProgress >= 0.999) {
      const arcBuilder = Skia.PathBuilder.Make();
      arcBuilder.addCircle(cx, cy, R);
      progressArc = arcBuilder.detach();
    } else if (clampedProgress > 0.005) {
      const arcBuilder = Skia.PathBuilder.Make();
      const sweep = clampedProgress * 360;
      arcBuilder.addArc(Skia.XYWHRect(cx - R, cy - R, 2 * R, 2 * R), -90, sweep);
      progressArc = arcBuilder.detach();
    }

    return { bgCircle, progressArc };
  }, [showRing, size, cx, cy, progress]);

  // Stage paths
  const stageData = useMemo<StageDrawData>(() => {
    const scale = size / 240;

    if (stage === 'seed') {
      const b = Skia.PathBuilder.Make();
      b.addOval(
        Skia.XYWHRect(cx - 15 * scale, cy - 10 * scale, 30 * scale, 20 * scale)
      );
      return { type: 'seed', path: b.detach(), color: SEED_COLOR };
    }

    if (stage === 'sprout') {
      const stem = Skia.PathBuilder.Make();
      const bottomY = cy + 35 * scale;
      const topY = cy - 25 * scale;
      stem.moveTo(cx, bottomY);
      stem.lineTo(cx, topY);

      const leaves = Skia.PathBuilder.Make();
      addLeaf(leaves, cx, cy + 5 * scale, 1, 22 * scale);
      addLeaf(leaves, cx, cy + 5 * scale, -1, 22 * scale);

      return {
        type: 'sprout',
        stem: stem.detach(),
        leaves: leaves.detach(),
        stemWidth: 3.5 * scale,
      };
    }

    if (stage === 'bud') {
      const bottomY = cy + 45 * scale;
      const budH = 34 * scale;
      const budW = 24 * scale;
      const budTop = cy - 25 * scale;

      const stem = Skia.PathBuilder.Make();
      stem.moveTo(cx, bottomY);
      stem.lineTo(cx, budTop + budH);

      const leaves = Skia.PathBuilder.Make();
      addLeaf(leaves, cx, budTop + budH, 1, 16 * scale);
      addLeaf(leaves, cx, budTop + budH, -1, 16 * scale);

      const bud = Skia.PathBuilder.Make();
      bud.moveTo(cx, budTop);
      bud.cubicTo(
        cx + budW * 0.75,
        budTop + budH * 0.45,
        cx + budW * 0.6,
        budTop + budH,
        cx,
        budTop + budH
      );
      bud.cubicTo(
        cx - budW * 0.6,
        budTop + budH,
        cx - budW * 0.75,
        budTop + budH * 0.45,
        cx,
        budTop
      );
      bud.close();

      return {
        type: 'bud',
        stem: stem.detach(),
        leaves: leaves.detach(),
        bud: bud.detach(),
        stemWidth: 3.5 * scale,
        color: BUD_BASE_COLOR,
      };
    }

    // Stage === 'bloom'
    const headRadius = 40 * scale;
    const headY = cy - 10 * scale;
    const stemLength = 60 * scale;
    const footY = headY + stemLength;

    const stem = Skia.PathBuilder.Make();
    stem.moveTo(cx, headY);
    stem.lineTo(cx, footY);

    const leaves = Skia.PathBuilder.Make();
    const leafY = headY + stemLength * 0.65;
    addLeaf(leaves, cx, leafY, 1, 24 * scale);
    if (flower.leafCount === 2) {
      addLeaf(leaves, cx, leafY - 14 * scale, -1, 20 * scale);
    }

    const outerPetals = Skia.PathBuilder.Make();
    const rotation = (((flower.seed * 47) % 360) * Math.PI) / 180;
    addPetalRing(
      outerPetals,
      flower.petalShape,
      flower.petalCount,
      cx,
      headY,
      headRadius,
      rotation
    );

    let innerPetals: SkPath | null = null;
    if (flower.doubleLayer) {
      const inner = Skia.PathBuilder.Make();
      addPetalRing(
        inner,
        flower.petalShape,
        flower.petalCount,
        cx,
        headY,
        headRadius * 0.62,
        rotation + Math.PI / flower.petalCount
      );
      innerPetals = inner.detach();
    }

    const center = Skia.PathBuilder.Make();
    center.addCircle(cx, headY, headRadius * 0.28);

    return {
      type: 'bloom',
      stem: stem.detach(),
      leaves: leaves.detach(),
      outerPetals: outerPetals.detach(),
      innerPetals,
      center: center.detach(),
      stemWidth: 3.5 * scale,
      petalColor: flower.petalColor,
      secondaryColor: flower.petalColorSecondary ?? flower.petalColor,
      centerColor: flower.centerColor,
    };
  }, [stage, size, cx, cy, flower]);

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* S-12 Outer Progress Ring */}
        {showRing && ringPaths !== null && (
          <>
            <Path
              path={ringPaths.bgCircle}
              color={theme.border}
              style="stroke"
              strokeWidth={8}
            />
            {ringPaths.progressArc !== null && (
              <Path
                path={ringPaths.progressArc}
                color={theme.accent}
                style="stroke"
                strokeWidth={8}
                strokeCap="round"
              />
            )}
          </>
        )}

        {/* text-ok: discriminator check */}
        {stageData.type === 'seed' && (
          <Path path={stageData.path} color={stageData.color} style="fill" />
        )}

        {/* text-ok: discriminator check */}
        {stageData.type === 'sprout' && (
          <>
            <Path
              path={stageData.stem}
              color={STEM_COLOR}
              style="stroke"
              strokeWidth={stageData.stemWidth}
              strokeCap="round"
            />
            <Path path={stageData.leaves} color={LEAF_COLOR} style="fill" />
          </>
        )}

        {/* text-ok: discriminator check */}
        {stageData.type === 'bud' && (
          <>
            <Path
              path={stageData.stem}
              color={STEM_COLOR}
              style="stroke"
              strokeWidth={stageData.stemWidth}
              strokeCap="round"
            />
            <Path path={stageData.leaves} color={LEAF_COLOR} style="fill" />
            <Path path={stageData.bud} color={stageData.color} style="fill" />
          </>
        )}

        {/* text-ok: discriminator check */}
        {stageData.type === 'bloom' && (
          <>
            <Path
              path={stageData.stem}
              color={STEM_COLOR}
              style="stroke"
              strokeWidth={stageData.stemWidth}
              strokeCap="round"
            />
            <Path path={stageData.leaves} color={LEAF_COLOR} style="fill" />
            <Path
              path={stageData.outerPetals}
              color={stageData.petalColor}
              style="fill"
            />
            {stageData.innerPetals !== null && (
              <Path
                path={stageData.innerPetals}
                color={stageData.secondaryColor}
                style="fill"
              />
            )}
            <Path
              path={stageData.center}
              color={stageData.centerColor}
              style="fill"
            />
          </>
        )}
      </Canvas>
    </View>
  );
}

export function FocusFlowerCanvas(props: FocusFlowerCanvasProps) {
  if (Platform.OS === 'web') {
    return <FocusFlowerCanvasWeb {...props} />;
  }
  return <FocusFlowerCanvasNative {...props} />;
}
