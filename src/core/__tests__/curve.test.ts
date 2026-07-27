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
});
