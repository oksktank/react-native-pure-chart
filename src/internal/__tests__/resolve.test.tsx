// .tsx extension routes this file to the components jest project, where the
// real react-native module (Easing) resolves. No JSX inside.
import {
  colorAt,
  resolveAnimation,
  resolvePadding,
  resolveTheme,
  resolveXAxis,
  resolveYAxis,
} from '../resolve';
import { DARK_THEME, LIGHT_THEME } from '../../constants';

describe('resolveTheme', () => {
  it('defaults to the light theme', () => {
    expect(resolveTheme(undefined)).toEqual(LIGHT_THEME);
    expect(resolveTheme('light')).toEqual(LIGHT_THEME);
  });

  it('accepts the dark keyword', () => {
    expect(resolveTheme('dark')).toEqual(DARK_THEME);
  });

  it('merges a partial theme over light', () => {
    const theme = resolveTheme({ gridColor: 'red' });
    expect(theme.gridColor).toBe('red');
    expect(theme.labelColor).toBe(LIGHT_THEME.labelColor);
  });
});

describe('resolveAnimation', () => {
  it('defaults to an enabled 500ms grow with no delay and a working easing', () => {
    const animation = resolveAnimation(undefined);
    expect(animation.enabled).toBe(true);
    expect(animation.type).toBe('grow');
    expect(animation.duration).toBe(500);
    expect(animation.delay).toBe(0);
    expect(animation.easing(0)).toBeCloseTo(0);
    expect(animation.easing(1)).toBeCloseTo(1);
  });

  it('animate: false disables', () => {
    expect(resolveAnimation(false).enabled).toBe(false);
  });

  it("type 'none' disables", () => {
    expect(resolveAnimation({ type: 'none' }).enabled).toBe(false);
  });

  it('animate: true keeps the defaults enabled', () => {
    expect(resolveAnimation(true).enabled).toBe(true);
  });

  it('passes duration/delay/easing/type through', () => {
    const easing = (t: number) => t * t;
    const animation = resolveAnimation({
      type: 'fade',
      duration: 900,
      delay: 100,
      easing,
    });
    expect(animation).toEqual({
      enabled: true,
      type: 'fade',
      duration: 900,
      delay: 100,
      easing,
    });
  });
});

describe('resolveYAxis', () => {
  it('fills every default', () => {
    const yAxis = resolveYAxis(undefined);
    expect(yAxis.show).toBe(true);
    expect(yAxis.tickCount).toBe(5);
    expect(yAxis.min).toBeUndefined();
    expect(yAxis.max).toBeUndefined();
    expect(yAxis.showGridLines).toBe(true);
    expect(yAxis.gridLineStyle).toBe('dashed');
    expect(yAxis.showAxisLine).toBe(false);
    expect(yAxis.labelStyle).toBeUndefined();
    expect(yAxis.position).toBe('left');
  });

  it('the default formatLabel is compact formatting', () => {
    const yAxis = resolveYAxis(undefined);
    expect(yAxis.formatLabel(1234, 0)).toBe('1.2K');
    expect(yAxis.formatLabel(999, 0)).toBe('999');
  });

  it('honors every override', () => {
    const formatLabel = (v: number) => `${v}!`;
    const labelStyle = { color: 'red' };
    const yAxis = resolveYAxis({
      show: false,
      tickCount: 3,
      min: -10,
      max: 10,
      formatLabel,
      showGridLines: false,
      gridLineStyle: 'solid',
      showAxisLine: true,
      labelStyle,
      position: 'right',
    });
    expect(yAxis).toEqual({
      show: false,
      tickCount: 3,
      min: -10,
      max: 10,
      formatLabel,
      showGridLines: false,
      gridLineStyle: 'solid',
      showAxisLine: true,
      labelStyle,
      position: 'right',
    });
  });
});

describe('resolveXAxis', () => {
  it('fills every default', () => {
    const xAxis = resolveXAxis(undefined);
    expect(xAxis.show).toBe(true);
    expect(xAxis.interval).toBe('auto');
    expect(xAxis.showAxisLine).toBe(true);
    expect(xAxis.showGridLines).toBe(false);
    expect(xAxis.labelStyle).toBeUndefined();
  });

  it('the default formatLabel maps undefined to an empty string', () => {
    const xAxis = resolveXAxis(undefined);
    expect(xAxis.formatLabel(undefined, 0)).toBe('');
    expect(xAxis.formatLabel('Jan', 0)).toBe('Jan');
  });

  it('honors overrides', () => {
    const formatLabel = (l: string | undefined) => l ?? '-';
    const xAxis = resolveXAxis({
      show: false,
      interval: 2,
      formatLabel,
      showAxisLine: false,
      showGridLines: true,
    });
    expect(xAxis).toMatchObject({
      show: false,
      interval: 2,
      formatLabel,
      showAxisLine: false,
      showGridLines: true,
    });
  });
});

describe('resolvePadding', () => {
  it('expands a number to all four sides', () => {
    expect(resolvePadding(9)).toEqual({ top: 9, right: 9, bottom: 9, left: 9 });
  });

  it('a partial object gets the 12/12/0/0 defaults', () => {
    expect(resolvePadding({ left: 5 })).toEqual({
      top: 12,
      right: 12,
      bottom: 0,
      left: 5,
    });
  });

  it('undefined gets the full default', () => {
    expect(resolvePadding(undefined)).toEqual({
      top: 12,
      right: 12,
      bottom: 0,
      left: 0,
    });
  });
});

describe('colorAt', () => {
  const palette = ['#111111', '#222222', '#333333'];

  it('an explicit color wins', () => {
    expect(colorAt(palette, 0, 'gold')).toBe('gold');
  });

  it('cycles the palette modulo its length', () => {
    expect(colorAt(palette, 0)).toBe('#111111');
    expect(colorAt(palette, 3)).toBe('#111111');
    expect(colorAt(palette, 4)).toBe('#222222');
  });

  it('falls back to the default blue on an empty palette', () => {
    expect(colorAt([], 2)).toBe('#5B8FF9');
  });
});
