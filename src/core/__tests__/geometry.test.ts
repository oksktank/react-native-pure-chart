import {
  polylineSegments,
  segmentBetween,
  splitRuns,
  stepSegments,
} from '../geometry';

describe('segmentBetween', () => {
  it('horizontal segment', () => {
    const s = segmentBetween({ x: 0, y: 10 }, { x: 30, y: 10 });
    expect(s).toEqual({ x: 0, y: 10, length: 30, angleRad: 0 });
  });

  it('vertical segment points down (screen coordinates)', () => {
    const s = segmentBetween({ x: 5, y: 0 }, { x: 5, y: 40 });
    expect(s.length).toBe(40);
    expect(s.angleRad).toBeCloseTo(Math.PI / 2);
  });

  it('diagonal 3-4-5 triangle', () => {
    const s = segmentBetween({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(s.length).toBeCloseTo(5);
    expect(s.angleRad).toBeCloseTo(Math.atan2(4, 3));
  });
});

describe('polylineSegments', () => {
  it('creates n-1 segments chained end to end', () => {
    const segments = polylineSegments([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0]!.angleRad).toBeCloseTo(Math.PI / 4);
    expect(segments[1]!.angleRad).toBeCloseTo(-Math.PI / 4);
  });

  it('returns nothing for fewer than 2 points', () => {
    expect(polylineSegments([{ x: 0, y: 0 }])).toEqual([]);
  });
});

describe('stepSegments', () => {
  it('emits horizontal then vertical segments', () => {
    const segments = stepSegments([
      { x: 0, y: 20 },
      { x: 10, y: 5 },
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ x: 0, y: 20, length: 10, angleRad: 0 });
    expect(segments[1]!.length).toBe(15);
  });

  it('skips the vertical part when values are equal', () => {
    const segments = stepSegments([
      { x: 0, y: 7 },
      { x: 10, y: 7 },
    ]);
    expect(segments).toHaveLength(1);
  });
});

describe('splitRuns', () => {
  it('splits on unknown values', () => {
    const runs = splitRuns([1, 2, null, 4, null, null, 7], (v) => v !== null);
    expect(runs).toEqual([[1, 2], [4], [7]]);
  });

  it('handles leading/trailing unknowns and empty input', () => {
    expect(splitRuns([null, 1, null], (v) => v !== null)).toEqual([[1]]);
    expect(splitRuns([], () => true)).toEqual([]);
  });
});
