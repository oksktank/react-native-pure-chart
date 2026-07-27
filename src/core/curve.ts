import type { Point } from './geometry';

export interface SampledCurve {
  /** Sampled polyline points, including the original points. */
  points: Point[];
  /** Number of segments each original interval was split into. */
  intervalCounts: number[];
}

/** Total segment budget per series — keeps the View count bounded. */
const MAX_TOTAL_SEGMENTS = 400;
const MAX_SEGMENTS_PER_INTERVAL = 12;
/** Target horizontal px per sampled segment. */
const PX_PER_SEGMENT = 14;

/**
 * Samples a monotone cubic (Fritsch–Carlson) through the points into short
 * line segments. Monotone interpolation never overshoots the data — a curve
 * through [0, 10, 10, 0] stays within [0, 10], unlike Catmull-Rom.
 */
export function sampleMonotone(points: readonly Point[]): SampledCurve {
  if (points.length < 3) {
    return {
      points: [...points],
      intervalCounts: points.length === 2 ? [1] : [],
    };
  }

  const n = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = points[i + 1]!.x - points[i]!.x;
    dx.push(h);
    slope.push(h === 0 ? 0 : (points[i + 1]!.y - points[i]!.y) / h);
  }

  // Tangents (Fritsch–Carlson).
  const m: number[] = new Array(n);
  m[0] = slope[0]!;
  m[n - 1] = slope[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1]!;
    const b = slope[i]!;
    m[i] = a * b <= 0 ? 0 : (a + b) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    const d = slope[i]!;
    if (d === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i]! / d;
    const b = m[i + 1]! / d;
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d;
      m[i + 1] = t * b * d;
    }
  }

  // Segment counts per interval, scaled down to the total budget.
  let counts = dx.map((h) =>
    Math.max(2, Math.min(MAX_SEGMENTS_PER_INTERVAL, Math.round(Math.abs(h) / PX_PER_SEGMENT)))
  );
  const total = counts.reduce((sum, c) => sum + c, 0);
  if (total > MAX_TOTAL_SEGMENTS) {
    const factor = MAX_TOTAL_SEGMENTS / total;
    counts = counts.map((c) => Math.max(1, Math.floor(c * factor)));
  }

  const sampled: Point[] = [points[0]!];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const h = dx[i]!;
    const k = counts[i]!;
    if (h === 0) {
      sampled.push(p1);
      counts[i] = 1;
      continue;
    }
    for (let j = 1; j <= k; j++) {
      const t = j / k;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      sampled.push({
        x: p0.x + t * h,
        y:
          h00 * p0.y +
          h10 * h * m[i]! +
          h01 * p1.y +
          h11 * h * m[i + 1]!,
      });
    }
    // Snap the interval end to the exact data point.
    sampled[sampled.length - 1] = { x: p1.x, y: p1.y };
  }

  return { points: sampled, intervalCounts: counts };
}
