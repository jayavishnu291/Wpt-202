/**
 * src/ui/focus/FocusFlowerCanvas.web.tsx
 *
 * Web-compatible SVG drawing component for the flower growth stages and circular progress ring.
 * Solves the web runtime error where CanvasKit / PathBuilder is undefined on Web,
 * while maintaining 100% identical flower geometry, stages, and progress ring visuals.
 *
 * PRD refs: FR-FO-04, FR-FO-05, FR-GA-02, FR-GA-03, FR-GA-04, FR-GA-05,
 * Tech Architecture 12.4, and W2 design pack section 7.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { generateFlower } from '../../domain/flowers';
import type { PetalShape } from '../../domain/flowerTypes';
import type { FocusStage } from '../../domain/focus';
import { colors } from '../theme/colors';

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

class SvgPathBuilder {
  private d: string = '';

  moveTo(x: number, y: number): void {
    this.d += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
  }

  lineTo(x: number, y: number): void {
    this.d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
  }

  quadTo(cx: number, cy: number, x: number, y: number): void {
    this.d += `Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }

  cubicTo(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ): void {
    this.d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }

  close(): void {
    this.d += 'Z ';
  }

  toString(): string {
    return this.d.trim();
  }
}

function addPetal(
  path: SvgPathBuilder,
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
  path: SvgPathBuilder,
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
  path: SvgPathBuilder,
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

export function FocusFlowerCanvasWeb({
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
  const scale = size / 240;

  // Build the flower spec using the domain generator
  const flower = useMemo(
    () => generateFlower(seed, durationMinutes),
    [seed, durationMinutes]
  );

  // Progress ring math
  const R = size * 0.43;
  const circumference = 2 * Math.PI * R;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  // Sprout paths
  const sproutLeavesPath = useMemo(() => {
    if (stage !== 'sprout') return '';
    const leaves = new SvgPathBuilder();
    addLeaf(leaves, cx, cy + 5 * scale, 1, 22 * scale);
    addLeaf(leaves, cx, cy + 5 * scale, -1, 22 * scale);
    return leaves.toString();
  }, [stage, cx, cy, scale]);

  // Bud paths
  const budData = useMemo(() => {
    if (stage !== 'bud') return null;
    const budH = 34 * scale;
    const budW = 24 * scale;
    const budTop = cy - 25 * scale;

    const leaves = new SvgPathBuilder();
    addLeaf(leaves, cx, budTop + budH, 1, 16 * scale);
    addLeaf(leaves, cx, budTop + budH, -1, 16 * scale);

    const bud = new SvgPathBuilder();
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
      bottomY: cy + 45 * scale,
      budTop,
      budH,
      leavesPath: leaves.toString(),
      budPath: bud.toString(),
    };
  }, [stage, cx, cy, scale]);

  // Bloom paths
  const bloomData = useMemo(() => {
    if (stage !== 'bloom') return null;
    const headRadius = 40 * scale;
    const headY = cy - 10 * scale;
    const stemLength = 60 * scale;
    const footY = headY + stemLength;

    const leaves = new SvgPathBuilder();
    const leafY = headY + stemLength * 0.65;
    addLeaf(leaves, cx, leafY, 1, 24 * scale);
    if (flower.leafCount === 2) {
      addLeaf(leaves, cx, leafY - 14 * scale, -1, 20 * scale);
    }

    const outerPetals = new SvgPathBuilder();
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

    let innerPetalsPath: string | null = null;
    if (flower.doubleLayer) {
      const inner = new SvgPathBuilder();
      addPetalRing(
        inner,
        flower.petalShape,
        flower.petalCount,
        cx,
        headY,
        headRadius * 0.62,
        rotation + Math.PI / flower.petalCount
      );
      innerPetalsPath = inner.toString();
    }

    return {
      headRadius,
      headY,
      footY,
      leavesPath: leaves.toString(),
      outerPetalsPath: outerPetals.toString(),
      innerPetalsPath,
    };
  }, [stage, cx, cy, scale, flower]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={styles.svg}
      >
        {/* S-12 Outer Progress Ring */}
        {showRing && (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={R}
              stroke={theme.border}
              strokeWidth={8}
              fill="none"
            />
            {clampedProgress > 0.005 && (
              <circle
                cx={cx}
                cy={cy}
                r={R}
                stroke={theme.accent}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )}
          </g>
        )}

        {/* text-ok: stage check */}
        {stage === 'seed' && (
          <ellipse
            cx={cx}
            cy={cy}
            rx={15 * scale}
            ry={10 * scale}
            fill={SEED_COLOR}
          />
        )}

        {/* text-ok: stage check */}
        {stage === 'sprout' && (
          <g>
            <line
              x1={cx}
              y1={cy + 35 * scale}
              x2={cx}
              y2={cy - 25 * scale}
              stroke={STEM_COLOR}
              strokeWidth={3.5 * scale}
              strokeLinecap="round"
            />
            <path d={sproutLeavesPath} fill={LEAF_COLOR} />
          </g>
        )}

        {/* text-ok: stage check */}
        {stage === 'bud' && budData !== null && (
          <g>
            <line
              x1={cx}
              y1={budData.bottomY}
              x2={cx}
              y2={budData.budTop + budData.budH}
              stroke={STEM_COLOR}
              strokeWidth={3.5 * scale}
              strokeLinecap="round"
            />
            <path d={budData.leavesPath} fill={LEAF_COLOR} />
            <path d={budData.budPath} fill={BUD_BASE_COLOR} />
          </g>
        )}

        {/* text-ok: stage check */}
        {stage === 'bloom' && bloomData !== null && (
          <g>
            <line
              x1={cx}
              y1={bloomData.headY}
              x2={cx}
              y2={bloomData.footY}
              stroke={STEM_COLOR}
              strokeWidth={3.5 * scale}
              strokeLinecap="round"
            />
            <path d={bloomData.leavesPath} fill={LEAF_COLOR} />
            <path d={bloomData.outerPetalsPath} fill={flower.petalColor} />
            {bloomData.innerPetalsPath !== null && (
              <path
                d={bloomData.innerPetalsPath}
                fill={flower.petalColorSecondary ?? flower.petalColor}
              />
            )}
            <circle
              cx={cx}
              cy={bloomData.headY}
              r={bloomData.headRadius * 0.28}
              fill={flower.centerColor}
            />
          </g>
        )}
      </svg>
    </View>
  );
}

// Default export alias for FocusFlowerCanvasWeb
export const FocusFlowerCanvas = FocusFlowerCanvasWeb;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
  },
});
