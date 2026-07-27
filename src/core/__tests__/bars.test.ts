import { barExtent, computeBarLayout, computeStacks } from '../bars';

describe('computeBarLayout', () => {
  it('divides the plot into equal bands with centered groups', () => {
    const { slots, bandWidth, centers } = computeBarLayout({
      plotWidth: 300,
      categoryCount: 3,
      seriesCount: 2,
      barGap: 2,
    });
    expect(bandWidth).toBe(100);
    expect(centers).toEqual([50, 150, 250]);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toHaveLength(2);
    // Group centered in its band.
    const group = slots[1]!;
    const groupStart = group[0]!.x;
    const groupEnd = group[1]!.x + group[1]!.width;
    expect((groupStart + groupEnd) / 2).toBeCloseTo(150);
  });

  it('respects explicit barWidth', () => {
    const { slots } = computeBarLayout({
      plotWidth: 400,
      categoryCount: 2,
      seriesCount: 1,
      barWidth: 36,
      barGap: 0,
    });
    expect(slots[0]![0]!.width).toBe(36);
  });

  it('handles empty input', () => {
    expect(
      computeBarLayout({ plotWidth: 0, categoryCount: 0, seriesCount: 0, barGap: 0 })
    ).toEqual({ slots: [], bandWidth: 0, centers: [] });
  });
});

describe('barExtent', () => {
  it('positive bars extend up from the baseline', () => {
    expect(barExtent(40, 100)).toEqual({ top: 40, height: 60 });
  });
  it('negative bars extend down from the baseline', () => {
    expect(barExtent(130, 100)).toEqual({ top: 100, height: 30 });
  });
});

describe('computeStacks', () => {
  it('stacks positives up and negatives down independently', () => {
    const { segments, min, max } = computeStacks(
      [
        [10, -5],
        [20, 15],
        [-8, -2],
      ],
      2
    );
    expect(segments[0]![0]).toEqual({ start: 0, end: 10 });
    expect(segments[1]![0]).toEqual({ start: 10, end: 30 });
    expect(segments[2]![0]).toEqual({ start: -8, end: 0 });
    expect(segments[0]![1]).toEqual({ start: -5, end: 0 });
    expect(segments[1]![1]).toEqual({ start: 0, end: 15 });
    expect(segments[2]![1]).toEqual({ start: -7, end: -5 });
    expect(max).toBe(30);
    expect(min).toBe(-8);
  });

  it('marks the outermost segments for corner rounding', () => {
    const { outerPositive, outerNegative } = computeStacks(
      [
        [10, null],
        [20, -3],
        [0, 5],
      ],
      2
    );
    expect(outerPositive).toEqual([1, 2]);
    expect(outerNegative).toEqual([null, 1]);
  });

  it('skips nulls and zeros without breaking the accumulation', () => {
    const { segments } = computeStacks([[null], [7], [0], [3]], 1);
    expect(segments[0]![0]).toBeNull();
    expect(segments[2]![0]).toBeNull();
    expect(segments[1]![0]).toEqual({ start: 0, end: 7 });
    expect(segments[3]![0]).toEqual({ start: 7, end: 10 });
  });
});

describe('computeBarLayout edge cases', () => {
  it('an explicit barWidth wider than the band overflows without clamping', () => {
    const { slots, bandWidth, centers } = computeBarLayout({
      plotWidth: 100,
      categoryCount: 2,
      seriesCount: 1,
      barWidth: 80,
      barGap: 0,
    });
    expect(bandWidth).toBe(50);
    expect(slots[0]![0]!.width).toBe(80);
    // Group stays centered in its band, so the start goes negative.
    expect(slots[0]![0]!.x).toBeCloseTo(-15);
    expect(centers).toEqual([25, 75]);
  });

  it('explicit groupGap controls the bar width', () => {
    const { slots } = computeBarLayout({
      plotWidth: 200,
      categoryCount: 2,
      seriesCount: 2,
      barGap: 4,
      groupGap: 20,
    });
    // band 100 → (100 - 20 - 4) / 2 = 38
    expect(slots[0]![0]!.width).toBe(38);
    expect(slots[0]![1]!.x - (slots[0]![0]!.x + 38)).toBeCloseTo(4);
  });

  it('auto mode never emits sub-1px bars on tiny plots', () => {
    const { slots } = computeBarLayout({
      plotWidth: 10,
      categoryCount: 5,
      seriesCount: 3,
      barGap: 2,
    });
    for (const group of slots) {
      for (const slot of group) {
        expect(slot.width).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('returns nothing for a zero-width plot', () => {
    expect(
      computeBarLayout({ plotWidth: 0, categoryCount: 3, seriesCount: 1, barGap: 2 })
    ).toEqual({ slots: [], bandWidth: 0, centers: [] });
  });
});

describe('computeStacks edge cases', () => {
  it('all-null input yields all-null segments, zero extremes and no outer markers', () => {
    const r = computeStacks(
      [
        [null, null],
        [null, null],
      ],
      2
    );
    expect(r.segments.flat().every((s) => s === null)).toBe(true);
    expect(r.min).toBe(0);
    expect(r.max).toBe(0);
    expect(r.outerPositive).toEqual([null, null]);
    expect(r.outerNegative).toEqual([null, null]);
  });

  it('single category with mixed signs reports cumulative extremes', () => {
    const r = computeStacks([[10], [-4], [5], [-6]], 1);
    expect(r.max).toBe(15);
    expect(r.min).toBe(-10);
    expect(r.segments[2]![0]).toEqual({ start: 10, end: 15 });
    expect(r.segments[3]![0]).toEqual({ start: -10, end: -4 });
  });

  it('an all-positive dataset still reports min 0 (zero baseline preserved)', () => {
    const r = computeStacks([[3], [4]], 1);
    expect(r.min).toBe(0);
    expect(r.max).toBe(7);
  });
});
