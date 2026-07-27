import {
  computeYDomain,
  createLinearScale,
  formatCompact,
  niceTicks,
} from '../scale';

describe('createLinearScale', () => {
  it('maps domain to range linearly', () => {
    const scale = createLinearScale([0, 100], [0, 200]);
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(100);
    expect(scale(100)).toBe(200);
  });

  it('supports inverted ranges (screen y grows downward)', () => {
    const scale = createLinearScale([0, 100], [200, 0]);
    expect(scale(0)).toBe(200);
    expect(scale(100)).toBe(0);
  });

  it('is constant on a degenerate domain instead of dividing by zero', () => {
    const scale = createLinearScale([5, 5], [0, 100]);
    expect(scale(5)).toBe(0);
  });
});

describe('niceTicks', () => {
  it('produces round steps covering the domain', () => {
    const { ticks, niceMin, niceMax, step } = niceTicks(0, 87, 5);
    expect(niceMin).toBe(0);
    expect(niceMax).toBeGreaterThanOrEqual(87);
    expect(step).toBe(20);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(niceMax);
  });

  it('handles tiny fractional domains without float garbage', () => {
    const { ticks } = niceTicks(0, 0.7, 5);
    for (const t of ticks) {
      expect(String(t).length).toBeLessThan(6);
    }
  });

  it('handles negative domains', () => {
    const { niceMin, niceMax } = niceTicks(-50, 120, 5);
    expect(niceMin).toBeLessThanOrEqual(-50);
    expect(niceMax).toBeGreaterThanOrEqual(120);
  });

  it('widens a degenerate domain', () => {
    const { ticks } = niceTicks(5, 5, 5);
    expect(ticks.length).toBeGreaterThan(1);
  });
});

describe('computeYDomain', () => {
  it('includes the zero baseline for positive data', () => {
    const domain = computeYDomain([30, 200, 170], { tickCount: 5 });
    expect(domain.min).toBe(0);
    expect(domain.max).toBeGreaterThanOrEqual(200);
    expect(domain.ticks[0]).toBe(0);
  });

  it('respects explicit min/max', () => {
    const domain = computeYDomain([30, 200], { min: 100, max: 300, tickCount: 5 });
    expect(domain.min).toBe(100);
    expect(domain.max).toBe(300);
    expect(domain.ticks.every((t) => t >= 100 && t <= 300)).toBe(true);
  });

  it('handles empty data', () => {
    const domain = computeYDomain([], { tickCount: 5 });
    expect(domain.min).toBe(0);
    expect(domain.max).toBeGreaterThan(0);
  });
});

describe('formatCompact', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1K'],
    [1234, '1.2K'],
    [999999, '1000K'],
    [1000000, '1M'],
    [2500000, '2.5M'],
    [1000000000, '1B'],
    [1500000000, '1.5B'],
    [-1234, '-1.2K'],
    [12.345, '12.35'],
  ])('formatCompact(%p) === %p', (input, expected) => {
    expect(formatCompact(input)).toBe(expected);
  });

  it('stringifies non-finite input', () => {
    expect(formatCompact(Infinity)).toBe('Infinity');
    expect(formatCompact(-Infinity)).toBe('-Infinity');
    expect(formatCompact(NaN)).toBe('NaN');
  });

  it('rounds abbreviation boundaries half-up', () => {
    expect(formatCompact(1250)).toBe('1.3K');
    expect(formatCompact(1949999999)).toBe('1.9B');
  });

  it('rounds plain fractions to two decimals and keeps the sign', () => {
    expect(formatCompact(0.123)).toBe('0.12');
    expect(formatCompact(-0.5)).toBe('-0.5');
  });
});

describe('niceTicks edge cases', () => {
  it('returns empty ticks for an inverted domain (min > max) instead of looping', () => {
    const { ticks } = niceTicks(100, 0, 5);
    expect(ticks).toEqual([]);
  });

  it('returns empty ticks for non-finite bounds or a zero tick count', () => {
    expect(niceTicks(NaN, 10, 5).ticks).toEqual([]);
    expect(niceTicks(0, Infinity, 5).ticks).toEqual([]);
    expect(niceTicks(0, 10, 0).ticks).toEqual([]);
  });

  it('widens an all-zero domain to [0, 1]', () => {
    const { niceMin, niceMax, ticks } = niceTicks(0, 0, 5);
    expect(niceMin).toBe(0);
    expect(niceMax).toBe(1);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(1);
  });
});

describe('computeYDomain edge cases', () => {
  it('includes the zero baseline for negative-only data', () => {
    const domain = computeYDomain([-30, -10], { tickCount: 5 });
    expect(domain.max).toBe(0);
    expect(domain.min).toBeLessThanOrEqual(-30);
  });

  it('an explicit window excluding zero drops the zero tick', () => {
    const domain = computeYDomain([50, 90], { min: 40, max: 100, tickCount: 5 });
    expect(domain.min).toBe(40);
    expect(domain.max).toBe(100);
    expect(domain.ticks.every((t) => t >= 40 && t <= 100)).toBe(true);
    expect(domain.ticks).not.toContain(0);
  });

  it('handles a constant series without a degenerate scale', () => {
    const domain = computeYDomain([100, 100, 100], { tickCount: 5 });
    expect(domain.max).toBeGreaterThan(domain.min);
  });
});
