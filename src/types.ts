import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

// ─── Data model ─────────────────────────────────────────────────

/** A single data point. Pass plain numbers for brevity, or objects for labels/colors. */
export interface DataPoint {
  /** y value. `null` marks missing data — handled per the `missingValues` policy. */
  value: number | null;
  /** x-axis label. Omit to hide the axis label for this point. */
  label?: string;
  /** Per-point color override (highlighting a single bar/point). */
  color?: string;
  /** Arbitrary payload, returned untouched in press events. */
  extra?: unknown;
}

/** Point input: numbers, `null` (missing) and DataPoint objects can be mixed freely. */
export type DataPointInput = number | null | DataPoint;

/** One series of a line/bar chart. */
export interface Series {
  data: readonly DataPointInput[];
  /** Shown in the legend and tooltips. */
  name?: string;
  /** Series color. Defaults to `palette[seriesIndex]`. */
  color?: string;
}

/**
 * Chart data.
 * - Single series: `[30, 200, 170]` or `[{value: 30, label: 'Jan'}, ...]`
 * - Multi series: `[{name: 'A', data: [...]}, {name: 'B', data: [...]}]`
 */
export type ChartData = readonly DataPointInput[] | readonly Series[];

/** A pie slice — same value/label/color vocabulary as DataPoint. */
export interface PieSliceDatum {
  value: number;
  label?: string;
  /** Defaults to `palette[index]`. */
  color?: string;
  /** Arbitrary payload, returned untouched in press events. */
  extra?: unknown;
}

/** How LineChart treats `null` values. Bars always render missing values as empty slots. */
export type MissingValuePolicy = 'break' | 'interpolate' | 'zero';

// ─── Theme / animation ──────────────────────────────────────────

export interface ChartTheme {
  backgroundColor?: string;
  gridColor?: string;
  axisColor?: string;
  labelColor?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
}

export interface AnimationConfig {
  /** Milliseconds. Default 500. */
  duration?: number;
  /** Milliseconds. Default 0. */
  delay?: number;
  /** A `react-native` Easing function. Default `Easing.out(Easing.cubic)`. */
  easing?: (t: number) => number;
  /**
   * Entrance style. Default `'grow'`:
   * lines draw left→right, bars grow from the baseline, pies sweep clockwise.
   * `'fade'` animates opacity only (cheapest).
   */
  type?: 'grow' | 'fade' | 'none';
}

// ─── Interaction ────────────────────────────────────────────────

/** Payload for point/bar presses. */
export interface PressEvent {
  /** The normalized point (including `extra`). */
  point: DataPoint;
  value: number | null;
  label?: string;
  /** Point index within its series. */
  index: number;
  /** Series index (0 for single-series data). */
  seriesIndex: number;
  seriesName?: string;
  /** Pixel position relative to the chart container — anchor custom overlays here. */
  position: { x: number; y: number };
}

/** Payload for pie slice presses. */
export interface SlicePressEvent {
  slice: PieSliceDatum;
  index: number;
  value: number;
  /** `value / total`, in [0, 1]. */
  percentage: number;
}

export interface TooltipOptions {
  /** Replace the built-in tooltip entirely. Rendered absolutely above the point. */
  render?: (e: PressEvent) => ReactNode;
  /** Value formatter for the built-in tooltip. */
  formatValue?: (value: number) => string;
  /** Dismiss when tapping outside / re-tapping. Default true. */
  dismissOnTapOutside?: boolean;
}

export interface LegendOptions {
  /** Default 'bottom'. */
  position?: 'top' | 'bottom';
  labelStyle?: StyleProp<TextStyle>;
}

// ─── Axes ───────────────────────────────────────────────────────

export interface YAxisOptions {
  /** Default true. */
  show?: boolean;
  /** Number of ticks/grid lines. Default 5. */
  tickCount?: number;
  /** Force the domain. Defaults to nice-number bounds computed from data. */
  min?: number;
  max?: number;
  /** Label formatter. Defaults to `formatCompact` (1234 → '1.2K'). */
  formatLabel?: (value: number, index: number) => string;
  /** Default true. */
  showGridLines?: boolean;
  /** Default 'dashed'. */
  gridLineStyle?: 'solid' | 'dashed';
  /** Default false. */
  showAxisLine?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  /** Default 'left'. */
  position?: 'left' | 'right';
}

export interface XAxisOptions {
  /** Default true (auto-hidden when no point has a label). */
  show?: boolean;
  /** Show every n-th label. `'auto'` (default) thins labels to fit the width. */
  interval?: number | 'auto';
  formatLabel?: (label: string | undefined, index: number) => string;
  /** Default true. */
  showAxisLine?: boolean;
  /** Default false. */
  showGridLines?: boolean;
  labelStyle?: StyleProp<TextStyle>;
}

