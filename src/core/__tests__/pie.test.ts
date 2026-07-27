import { computeSlices, hitTestPie } from '../pie';

const TWO_PI = Math.PI * 2;

function totalSweep(pieces: { sweep: number }[]): number {
  return pieces.reduce((sum, p) => sum + p.sweep, 0);
}

describe('computeSlices', () => {
  it('sweeps sum to 2π and every piece stays ≤ π', () => {
    const { pieces } = computeSlices([
      { value: 50 },
      { value: 30 },
      { value: 20 },
    ]);
    expect(totalSweep(pieces)).toBeCloseTo(TWO_PI);
    for (const piece of pieces) {
      expect(piece.sweep).toBeLessThanOrEqual(Math.PI + 1e-9);
    }
  });

  it('splits slices larger than 180° at the data level, keeping dataIndex', () => {
    const { pieces } = computeSlices([{ value: 75 }, { value: 25 }]);
    const forBig = pieces.filter((p) => p.dataIndex === 0);
    expect(forBig).toHaveLength(2);
    expect(forBig[0]!.sweep).toBeCloseTo(Math.PI);
    expect(totalSweep(forBig)).toBeCloseTo(TWO_PI * 0.75);
    // The two halves must be contiguous.
    expect(forBig[1]!.startAngle).toBeCloseTo(
      forBig[0]!.startAngle + Math.PI
    );
  });

  it('a single 100% slice becomes two π pieces', () => {
    const { pieces } = computeSlices([{ value: 42 }]);
    expect(pieces).toHaveLength(2);
    expect(totalSweep(pieces)).toBeCloseTo(TWO_PI);
  });

  it('drops zero-value slices but keeps their fraction slot', () => {
    const { pieces, fractions } = computeSlices([
      { value: 10 },
      { value: 0 },
      { value: 10 },
    ]);
    expect(pieces.every((p) => p.dataIndex !== 1)).toBe(true);
    expect(fractions).toEqual([0.5, 0, 0.5]);
  });

  it('clamps negative/non-finite values to 0 with warnings', () => {
    const { warnings, total } = computeSlices([
      { value: -5 },
      { value: NaN },
      { value: 10 },
    ]);
    expect(warnings).toHaveLength(2);
    expect(total).toBe(10);
  });

  it('returns nothing when the total is 0', () => {
    const { pieces, total } = computeSlices([{ value: 0 }]);
    expect(pieces).toEqual([]);
    expect(total).toBe(0);
  });

  it("applies startAngle in degrees clockwise from 12 o'clock", () => {
    const { pieces } = computeSlices([{ value: 1 }, { value: 1 }], {
      startAngle: 90,
    });
    expect(pieces[0]!.startAngle).toBeCloseTo(Math.PI / 2);
  });

  it('padAngle shrinks sweeps but preserves slice centers', () => {
    const plain = computeSlices([{ value: 1 }, { value: 1 }]);
    const padded = computeSlices([{ value: 1 }, { value: 1 }], { padAngle: 4 });
    const padRad = (4 * Math.PI) / 180;
    expect(padded.pieces[0]!.sweep).toBeCloseTo(plain.pieces[0]!.sweep - padRad);
    const center = (p: { startAngle: number; sweep: number }) =>
      p.startAngle + p.sweep / 2;
    expect(center(padded.pieces[0]!)).toBeCloseTo(center(plain.pieces[0]!));
  });
});

describe('hitTestPie', () => {
  // 50/50 pie of size 200: slice 0 occupies the right half (12→6 clockwise),
  // slice 1 the left half.
  const { pieces } = computeSlices([{ value: 1 }, { value: 1 }]);
  const size = 200;

  it('maps touches to the correct slice', () => {
    expect(hitTestPie(150, 100, size, 0, pieces)).toBe(0); // right
    expect(hitTestPie(50, 100, size, 0, pieces)).toBe(1); // left
  });

  it('returns null outside the circle', () => {
    expect(hitTestPie(0, 0, size, 0, pieces)).toBeNull();
    expect(hitTestPie(200, 200, size, 0, pieces)).toBeNull();
  });

  it('returns null inside the donut hole', () => {
    expect(hitTestPie(110, 100, size, 40, pieces)).toBeNull();
    expect(hitTestPie(150, 100, size, 40, pieces)).toBe(0);
  });

  it("handles slices that wrap past 12 o'clock", () => {
    const wrapped = computeSlices([{ value: 1 }, { value: 1 }], {
      startAngle: 270,
    });
    // Touch just right of 12 o'clock: inside the first slice (270°→90°).
    expect(hitTestPie(101, 20, size, 0, wrapped.pieces)).toBe(0);
    // Touch just left of 12 o'clock: also the first slice, past the wrap.
    expect(hitTestPie(99, 20, size, 0, wrapped.pieces)).toBe(0);
    expect(hitTestPie(99, 180, size, 0, wrapped.pieces)).toBe(1);
  });

  it('returns null in a padAngle gap between slices', () => {
    const padded = computeSlices([{ value: 1 }, { value: 1 }], { padAngle: 20 });
    // Touch at `deg` clockwise from 12 o'clock, radius 80 of a size-200 pie.
    const at = (deg: number) =>
      [
        100 + Math.sin((deg * Math.PI) / 180) * 80,
        100 - Math.cos((deg * Math.PI) / 180) * 80,
      ] as const;
    // Gaps are centered at 12 and 6 o'clock for a 50/50 pie.
    expect(hitTestPie(...at(0), size, 0, padded.pieces)).toBeNull();
    expect(hitTestPie(...at(180), size, 0, padded.pieces)).toBeNull();
    expect(hitTestPie(...at(90), size, 0, padded.pieces)).toBe(0);
    expect(hitTestPie(...at(270), size, 0, padded.pieces)).toBe(1);
  });

  it('touch exactly on the outer radius counts as inside', () => {
    expect(hitTestPie(200, 100, size, 0, pieces)).toBe(0);
  });

  it('slice ranges are half-open: a boundary touch hits the next slice', () => {
    // Exactly 6 o'clock is the boundary between slice 0 and slice 1.
    expect(hitTestPie(100, 200, size, 0, pieces)).toBe(1);
  });
});

describe('computeSlices edge cases', () => {
  it('normalizes a negative startAngle into [0, 2π)', () => {
    const { pieces } = computeSlices([{ value: 1 }], { startAngle: -90 });
    expect(pieces[0]!.startAngle).toBeCloseTo((3 * Math.PI) / 2);
  });

  it('handles an empty data array', () => {
    const { pieces, total, fractions } = computeSlices([]);
    expect(pieces).toEqual([]);
    expect(total).toBe(0);
    expect(fractions).toEqual([]);
  });
});
