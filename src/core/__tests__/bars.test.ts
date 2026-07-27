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
