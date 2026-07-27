import type {
  ChartData,
  DataPoint,
  DataPointInput,
  MissingValuePolicy,
  Series,
} from '../types';

export interface NormalizedPoint {
  value: number | null;
  label?: string;
  color?: string;
  extra?: unknown;
  /** True when the value was produced by the 'interpolate' or 'zero' policy. */
  isSynthetic: boolean;
}

export interface NormalizedSeries {
  name?: string;
  color?: string;
  points: NormalizedPoint[];
}

export interface NormalizeResult {
  series: NormalizedSeries[];
  /** Human-readable problems found in the input. Charts print these in dev builds. */
  warnings: string[];
}

function isSeriesObject(item: unknown): item is Series {
  return (
    typeof item === 'object' &&
    item !== null &&
    Array.isArray((item as Series).data)
  );
}

function isDataPointObject(item: unknown): item is DataPoint {
  return typeof item === 'object' && item !== null && 'value' in item;
}

function toPoint(input: DataPointInput, warnings: string[]): NormalizedPoint {
  if (input === null) {
    return { value: null, isSynthetic: false };
  }
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      warnings.push(`Non-finite value ${input} treated as missing.`);
      return { value: null, isSynthetic: false };
    }
    return { value: input, isSynthetic: false };
  }
  if (isDataPointObject(input)) {
    const { value, label, color, extra } = input;
    if (value !== null && !Number.isFinite(value)) {
      warnings.push(`Non-finite value ${value} treated as missing.`);
      return { value: null, label, color, extra, isSynthetic: false };
    }
    return { value, label, color, extra, isSynthetic: false };
  }
  warnings.push(`Ignored unrecognized data point: ${JSON.stringify(input)}`);
  return { value: null, isSynthetic: false };
}

/**
 * Normalizes every accepted `data` shape into a list of series.
 * Never throws — problems are reported through `warnings` instead of
 * the legacy behavior of silently rendering an empty chart.
 */
export function normalizeData(input: ChartData): NormalizeResult {
  const warnings: string[] = [];

  if (!Array.isArray(input)) {
    return { series: [], warnings: ['`data` must be an array.'] };
  }
  if (input.length === 0) {
    return { series: [], warnings };
  }

  const seriesCount = input.filter(isSeriesObject).length;
  if (seriesCount > 0 && seriesCount < input.length) {
    warnings.push(
      'Mixed series objects and plain points in `data`; plain points were ignored.'
    );
  }

  if (seriesCount > 0) {
    const series = (input as readonly unknown[])
      .filter(isSeriesObject)
      .map((s) => ({
        name: s.name,
        color: s.color,
        points: s.data.map((p) => toPoint(p, warnings)),
      }));
    return { series, warnings };
  }

  return {
    series: [
      {
        points: (input as readonly DataPointInput[]).map((p) =>
          toPoint(p, warnings)
        ),
      },
    ],
    warnings,
  };
}

/**
 * Applies the missing-value policy to a series.
 * - 'break': nulls stay null (segments are skipped when rendering)
 * - 'zero': nulls become 0
 * - 'interpolate': nulls between two known values are linearly interpolated;
 *   leading/trailing nulls stay null (the legacy code crashed on a leading null)
 */
export function applyMissingPolicy(
  points: readonly NormalizedPoint[],
  policy: MissingValuePolicy
): NormalizedPoint[] {
  if (policy === 'break') {
    return [...points];
  }
  if (policy === 'zero') {
    return points.map((p) =>
      p.value === null ? { ...p, value: 0, isSynthetic: true } : p
    );
  }

  const result = points.map((p) => ({ ...p }));
  let prevKnown = -1;
  for (let i = 0; i < result.length; i++) {
    const point = result[i]!;
    if (point.value === null) {
      continue;
    }
    if (prevKnown >= 0 && i - prevKnown > 1) {
      const start = result[prevKnown]!.value!;
      const step = (point.value - start) / (i - prevKnown);
      for (let j = prevKnown + 1; j < i; j++) {
        result[j]!.value = start + step * (j - prevKnown);
        result[j]!.isSynthetic = true;
      }
    }
    prevKnown = i;
  }
  return result;
}

/** All finite values across series — input for domain computation. */
export function collectValues(series: readonly NormalizedSeries[]): number[] {
  const values: number[] = [];
  for (const s of series) {
    for (const p of s.points) {
      if (p.value !== null) {
        values.push(p.value);
      }
    }
  }
  return values;
}

/** Longest point count across series — defines the category count. */
export function maxPointCount(series: readonly NormalizedSeries[]): number {
  return series.reduce((max, s) => Math.max(max, s.points.length), 0);
}

/** X labels per category index, taken from the first series that defines one. */
export function collectLabels(
  series: readonly NormalizedSeries[]
): (string | undefined)[] {
  const count = maxPointCount(series);
  const labels: (string | undefined)[] = new Array(count).fill(undefined);
  for (let i = 0; i < count; i++) {
    for (const s of series) {
      const label = s.points[i]?.label;
      if (label !== undefined) {
        labels[i] = label;
        break;
      }
    }
  }
  return labels;
}
