import type { ChartTheme } from './types';

/** Categorical palette usable on both light and dark backgrounds. */
export const DEFAULT_PALETTE: readonly string[] = [
  '#5B8FF9',
  '#61DDAA',
  '#F6BD16',
  '#F08BB4',
  '#7262FD',
  '#78D3F8',
  '#9661BC',
  '#F6903D',
  '#008685',
  '#65789B',
];

export const LIGHT_THEME: Required<ChartTheme> = {
  backgroundColor: 'transparent',
  gridColor: '#E5E7EB',
  axisColor: '#D1D5DB',
  labelColor: '#6B7280',
  tooltipBackgroundColor: '#111827',
  tooltipTextColor: '#F9FAFB',
};

export const DARK_THEME: Required<ChartTheme> = {
  backgroundColor: 'transparent',
  gridColor: '#374151',
  axisColor: '#4B5563',
  labelColor: '#9CA3AF',
  tooltipBackgroundColor: '#F9FAFB',
  tooltipTextColor: '#111827',
};

export const DEFAULT_HEIGHT = 220;
export const DEFAULT_PIE_SIZE = 200;
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_BAR_RADIUS = 4;
export const DEFAULT_BAR_GAP = 2;
export const DEFAULT_TICK_COUNT = 5;
export const DEFAULT_ANIMATION_DURATION = 500;

/** Sliver of overlap between pie slices that hides sub-pixel seams. */
export const PIE_SEAM_EPSILON_RAD = (0.25 * Math.PI) / 180;

/**
 * Sliver of overlap between area-fill bands, same purpose. Safe only because
 * the bands render opaque inside one shared opacity layer — overlapping them
 * at partial alpha would darken the seam instead of hiding it.
 */
export const AREA_SEAM_EPSILON = 0.5;

/** Below these, charts grow horizontally and scroll instead of cramming. */
export const MIN_POINT_SPACING = 40;
export const MIN_BAR_BAND_WIDTH = 36;
export const MIN_BAR_WIDTH = 12;

export const AXIS_FONT_SIZE = 11;
/** Fixed label line height so labels can be centered on ticks deterministically. */
export const AXIS_LABEL_LINE_HEIGHT = 14;
