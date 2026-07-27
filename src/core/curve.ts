import type { Point } from './geometry';

export interface SampledCurve {
  /** Sampled polyline points, including the original points. */
  points: Point[];
  /** Number of segments each original interval was split into. */
  intervalCounts: number[];
}

/** Total segment budget per run — keeps the View count bounded. */
const MAX_TOTAL_SEGMENTS = 400;
/**
 * Ceiling for a single interval, however curved it is. Because the allowance
 * halves on every split, this doubles as a recursion depth cap of log2 — the
 * shortest piece an interval can be cut into is 1/128th of it. Only tight
 * bends ever recurse that far, so raising it costs a handful of segments.
 */
const MAX_SEGMENTS_PER_INTERVAL = 128;
/**
 * How far the sampled polyline may stray from the true cubic, in points.
 * At 0.2 the bulge between two chords is sub-pixel even on a 1x screen.
 */
const FLATNESS_TOLERANCE = 0.2;
/**
 * How far the tangent may swing across a single chord. Flatness alone is not
 * enough: deviation and turn are linked by turn = sqrt(8 · deviation · κ), so a
 * tight bend (the flat top of a local maximum, where the monotone constraint
 * forces a zero tangent) satisfies a 0.2pt deviation while still turning ~24°
 * per joint — which is exactly what reads as "angular".
 */
const MAX_TURN_RAD = (6 * Math.PI) / 180;
/** Splitting below this chord length is sub-pixel churn at any screen scale. */
const MIN_CHORD_PT = 0.8;

/**
 * Samples a monotone cubic (d3's `curveMonotoneX` tangents) through the points
 * into short line segments. Monotone interpolation never overshoots the data —
 * a curve through [0, 10, 10, 0] stays within [0, 10], unlike Catmull-Rom.
 *
 * Segment counts are chosen per interval from the local curvature, not from a
 * fixed pixel step: a nearly straight interval costs one chord, a tight bend
 * gets as many as it needs to stay within FLATNESS_TOLERANCE of the curve.
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

  // Interior tangents, d3 `curveMonotoneX`. The three-way min keeps every
  // interval monotone by construction, so no Fritsch–Carlson clamp pass is
  // needed afterwards.
  const m: number[] = new Array(n);
  for (let i = 1; i < n - 1; i++) {
    const h0 = dx[i - 1]!;
    const h1 = dx[i]!;
    const s0 = slope[i - 1]!;
    const s1 = slope[i]!;
    if (h0 === 0 || h1 === 0 || s0 * s1 <= 0) {
      m[i] = 0; // local extremum (or a vertical jump) — flatten the tangent
      continue;
    }
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    m[i] =
      (Math.sign(s0) + Math.sign(s1)) *
      Math.min(Math.abs(s0), Math.abs(s1), Math.abs(p) / 2);
  }
  // Endpoints use d3's one-sided three-point estimate, so the first and last
  // intervals bend instead of leaving the data point dead straight. Since
  // |m[1]| <= |slope[0]| and shares its sign, this stays monotone-safe.
  m[0] = dx[0] === 0 ? 0 : (3 * slope[0]! - m[1]!) / 2;
  m[n - 1] = dx[n - 2] === 0 ? 0 : (3 * slope[n - 2]! - m[n - 2]!) / 2;

  // Sample each interval, splitting only where the curve actually bends.
  const build = (cap: number): SampledCurve => {
    const sampled: Point[] = [points[0]!];
    const intervalCounts: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i]!;
      const p1 = points[i + 1]!;
      const h = dx[i]!;
      if (h === 0) {
        sampled.push(p1);
        intervalCounts.push(1);
        continue;
      }
      const before = sampled.length;
      subdivide(sampled, p0, p1, h, m[i]!, m[i + 1]!, cap);
      // Snap the interval end to the exact data point.
      sampled[sampled.length - 1] = { x: p1.x, y: p1.y };
      intervalCounts.push(sampled.length - before);
    }
    return { points: sampled, intervalCounts };
  };

  const curve = build(MAX_SEGMENTS_PER_INTERVAL);
  const total = curve.points.length - 1;
  if (total <= MAX_TOTAL_SEGMENTS) {
    return curve;
  }
  // Over budget: share it out evenly rather than letting the early intervals
  // eat it all, then re-sample within that tighter per-interval cap.
  return build(Math.max(1, Math.floor(MAX_TOTAL_SEGMENTS / (n - 1))));
}

/**
 * Appends the chords approximating one Hermite interval, splitting a piece in
 * half whenever it either bulges away from its chord or turns too sharply.
 * Adaptive rather than evenly spaced on purpose: an interval that runs steeply
 * into a flat local maximum has all of its curvature at one end, and spending
 * the same chords on the straight part would cost several times as many Views
 * for the same result.
 */
