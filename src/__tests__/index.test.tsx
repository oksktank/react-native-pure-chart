// Gates the public API surface: adding or removing a runtime export must be
// a deliberate change that updates this list.
import * as api from '../index';

describe('public API', () => {
  it('exports exactly the documented runtime surface', () => {
    expect(Object.keys(api).sort()).toEqual([
      'BarChart',
      'DEFAULT_PALETTE',
      'LineChart',
      'PieChart',
    ]);
  });

  it('chart exports are components and the palette is populated', () => {
    expect(typeof api.BarChart).toBe('function');
    expect(typeof api.LineChart).toBe('function');
    expect(typeof api.PieChart).toBe('function');
    expect(api.DEFAULT_PALETTE.length).toBeGreaterThan(0);
  });
});
