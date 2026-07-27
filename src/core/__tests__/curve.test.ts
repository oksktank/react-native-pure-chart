import { sampleMonotone } from '../curve';

describe('sampleMonotone', () => {
  it('passes through every original point', () => {
    const original = [
      { x: 0, y: 100 },
      { x: 60, y: 20 },
      { x: 120, y: 80 },
      { x: 180, y: 40 },
    ];
    const { points, intervalCounts } = sampleMonotone(original);
    let cursor = 0;
    expect(points[0]).toEqual(original[0]);
    for (let i = 0; i < intervalCounts.length; i++) {
      cursor += intervalCounts[i]!;
      expect(points[cursor]).toEqual(original[i + 1]);
    }
    expect(cursor).toBe(points.length - 1);
  });

  it('never overshoots the data range (the reason Catmull-Rom was rejected)', () => {
    const original = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 100 },
      { x: 150, y: 0 },
    ];
    const { points } = sampleMonotone(original);
    for (const p of points) {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(100);
    }
  });

  it('is monotone between monotone data points', () => {
    const original = [
      { x: 0, y: 0 },
      { x: 100, y: 30 },
      { x: 200, y: 90 },
      { x: 300, y: 100 },
    ];
    const { points } = sampleMonotone(original);
    for (let i = 1; i < points.length; i++) {
      expect(points[i]!.y).toBeGreaterThanOrEqual(points[i - 1]!.y - 1e-9);
    }
  });

  it('x positions strictly increase', () => {
    const { points } = sampleMonotone([
      { x: 0, y: 5 },
      { x: 40, y: 50 },
      { x: 80, y: 5 },
    ]);
    for (let i = 1; i < points.length; i++) {
      expect(points[i]!.x).toBeGreaterThan(points[i - 1]!.x);
    }
  });

  it('caps the total segment count for huge series', () => {
    const original = Array.from({ length: 300 }, (_, i) => ({
      x: i * 100,
      y: (i % 2) * 50,
    }));
    const { points, intervalCounts } = sampleMonotone(original);
    expect(intervalCounts.reduce((s, c) => s + c, 0)).toBeLessThanOrEqual(400);
    expect(points.length).toBeLessThanOrEqual(401);
  });

  it('handles 2 points and fewer', () => {
    expect(sampleMonotone([{ x: 0, y: 1 }])).toEqual({
      points: [{ x: 0, y: 1 }],
      intervalCounts: [],
    });
    const two = sampleMonotone([
      { x: 0, y: 1 },
      { x: 10, y: 2 },
    ]);
    expect(two.points).toHaveLength(2);
    expect(two.intervalCounts).toEqual([1]);
  });

  it('handles an empty input', () => {
    expect(sampleMonotone([])).toEqual({ points: [], intervalCounts: [] });
  });

  it('duplicate x (vertical jump) passes through without NaN', () => {
    const original = [
      { x: 0, y: 0 },
      { x: 50, y: 10 },
      { x: 50, y: 40 },
      { x: 100, y: 50 },
    ];
    const { points, intervalCounts } = sampleMonotone(original);
    for (const p of points) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
    // The h === 0 interval collapses to a single passthrough segment.
    expect(intervalCounts[1]).toBe(1);
    // Still passes through every original point in order.
    let cursor = 0;
    for (let i = 0; i < intervalCounts.length; i++) {
      cursor += intervalCounts[i]!;
      expect(points[cursor]).toEqual(original[i + 1]);
    }
  });

  it('intervalCounts always sums to the emitted segment count', () => {
    const original = [
      { x: 0, y: 5 },
      { x: 30, y: 50 },
      { x: 90, y: 10 },
      { x: 200, y: 80 },
      { x: 260, y: 20 },
    ];
    const { points, intervalCounts } = sampleMonotone(original);
    expect(intervalCounts.reduce((s, c) => s + c, 0)).toBe(points.length - 1);
  });

  // Pixel geometry of docs/line-value-labels.png: traffic [30,200,170,250,90,
  // 210] at height 200 over a 0..250 domain, six points 67pt apart.
  const docsGeometry = [30, 200, 170, 250, 90, 210].map((v, i) => ({
    x: i * 67,
    y: 200 - v * 0.8,
  }));

  /** Direction change at each joint of the polyline, in degrees. */
  const jointTurns = (points: { x: number; y: number }[]) => {
    const out: number[] = [];
    for (let i = 1; i < points.length - 1; i++) {
      const before = Math.atan2(
        points[i]!.y - points[i - 1]!.y,
        points[i]!.x - points[i - 1]!.x
      );
      const after = Math.atan2(
        points[i + 1]!.y - points[i]!.y,
        points[i + 1]!.x - points[i]!.x
      );
      out.push((Math.abs(after - before) * 180) / Math.PI);
    }
    return out;
  };

  // The guard that matters: what makes a polyline read as angular is the
  // direction change at its joints, not the area between it and the curve.
  // Deviation alone permits ~24° joints at a tight bend, which is what the
  // faceting in the pre-fix screenshots was.
  it('no joint turns more than 8 degrees, even at a tight bend', () => {
    const turns = jointTurns(sampleMonotone(docsGeometry).points);
    expect(Math.max(...turns)).toBeLessThan(8);
  });

  it('a wide curved interval gets far more chords than a fixed pixel step did', () => {
    const { intervalCounts } = sampleMonotone(docsGeometry);
    // A 67pt interval used to be cut into round(67 / 14) = 5 chords flat.
    for (const count of intervalCounts) {
      expect(count).toBeGreaterThanOrEqual(12);
    }
  });

  it('spends nothing on intervals that are already straight', () => {
    const { intervalCounts } = sampleMonotone([
      { x: 0, y: 0 },
      { x: 100, y: 50 },
      { x: 200, y: 100 },
      { x: 300, y: 150 },
    ]);
    expect(intervalCounts).toEqual([1, 1, 1]);
  });

  it('a dense series stays well inside the segment budget', () => {
    const original = Array.from({ length: 200 }, (_, i) => ({
      x: i * 5,
      y: 100 + 40 * Math.sin(i / 6),
    }));
    const { intervalCounts } = sampleMonotone(original);
    const total = intervalCounts.reduce((sum, c) => sum + c, 0);
    expect(total).toBeLessThanOrEqual(400);
    // Close-packed points barely bend between neighbours, so most intervals
    // should still cost a single chord.
    expect(total / intervalCounts.length).toBeLessThan(2);
  });

  it('the first interval leaves the endpoint curving, not dead straight', () => {
    const original = [
      { x: 0, y: 0 },
      { x: 100, y: 60 },
      { x: 200, y: 80 },
    ];
    const { points, intervalCounts } = sampleMonotone(original);
    // A straight first interval would put every sample on the chord.
    const chordY = (x: number) => (x / 100) * 60;
    const offCount = points
      .slice(0, intervalCounts[0]! + 1)
      .filter((p) => Math.abs(p.y - chordY(p.x)) > 0.5).length;
    expect(offCount).toBeGreaterThan(0);
  });

  it('a flat series stays exactly flat', () => {
    const { points } = sampleMonotone([
      { x: 0, y: 42 },
      { x: 60, y: 42 },
      { x: 120, y: 42 },
    ]);
    for (const p of points) {
      expect(p.y).toBeCloseTo(42);
    }
  });
});
