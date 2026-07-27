export { BarChart } from './charts/BarChart';
export { LineChart } from './charts/LineChart';
export { PieChart } from './charts/PieChart';

export { DEFAULT_PALETTE } from './constants';
/** Default y-axis label formatter: `1234 → '1.2K'`. Compose it for units. */
export { formatCompact } from './core/scale';

export type {
  AnimationConfig,
  BarChartProps,
  BaseChartProps,
  ChartData,
  ChartTheme,
  DataPoint,
  DataPointInput,
  LegendOptions,
  LineChartProps,
  MissingValuePolicy,
  PieChartProps,
  PieSliceDatum,
  PressEvent,
  Series,
  SlicePressEvent,
  TooltipOptions,
  XAxisOptions,
  YAxisOptions,
} from './types';
