import {
  AXIS_FONT_SIZE,
  AXIS_LABEL_LINE_HEIGHT,
  DARK_THEME,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_BAR_GAP,
  DEFAULT_BAR_RADIUS,
  DEFAULT_HEIGHT,
  DEFAULT_PALETTE,
  DEFAULT_PIE_SIZE,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_TICK_COUNT,
  LIGHT_THEME,
  MIN_BAR_BAND_WIDTH,
  MIN_BAR_WIDTH,
  MIN_POINT_SPACING,
  PIE_SEAM_EPSILON_RAD,
} from '../constants';

describe('DEFAULT_PALETTE', () => {
  it('is 10 unique #RRGGBB colors', () => {
    expect(DEFAULT_PALETTE).toHaveLength(10);
    expect(new Set(DEFAULT_PALETTE).size).toBe(10);
    for (const color of DEFAULT_PALETTE) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('themes', () => {
  it('light and dark themes define the same keys', () => {
    expect(Object.keys(DARK_THEME).sort()).toEqual(
      Object.keys(LIGHT_THEME).sort()
    );
  });

  // Intentional-change gate: theme tweaks must update this test.
  it('theme values are stable', () => {
    expect(LIGHT_THEME).toEqual({
      backgroundColor: 'transparent',
      gridColor: '#E5E7EB',
      axisColor: '#D1D5DB',
      labelColor: '#6B7280',
      tooltipBackgroundColor: '#111827',
      tooltipTextColor: '#F9FAFB',
    });
    expect(DARK_THEME).toEqual({
      backgroundColor: 'transparent',
      gridColor: '#374151',
      axisColor: '#4B5563',
      labelColor: '#9CA3AF',
      tooltipBackgroundColor: '#F9FAFB',
      tooltipTextColor: '#111827',
    });
  });
});

describe('layout and animation constants', () => {
  // Intentional-change gate: these values are part of the visual contract.
  it('values are stable', () => {
    expect({
      DEFAULT_HEIGHT,
      DEFAULT_PIE_SIZE,
      DEFAULT_STROKE_WIDTH,
      DEFAULT_BAR_RADIUS,
      DEFAULT_BAR_GAP,
      DEFAULT_TICK_COUNT,
      DEFAULT_ANIMATION_DURATION,
      MIN_POINT_SPACING,
      MIN_BAR_BAND_WIDTH,
      MIN_BAR_WIDTH,
      AXIS_FONT_SIZE,
      AXIS_LABEL_LINE_HEIGHT,
    }).toEqual({
      DEFAULT_HEIGHT: 220,
      DEFAULT_PIE_SIZE: 200,
      DEFAULT_STROKE_WIDTH: 2,
      DEFAULT_BAR_RADIUS: 4,
      DEFAULT_BAR_GAP: 2,
      DEFAULT_TICK_COUNT: 5,
      DEFAULT_ANIMATION_DURATION: 500,
      MIN_POINT_SPACING: 40,
      MIN_BAR_BAND_WIDTH: 36,
      MIN_BAR_WIDTH: 12,
      AXIS_FONT_SIZE: 11,
      AXIS_LABEL_LINE_HEIGHT: 14,
    });
  });

  it('the pie seam epsilon is a quarter of a degree', () => {
    expect(PIE_SEAM_EPSILON_RAD).toBeCloseTo((0.25 * Math.PI) / 180, 10);
  });
});
