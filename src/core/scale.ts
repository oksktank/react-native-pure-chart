/** Maps a domain value to a pixel position. */
export interface LinearScale {
  (value: number): number;
  domain: readonly [number, number];
  range: readonly [number, number];
}

export function createLinearScale(
  domain: readonly [number, number],
  range: readonly [number, number]
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  const scale = ((value: number) =>
    span === 0 ? r0 : r0 + ((value - d0) / span) * (r1 - r0)) as LinearScale;
  scale.domain = domain;
  scale.range = range;
  return scale;
}

export interface NiceTicksResult {
  ticks: number[];
  niceMin: number;
  niceMax: number;
  step: number;
}

/**
 * Heckbert's nice-numbers algorithm: ticks land on 1/2/2.5/5/10 multiples.
 * Replaces the legacy string-length heuristic in getGuideArray.
 */
export function niceTicks(
  min: number,
  max: number,
  count: number
): NiceTicksResult {
  if (count < 1 || !Number.isFinite(min) || !Number.isFinite(max)) {
    return { ticks: [], niceMin: min, niceMax: max, step: 0 };
  }
  if (min === max) {
    // Degenerate domain: widen it so the value sits mid-chart.
    max = min === 0 ? 1 : min + Math.abs(min);
    min = Math.min(min, 0);
  }

  const step = niceNumber((max - min) / count, true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  // Guard against float drift on the last tick.
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(roundToPrecision(v, step));
  }
  return { ticks, niceMin, niceMax, step };
}

function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

function roundToPrecision(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(value.toFixed(decimals));
}

export interface YDomain {
  min: number;
  max: number;
  ticks: number[];
}

/** Nice y-domain for the given values. Always includes the zero baseline. */
export function computeYDomain(
  values: readonly number[],
  options: { min?: number; max?: number; tickCount: number }
): YDomain {
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 0;
  const min = options.min ?? Math.min(0, dataMin);
  const max = options.max ?? Math.max(0, dataMax);
  const { ticks, niceMin, niceMax } = niceTicks(min, max, options.tickCount);
  return {
    min: options.min ?? niceMin,
    max: options.max ?? niceMax,
    ticks: ticks.filter(
      (t) => t >= (options.min ?? niceMin) && t <= (options.max ?? niceMax)
    ),
  };
}

/**
 * Compact number formatting: 1234 → '1.2K', 2500000 → '2.5M', 999 → '999'.
 * Port of the legacy K/M/B abbreviation, minus lodash.
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const format = (v: number, suffix: string) => {
    const rounded = Math.round(v * 10) / 10;
    const text = Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1);
    return `${sign}${text}${suffix}`;
  };
  if (abs >= 1e9) return format(abs / 1e9, 'B');
  if (abs >= 1e6) return format(abs / 1e6, 'M');
  if (abs >= 1e3) return format(abs / 1e3, 'K');
  if (Number.isInteger(abs)) return `${sign}${abs}`;
  return `${sign}${Math.round(abs * 100) / 100}`;
}
