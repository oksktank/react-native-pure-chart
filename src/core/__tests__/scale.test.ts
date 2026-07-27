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
});
