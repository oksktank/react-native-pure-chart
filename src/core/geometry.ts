export interface Point {
  x: number;
  y: number;
}

/**
 * A line segment as the renderer consumes it: a thin bar anchored at (x, y),
 * rotated by angleRad around its start. No correction constants needed —
 * `transformOrigin: '0% 50%'` keeps the start point fixed.
 */
export interface SegmentLayout {
  x: number;
  y: number;
  length: number;
  angleRad: number;
}

export function segmentBetween(p1: Point, p2: Point): SegmentLayout {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return {
    x: p1.x,
    y: p1.y,
    length: Math.hypot(dx, dy),
    angleRad: Math.atan2(dy, dx),
  };
}

/**
 * Segments for a polyline. Points with `null` gaps must be filtered by the
 * caller beforehand; runs are split by passing them as separate arrays.
 */
export function polylineSegments(points: readonly Point[]): SegmentLayout[] {
  const segments: SegmentLayout[] = [];
  for (let i = 1; i < points.length; i++) {
    segments.push(segmentBetween(points[i - 1]!, points[i]!));
  }
  return segments;
}

/** Segments for `curve: 'step'` — horizontal run, then vertical rise. */
export function stepSegments(points: readonly Point[]): SegmentLayout[] {
  const segments: SegmentLayout[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const next = points[i]!;
    const corner: Point = { x: next.x, y: prev.y };
    segments.push(segmentBetween(prev, corner));
    if (prev.y !== next.y) {
      segments.push(segmentBetween(corner, next));
    }
  }
  return segments;
}

/**
 * Splits points into contiguous runs of known values, so 'break' missing-value
 * policy renders each run as its own polyline.
 */
export function splitRuns<T>(
  items: readonly T[],
  isKnown: (item: T) => boolean
): T[][] {
  const runs: T[][] = [];
  let current: T[] = [];
  for (const item of items) {
    if (isKnown(item)) {
      current.push(item);
    } else if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    runs.push(current);
  }
  return runs;
}
