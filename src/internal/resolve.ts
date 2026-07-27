import { Easing } from 'react-native';
import type {
  AnimationConfig,
  BaseChartProps,
  ChartTheme,
  XAxisOptions,
  YAxisOptions,
} from '../types';
import {
  DARK_THEME,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_TICK_COUNT,
  LIGHT_THEME,
} from '../constants';
import { formatCompact } from '../core/scale';

export function resolveTheme(
  theme: BaseChartProps['theme']
): Required<ChartTheme> {
  if (theme === 'dark') {
    return DARK_THEME;
  }
  if (theme === undefined || theme === 'light') {
    return LIGHT_THEME;
  }
  return { ...LIGHT_THEME, ...theme };
}

export interface ResolvedAnimation {
  enabled: boolean;
  duration: number;
  delay: number;
  easing: (t: number) => number;
  type: NonNullable<AnimationConfig['type']>;
}

export function resolveAnimation(
  animate: BaseChartProps['animate']
): ResolvedAnimation {
  const config = typeof animate === 'object' ? animate : {};
  const enabled = animate !== false && config.type !== 'none';
  return {
    enabled,
    duration: config.duration ?? DEFAULT_ANIMATION_DURATION,
    delay: config.delay ?? 0,
    easing: config.easing ?? Easing.out(Easing.cubic),
    type: config.type ?? 'grow',
  };
}

export type ResolvedYAxis = Required<
  Omit<YAxisOptions, 'min' | 'max' | 'labelStyle'>
> &
  Pick<YAxisOptions, 'min' | 'max' | 'labelStyle'>;

export function resolveYAxis(options: YAxisOptions | undefined): ResolvedYAxis {
  return {
    show: options?.show ?? true,
    tickCount: options?.tickCount ?? DEFAULT_TICK_COUNT,
    min: options?.min,
    max: options?.max,
    formatLabel: options?.formatLabel ?? ((value) => formatCompact(value)),
    showGridLines: options?.showGridLines ?? true,
    gridLineStyle: options?.gridLineStyle ?? 'dashed',
    showAxisLine: options?.showAxisLine ?? false,
    labelStyle: options?.labelStyle,
    position: options?.position ?? 'left',
  };
}

export type ResolvedXAxis = Required<Omit<XAxisOptions, 'labelStyle'>> &
  Pick<XAxisOptions, 'labelStyle'>;

export function resolveXAxis(options: XAxisOptions | undefined): ResolvedXAxis {
  return {
    show: options?.show ?? true,
    interval: options?.interval ?? 'auto',
    formatLabel: options?.formatLabel ?? ((label) => label ?? ''),
    showAxisLine: options?.showAxisLine ?? true,
    showGridLines: options?.showGridLines ?? false,
    labelStyle: options?.labelStyle,
  };
}

export interface ResolvedPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function resolvePadding(
  padding: BaseChartProps['padding']
): ResolvedPadding {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }
  return {
    top: padding?.top ?? 12,
    right: padding?.right ?? 12,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0,
  };
}

/** Series/slice color: explicit color wins, then the palette cycles. */
export function colorAt(
  palette: readonly string[],
  index: number,
  explicit?: string
): string {
  return explicit ?? palette[index % palette.length] ?? '#5B8FF9';
}
