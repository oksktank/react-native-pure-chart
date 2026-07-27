import type { PieSliceDatum } from '../types';

const TWO_PI = Math.PI * 2;

/**
 * One renderable slice piece. Angles are radians, measured clockwise from
 * 12 o'clock. `sweep` is guaranteed ≤ π (larger slices are split at the data
 * level — the legacy code split them recursively inside render instead).
 */
export interface SlicePiece {
  /** Index into the original `data` array (split pieces share it). */
  dataIndex: number;
  startAngle: number;
  sweep: number;
}

export interface ComputeSlicesResult {
  pieces: SlicePiece[];
  /** Total of all clamped values; 0 when nothing is renderable. */
  total: number;
  /** Fraction of the total per data index. */
  fractions: number[];
  warnings: string[];
}

export interface ComputeSlicesOptions {
  /** Degrees, clockwise from 12 o'clock. Default 0. */
  startAngle?: number;
  /** Degrees of empty space between slices. Default 0. */
  padAngle?: number;
}

export function computeSlices(
  data: readonly PieSliceDatum[],
  options: ComputeSlicesOptions = {}
): ComputeSlicesResult {
  const warnings: string[] = [];
  const values = data.map((d) => {
    if (!Number.isFinite(d.value) || d.value < 0) {
      warnings.push(`Slice value ${d.value} clamped to 0.`);
      return 0;
    }
    return d.value;
  });

  const total = values.reduce((sum, v) => sum + v, 0);
  const fractions = values.map((v) => (total === 0 ? 0 : v / total));
  if (total === 0) {
    return { pieces: [], total, fractions, warnings };
  }

  const padRad = ((options.padAngle ?? 0) * Math.PI) / 180;
  const pieces: SlicePiece[] = [];
  let cursor = ((options.startAngle ?? 0) * Math.PI) / 180;

  fractions.forEach((fraction, dataIndex) => {
    if (fraction === 0) {
      return;
    }
    const fullSweep = fraction * TWO_PI;
    const sweep = Math.max(0, fullSweep - padRad);
    let start = cursor + padRad / 2;
    let remaining = sweep;
    while (remaining > Math.PI) {
      pieces.push({ dataIndex, startAngle: normalize(start), sweep: Math.PI });
      start += Math.PI;
      remaining -= Math.PI;
    }
    if (remaining > 0) {
      pieces.push({ dataIndex, startAngle: normalize(start), sweep: remaining });
    }
    cursor += fullSweep;
  });

  return { pieces, total, fractions, warnings };
}

function normalize(angle: number): number {
  const result = angle % TWO_PI;
  return result < 0 ? result + TWO_PI : result;
}

/**
 * Maps a touch position (container-local px) to a data index, or null when
 * the touch lands outside the pie, inside the donut hole, or in a pad gap.
 * Replaces the legacy measure()+string-ref approach with pure math.
 */
export function hitTestPie(
  x: number,
  y: number,
  size: number,
  innerRadius: number,
  pieces: readonly SlicePiece[]
): number | null {
  const c = size / 2;
  const dx = x - c;
  const dy = y - c;
  const r = Math.hypot(dx, dy);
  if (r > c || r < innerRadius) {
    return null;
  }
  // Clockwise angle from 12 o'clock.
  const angle = normalize(Math.atan2(dx, -dy));
  for (const piece of pieces) {
    const offset = normalize(angle - piece.startAngle);
    if (offset < piece.sweep) {
      return piece.dataIndex;
    }
  }
  return null;
}
