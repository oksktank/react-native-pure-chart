import {
  applyMissingPolicy,
  collectLabels,
  collectValues,
  maxPointCount,
  normalizeData,
  type NormalizedPoint,
} from '../normalize';

describe('normalizeData', () => {
  it('wraps a plain number array into a single series', () => {
    const { series, warnings } = normalizeData([30, 200, 170]);
    expect(warnings).toEqual([]);
    expect(series).toHaveLength(1);
    expect(series[0]!.points.map((p) => p.value)).toEqual([30, 200, 170]);
  });

  it('accepts DataPoint objects and keeps label/color/extra', () => {
    const { series } = normalizeData([
      { value: 1, label: 'Jan', color: 'red', extra: { id: 7 } },
      { value: 2, label: 'Feb' },
    ]);
    expect(series[0]!.points[0]).toMatchObject({
      value: 1,
      label: 'Jan',
      color: 'red',
      extra: { id: 7 },
    });
  });

  it('accepts multi-series input', () => {
    const { series } = normalizeData([
      { name: 'A', color: '#111', data: [1, 2] },
      { name: 'B', data: [{ value: 3 }] },
    ]);
    expect(series).toHaveLength(2);
    expect(series[0]).toMatchObject({ name: 'A', color: '#111' });
    expect(series[1]!.points[0]!.value).toBe(3);
  });

  it('allows mixing numbers, nulls and objects in one series', () => {
    const { series, warnings } = normalizeData([1, null, { value: 3 }]);
    expect(warnings).toEqual([]);
    expect(series[0]!.points.map((p) => p.value)).toEqual([1, null, 3]);
  });

  it('warns instead of silently dropping mixed series/point input', () => {
    const { series, warnings } = normalizeData([
      { name: 'A', data: [1] },
      5,
    ] as never);
    expect(series).toHaveLength(1);
    expect(warnings).toHaveLength(1);
  });

  it('treats non-finite numbers as missing with a warning', () => {
    const { series, warnings } = normalizeData([1, NaN, Infinity]);
    expect(series[0]!.points.map((p) => p.value)).toEqual([1, null, null]);
    expect(warnings).toHaveLength(2);
  });

  it('handles empty input', () => {
    expect(normalizeData([]).series).toEqual([]);
  });
});

function points(values: (number | null)[]): NormalizedPoint[] {
  return values.map((value) => ({ value, isSynthetic: false }));
}

describe('applyMissingPolicy', () => {
  const input = points([10, null, null, 40, null]);

  it('break keeps nulls', () => {
    const result = applyMissingPolicy(input, 'break');
    expect(result.map((p) => p.value)).toEqual([10, null, null, 40, null]);
  });

  it('zero replaces nulls with synthetic zeros', () => {
    const result = applyMissingPolicy(input, 'zero');
    expect(result.map((p) => p.value)).toEqual([10, 0, 0, 40, 0]);
    expect(result[1]!.isSynthetic).toBe(true);
    expect(result[0]!.isSynthetic).toBe(false);
  });

  it('interpolate fills gaps linearly and marks them synthetic', () => {
    const result = applyMissingPolicy(input, 'interpolate');
    expect(result.map((p) => p.value)).toEqual([10, 20, 30, 40, null]);
    expect(result.map((p) => p.isSynthetic)).toEqual([
      false,
      true,
      true,
      false,
      false,
    ]);
  });

  it('leaves leading nulls alone (legacy crashed here)', () => {
    const result = applyMissingPolicy(points([null, null, 5, 10]), 'interpolate');
    expect(result.map((p) => p.value)).toEqual([null, null, 5, 10]);
  });

  it('handles all-null series', () => {
    const result = applyMissingPolicy(points([null, null]), 'interpolate');
    expect(result.map((p) => p.value)).toEqual([null, null]);
  });
});

describe('helpers', () => {
  const { series } = normalizeData([
    { name: 'A', data: [{ value: 1, label: 'Jan' }, { value: 9 }, null] },
    { name: 'B', data: [4, { value: 5, label: 'Feb-b' }] },
  ]);

  it('collectValues skips nulls', () => {
    expect(collectValues(series).sort((a, b) => a - b)).toEqual([1, 4, 5, 9]);
  });

  it('maxPointCount uses the longest series', () => {
    expect(maxPointCount(series)).toBe(3);
  });

  it('collectLabels prefers the first series that defines a label', () => {
    expect(collectLabels(series)).toEqual(['Jan', 'Feb-b', undefined]);
  });

  it('helpers handle empty series lists', () => {
    expect(collectValues([])).toEqual([]);
    expect(maxPointCount([])).toBe(0);
    expect(collectLabels([])).toEqual([]);
  });
});

describe('normalizeData edge cases', () => {
  it('warns and returns no series when data is not an array', () => {
    const { series, warnings } = normalizeData({} as never);
    expect(series).toEqual([]);
    expect(warnings).toEqual(['`data` must be an array.']);
  });

  it('ignores unrecognized point shapes with a warning', () => {
    const { series, warnings } = normalizeData(['nope'] as never);
    expect(series[0]!.points[0]!.value).toBeNull();
    expect(warnings).toHaveLength(1);
  });

  it('accepts a null value inside a DataPoint object without warning', () => {
    const { series, warnings } = normalizeData([{ value: null, label: 'gap' }]);
    expect(series[0]!.points[0]).toMatchObject({ value: null, label: 'gap' });
    expect(warnings).toEqual([]);
  });
});

describe('applyMissingPolicy edge cases', () => {
  it('interpolate leaves trailing nulls alone', () => {
    const result = applyMissingPolicy(points([5, 10, null, null]), 'interpolate');
    expect(result.map((p) => p.value)).toEqual([5, 10, null, null]);
  });

  it('break returns a copy, not the same array', () => {
    const input = points([1, null]);
    const result = applyMissingPolicy(input, 'break');
    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });

  it('interpolate around a single known value changes nothing', () => {
    const result = applyMissingPolicy(points([null, 7, null]), 'interpolate');
    expect(result.map((p) => p.value)).toEqual([null, 7, null]);
  });
});