// ─── Chart props ────────────────────────────────────────────────

export interface BaseChartProps {
  /** Omit to fill the parent width (measured via onLayout). */
  width?: number;
  /** Default 220. */
  height?: number;
  /** Inner padding of the plot area. */
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  /** Colors auto-assigned to series/slices. Defaults to the built-in 10-color palette. */
  palette?: readonly string[];
  /** `'light'` (default), `'dark'`, or a partial override object. */
  theme?: 'light' | 'dark' | ChartTheme;
  /** Default true (500ms grow). */
  animate?: boolean | AnimationConfig;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Auto-generated ("Line chart, 2 series, 12 points") when omitted. */
  accessibilityLabel?: string;
}

export interface LineChartProps extends BaseChartProps {
  data: ChartData;
  /** Line thickness in px. Default 2. */
  strokeWidth?: number;
  /**
   * Default 'linear'. 'monotone' draws a smooth curve through the points
   * (monotone cubic — never overshoots the data).
   */
  curve?: 'linear' | 'step' | 'monotone';
  /** Fill the area between the line and the zero baseline. Default false. */
  area?: boolean | { opacity?: number };
  /** Default true. Object form adjusts radius/color. */
  showDataPoints?: boolean | { radius?: number; color?: string };
  /** How to treat `null` values. Default 'break'. */
  missingValues?: MissingValuePolicy;
  xAxis?: XAxisOptions;
  yAxis?: YAxisOptions;
  /** Shown by default for named multi-series data. */
  legend?: boolean | LegendOptions;
  /** Horizontal scrolling when points overflow the width. Default true. */
  scrollable?: boolean;
  /** Default 'start'. */
  initialScroll?: 'start' | 'end';
  /** Minimum px between points. Defaults to even distribution across the width. */
  spacing?: number;
  onPointPress?: (e: PressEvent) => void;
  /** Controlled selection; `null` clears. Omit for uncontrolled behavior. */
  selectedIndex?: number | null;
  onSelectionChange?: (index: number | null) => void;
  /** Default true: built-in tooltip + selection guide on tap. */
  tooltip?: boolean | TooltipOptions;
  /** Replace the data point dot entirely. */
  renderDataPoint?: (e: PressEvent) => ReactNode;
  /** Always-visible value label above each point. */
  renderValueLabel?: (e: PressEvent) => ReactNode;
}

export interface BarChartProps extends BaseChartProps {
  data: ChartData;
  /** Bar width in px. Defaults to automatic sizing. */
  barWidth?: number;
  /** Corner radius on the value-side corners. Default 4. */
  barRadius?: number;
  /** Gap between bars of the same category. Default 2. */
  barGap?: number;
  /** Gap between categories. Defaults to automatic sizing. */
  groupGap?: number;
  /** Stack multi-series values (positives up, negatives down). Default false. */
  stacked?: boolean;
  /** Horizontal bars. Default false. */
  horizontal?: boolean;
  xAxis?: XAxisOptions;
  yAxis?: YAxisOptions;
  legend?: boolean | LegendOptions;
  scrollable?: boolean;
  initialScroll?: 'start' | 'end';
  onPointPress?: (e: PressEvent) => void;
  selectedIndex?: number | null;
  onSelectionChange?: (index: number | null) => void;
  tooltip?: boolean | TooltipOptions;
  renderValueLabel?: (e: PressEvent) => ReactNode;
}

export interface PieChartProps
  extends Omit<BaseChartProps, 'width' | 'height' | 'padding'> {
  data: readonly PieSliceDatum[];
  /** Diameter in px. Default 200. */
  size?: number;
  /**
   * Donut hole: 0 (default) renders a full pie. Numbers are px,
   * `'60%'` is relative to the radius. The hole is opaque (see README Limitations).
   */
  innerRadius?: number | `${number}%`;
  /** Hole fill color. Defaults to the theme background. */
  holeColor?: string;
  /** Start angle in degrees, measured clockwise from 12 o'clock. Default 0. */
  startAngle?: number;
  /** Gap between slices in degrees. Default 0. */
  padAngle?: number;
  /** On-slice labels. Default 'none' (use the legend). */
  sliceLabel?:
    | 'none'
    | 'label'
    | 'value'
    | 'percentage'
    | ((e: SlicePressEvent) => string);
  /** Default true. */
  legend?: boolean | LegendOptions;
  onSlicePress?: (e: SlicePressEvent) => void;
  /** Nudge the pressed slice outward. Default true. */
  focusOnPress?: boolean;
  selectedIndex?: number | null;
  onSelectionChange?: (index: number | null) => void;
  /** Content centered in the donut hole (totals, selected slice details…). */
  renderCenterLabel?: (selected: SlicePressEvent | null) => ReactNode;
}