function subdivide(
  out: Point[],
  p0: Point,
  p1: Point,
  h: number,
  m0: number,
  m1: number,
  cap: number
): void {
  const y = (t: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * p0.y +
      (t3 - 2 * t2 + t) * h * m0 +
      (-2 * t3 + 3 * t2) * p1.y +
      (t3 - t2) * h * m1
    );
  };
  const dy = (t: number) => {
    const t2 = t * t;
    return (
      (6 * t2 - 6 * t) * (p0.y - p1.y) +
      (3 * t2 - 4 * t + 1) * h * m0 +
      (3 * t2 - 2 * t) * h * m1
    );
  };

  // `allowance` is the most chords this piece may emit, halved into each side
  // on a split. Draining one shared counter depth-first instead would let the
  // left half spend everything and leave the right half as one long chord —
  // measurably worse than not capping at all.
  const walk = (
    ta: number,
    tb: number,
    ya: number,
    yb: number,
    dya: number,
    dyb: number,
    allowance: number
  ): void => {
    const span = tb - ta;
    const xa = p0.x + ta * h;
    const xb = p0.x + tb * h;
    const ux = xb - xa;
    const uy = yb - ya;
    const len = Math.hypot(ux, uy);
    if (allowance >= 2 && len > MIN_CHORD_PT) {
      // This piece as a cubic Bezier. Testing the control polygon rather than
      // the curve's midpoint matters: a symmetric S-piece passes exactly
      // through its chord's midpoint and has equal tangents at both ends, so
      // sampling either one reports it as flat when it is anything but.
      const leg = (span * h) / 3;
      const c1x = xa + leg;
      const c1y = ya + (span * dya) / 3;
      const c2x = xb - leg;
      const c2y = yb - (span * dyb) / 3;
      // A cubic strays from its chord by at most 3/4 of its control offsets.
      const deviation =
        (0.75 *
          Math.max(
            Math.abs(ux * (c1y - ya) - uy * (c1x - xa)),
            Math.abs(ux * (c2y - ya) - uy * (c2x - xa))
          )) /
        len;
      // Total tangent swing across the piece, bounded by the polygon's turns.
      // Every leg advances in +x, so no angle wrapping is possible.
      const a0 = Math.atan2(c1y - ya, leg);
      const a1 = Math.atan2(c2y - c1y, c2x - c1x);
      const a2 = Math.atan2(yb - c2y, leg);
      const turn = Math.abs(a1 - a0) + Math.abs(a2 - a1);
      if (deviation > FLATNESS_TOLERANCE || turn > MAX_TURN_RAD) {
        const tm = (ta + tb) / 2;
        const ym = y(tm);
        const dym = dy(tm);
        const half = allowance / 2;
        walk(ta, tm, ya, ym, dya, dym, half);
        walk(tm, tb, ym, yb, dym, dyb, half);
        return;
      }
    }
    out.push({ x: xb, y: yb });
  };
  walk(0, 1, p0.y, p1.y, dy(0), dy(1), cap);
}
