import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import type { ResolvedAnimation } from '../internal/resolve';

/**
 * One Animated.Value (0 → 1) per chart. Elements slice their own window out
 * of it with interpolate() — a single native-driver timeline staggers any
 * number of elements without allocating per-element values.
 * Restarts when `dataKey` (the data prop reference) changes.
 */
export function useChartProgress(
  animation: ResolvedAnimation,
  dataKey: unknown
): Animated.Value {
  const progress = useRef(
    new Animated.Value(animation.enabled ? 0 : 1)
  ).current;

  useEffect(() => {
    if (!animation.enabled) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const timing = Animated.timing(progress, {
      toValue: 1,
      duration: animation.duration,
      delay: animation.delay,
      easing: animation.easing,
      useNativeDriver: true,
    });
    timing.start();
    return () => timing.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, animation.enabled, animation.duration, animation.delay]);

  return progress;
}

export interface StaggerWindow {
  start: number;
  end: number;
}

/**
 * Sequential windows over [0, 1] with fractional `overlap` (0 = strictly
 * sequential, 0.5 = each starts halfway through the previous one).
 */
export function buildWindows(count: number, overlap = 0): StaggerWindow[] {
  if (count <= 0) {
    return [];
  }
  const step = 1 / (count - overlap * (count - 1));
  const advance = step * (1 - overlap);
  return Array.from({ length: count }, (_, i) => ({
    start: i * advance,
    end: i * advance + step,
  }));
}

/**
 * Windows proportional to given weights (pie slices sweep at constant
 * angular speed when windows match their sweep fractions).
 */
export function buildWeightedWindows(weights: readonly number[]): StaggerWindow[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) {
    return weights.map(() => ({ start: 0, end: 1 }));
  }
  const windows: StaggerWindow[] = [];
  let cursor = 0;
  for (const weight of weights) {
    const end = cursor + weight / total;
    windows.push({ start: cursor, end });
    cursor = end;
  }
  return windows;
}

/** progress sliced to [start, end] → 0..1, clamped outside. */
export function windowOf(
  progress: Animated.Value,
  window: StaggerWindow
): Animated.AnimatedInterpolation<number> {
  if (window.end - window.start <= 0) {
    return progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1] });
  }
  return progress.interpolate({
    inputRange: [window.start, window.end],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
}
