// .tsx extension routes this file to the components jest project (real
// react-native Animated). No JSX inside.
import { Animated, Easing } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import {
  buildWeightedWindows,
  buildWindows,
  useChartProgress,
  windowOf,
} from '../useChartProgress';
import type { ResolvedAnimation } from '../../internal/resolve';

describe('buildWindows', () => {
  it('returns [] for count <= 0', () => {
    expect(buildWindows(0)).toEqual([]);
    expect(buildWindows(-2)).toEqual([]);
  });

  it('a single window spans [0, 1]', () => {
    expect(buildWindows(1)).toEqual([{ start: 0, end: 1 }]);
  });

  it('overlap 0 tiles [0, 1] contiguously', () => {
    const windows = buildWindows(4);
    expect(windows[0]!.start).toBeCloseTo(0);
    expect(windows[3]!.end).toBeCloseTo(1);
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i]!.start).toBeCloseTo(windows[i - 1]!.end);
    }
    for (const w of windows) {
      expect(w.end - w.start).toBeCloseTo(0.25);
    }
  });

  it('overlap 0.5 starts each window halfway through the previous one', () => {
    const windows = buildWindows(3, 0.5);
    const step = windows[0]!.end - windows[0]!.start;
    expect(windows[1]!.start).toBeCloseTo(windows[0]!.start + step / 2);
    expect(windows[2]!.end).toBeCloseTo(1);
  });

  it('the last window always ends at 1', () => {
    for (const count of [1, 2, 5, 17]) {
      for (const overlap of [0, 0.25, 0.5]) {
        const windows = buildWindows(count, overlap);
        expect(windows[windows.length - 1]!.end).toBeCloseTo(1);
      }
    }
  });
});

describe('buildWeightedWindows', () => {
  it('windows are proportional to weights and tile [0, 1]', () => {
    const windows = buildWeightedWindows([1, 3]);
    expect(windows[0]).toEqual({ start: 0, end: 0.25 });
    expect(windows[1]!.start).toBeCloseTo(0.25);
    expect(windows[1]!.end).toBeCloseTo(1);
  });

  it('a zero total maps every entry to [0, 1]', () => {
    expect(buildWeightedWindows([0, 0])).toEqual([
      { start: 0, end: 1 },
      { start: 0, end: 1 },
    ]);
    expect(buildWeightedWindows([])).toEqual([]);
  });

  it('zero-weight entries collapse to zero-width windows at the cursor', () => {
    const windows = buildWeightedWindows([1, 0, 1]);
    expect(windows[1]!.start).toBeCloseTo(0.5);
    expect(windows[1]!.end).toBeCloseTo(0.5);
    expect(windows[2]!.end).toBeCloseTo(1);
  });
});

describe('windowOf', () => {
  it('a zero-width window yields a constant-1 interpolation', () => {
    const progress = new Animated.Value(0);
    const interpolation = windowOf(progress, { start: 0.5, end: 0.5 });
    expect(
      (interpolation as unknown as { __getValue(): number }).__getValue()
    ).toBe(1);
  });

  it('interpolates [start, end] to [0, 1] with clamping outside', () => {
    const progress = new Animated.Value(0);
    const interpolation = windowOf(progress, {
      start: 0.25,
      end: 0.75,
    }) as unknown as { __getValue(): number };
    const at = (v: number) => {
      progress.setValue(v);
      return interpolation.__getValue();
    };
    expect(at(0)).toBe(0); // clamped below
    expect(at(0.25)).toBeCloseTo(0);
    expect(at(0.5)).toBeCloseTo(0.5);
    expect(at(0.75)).toBeCloseTo(1);
    expect(at(1)).toBe(1); // clamped above
  });
});

function animationOf(overrides: Partial<ResolvedAnimation>): ResolvedAnimation {
  return {
    enabled: true,
    duration: 500,
    delay: 0,
    easing: Easing.out(Easing.cubic),
    type: 'grow',
    ...overrides,
  };
}

const valueOf = (v: Animated.Value) =>
  (v as unknown as { __getValue(): number }).__getValue();

describe('useChartProgress', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sits at 1 and never animates when disabled', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    const { result } = await renderHook(() =>
      useChartProgress(animationOf({ enabled: false }), [1, 2])
    );
    expect(valueOf(result.current)).toBe(1);
    expect(timingSpy).not.toHaveBeenCalled();
  });

  it('starts a native-driver timing with the resolved config when enabled', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    const easing = (t: number) => t;
    const { result } = await renderHook(() =>
      useChartProgress(animationOf({ duration: 900, delay: 50, easing }), [1])
    );
    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).toHaveBeenCalledWith(
      result.current,
      expect.objectContaining({
        toValue: 1,
        duration: 900,
        delay: 50,
        easing,
        useNativeDriver: true,
      })
    );
  });

  it('restarts when the dataKey identity changes', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    const { rerender } = await renderHook(
      ({ dataKey }: { dataKey: unknown }) =>
        useChartProgress(animationOf({}), dataKey),
      { initialProps: { dataKey: [1, 2] } }
    );
    expect(timingSpy).toHaveBeenCalledTimes(1);
    await rerender({ dataKey: [3, 4] });
    expect(timingSpy).toHaveBeenCalledTimes(2);
  });

  it('does not restart when the dataKey identity is stable', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    const dataKey = [1, 2];
    const { rerender } = await renderHook(
      (props: { dataKey: unknown }) =>
        useChartProgress(animationOf({}), props.dataKey),
      { initialProps: { dataKey } }
    );
    await rerender({ dataKey });
    expect(timingSpy).toHaveBeenCalledTimes(1);
  });

  it('stops the running timing on unmount', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    const { unmount } = await renderHook(() =>
      useChartProgress(animationOf({}), [1])
    );
    const timing = timingSpy.mock.results[0]!.value as Animated.CompositeAnimation;
    const stopSpy = jest.spyOn(timing, 'stop');
    await unmount();
    expect(stopSpy).toHaveBeenCalled();
  });
});
