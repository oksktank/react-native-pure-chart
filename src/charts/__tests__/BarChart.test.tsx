import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { BarChart } from '../BarChart';
import {
  countNodes,
  findNodes,
  flatStyle,
  layout,
  pressAt,
  type JsonNode,
} from '../../__tests__/helpers';

// Fixed geometry: viewport 300, default height 220, default padding
// {top:12, right:12, bottom:0, left:0} → the bar layout works on 288px.
const VIEWPORT = 300;
const COLOR_0 = '#5B8FF9';
const COLOR_1 = '#61DDAA';

// Bars are the only absolutely positioned colored boxes without the uniform
// borderRadius that legend/tooltip swatches and dots carry.
const isBarOf = (color: string) => (n: JsonNode) => {
  const s = flatStyle(n);
  return (
    s.position === 'absolute' &&
    s.backgroundColor === color &&
    s.borderRadius === undefined
  );
};
const isTooltip = (n: JsonNode) => {
  const s = flatStyle(n);
  return s.backgroundColor === '#111827' && s.position === 'absolute';
};

async function renderVertical(element: React.ReactElement) {
  const result = await render(element);
  await layout(result.getByTestId('bc-viewport'), VIEWPORT, 220);
  return result;
}

async function renderHorizontal(element: React.ReactElement) {
  const result = await render(element);
  await layout(result.getByTestId('bc-plot'), VIEWPORT, 220);
  return result;
}

describe('BarChart rendering', () => {
  it('renders seriesCount × categoryCount bars, skipping nulls', async () => {
    const { toJSON } = await renderVertical(
      <BarChart
        data={[
          { name: 'A', data: [10, 20, 30] },
          { name: 'B', data: [5, null, 15] },
        ]}
        testID="bc"
        animate={false}
        legend={false}
      />
    );
    expect(countNodes(toJSON(), isBarOf(COLOR_0))).toBe(3);
    expect(countNodes(toJSON(), isBarOf(COLOR_1))).toBe(2);
  });

  it('renders an empty frame for empty data without crashing', async () => {
    const { toJSON } = await renderVertical(
      <BarChart data={[]} testID="bc" animate={false} />
    );
    expect(countNodes(toJSON(), isBarOf(COLOR_0))).toBe(0);
  });

  it('warns in __DEV__ on invalid data', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await renderVertical(
      <BarChart data={[1, Infinity]} testID="bc" animate={false} />
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Non-finite value Infinity')
    );
    warnSpy.mockRestore();
  });

  it('positive and negative bars extend from the zero baseline with matching corners', async () => {
    const { toJSON } = await renderVertical(
      <BarChart data={[10, -5]} testID="bc" animate={false} />
    );
    const bars = findNodes(toJSON(), isBarOf(COLOR_0));
    expect(bars).toHaveLength(2);
    const [positive, negative] = bars.map(flatStyle);
    expect(positive!.borderTopLeftRadius).toBe(4);
    expect(positive!.borderBottomLeftRadius).toBeUndefined();
    expect(negative!.borderBottomLeftRadius).toBe(4);
    expect(negative!.borderTopLeftRadius).toBeUndefined();
    // The positive bar ends where the negative bar begins (zero line).
    const positiveBottom =
      (positive!.top as number) + (positive!.height as number);
    expect(negative!.top).toBeCloseTo(positiveBottom);
  });

  it('a per-point color overrides the series color', async () => {
    const { toJSON } = await renderVertical(
      <BarChart
        data={[{ value: 1, color: 'tomato' }, { value: 2 }]}
        testID="bc"
        animate={false}
      />
    );
    expect(countNodes(toJSON(), isBarOf('tomato'))).toBe(1);
    expect(countNodes(toJSON(), isBarOf(COLOR_0))).toBe(1);
  });

  it('respects explicit yAxis min/max in the tick labels', async () => {
    const { getAllByText } = await renderVertical(
      <BarChart
        data={[10, 20]}
        testID="bc"
        animate={false}
        yAxis={{ min: 0, max: 50 }}
      />
    );
    expect(getAllByText('50')).toHaveLength(2); // hidden + positioned copies
  });

  it('uses the default accessibility label', async () => {
    const { getByLabelText } = await renderVertical(
      <BarChart data={[1, 2, 3]} testID="bc" animate={false} />
    );
    expect(getByLabelText('Bar chart, 1 series, 3 categories')).toBeTruthy();
  });
});

describe('BarChart interaction', () => {
  const labeled = [
    { name: 'A', data: [{ value: 10, label: 'Q1' }, { value: 20, label: 'Q2' }, { value: 30, label: 'Q3' }] },
    { name: 'B', data: [5, 25, 15] },
  ];

  it('press maps locationX to the category band and lists one tooltip row per series', async () => {
    const onPointPress = jest.fn();
    const { getByTestId, getByText } = await renderVertical(
      <BarChart
        data={labeled}
        testID="bc"
        animate={false}
        legend={false}
        onPointPress={onPointPress}
        tooltip={{ formatValue: (v) => `v=${v}` }}
      />
    );
    // band = 288 / 3 = 96 → x=150 lands in category 1.
    await pressAt(getByTestId('bc-touch'), 150, 100);
    expect(getByText(/v=20/)).toBeTruthy();
    expect(getByText(/v=25/)).toBeTruthy();
    const event = onPointPress.mock.calls[0]![0];
    expect(event.index).toBe(1);
    // x=150 is nearest series B's slot center within the band.
    expect(event.seriesIndex).toBe(1);
    expect(event.value).toBe(25);
  });

  it('pressing the selected category again dismisses it', async () => {
    const onSelectionChange = jest.fn();
    const { getByTestId, toJSON } = await renderVertical(
      <BarChart
        data={[10, 20, 30]}
        testID="bc"
        animate={false}
        onSelectionChange={onSelectionChange}
      />
    );
    await pressAt(getByTestId('bc-touch'), 150, 100);
    expect(countNodes(toJSON(), isTooltip)).toBe(1);
    await pressAt(getByTestId('bc-touch'), 150, 100);
    expect(countNodes(toJSON(), isTooltip)).toBe(0);
    expect(onSelectionChange.mock.calls).toEqual([[1], [null]]);
  });

  it('selection dims the other categories to 0.35 opacity', async () => {
    const { getByTestId, toJSON } = await renderVertical(
      <BarChart
        data={[
          { name: 'A', data: [10, 20, 30] },
          { name: 'B', data: [5, 25, 15] },
        ]}
        testID="bc"
        animate={false}
        legend={false}
      />
    );
    await pressAt(getByTestId('bc-touch'), 150, 100);
    const dimmed = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return s.opacity === 0.35 && s.backgroundColor !== undefined;
    });
    expect(dimmed).toBe(4); // 2 series × 2 unselected categories
  });
});

describe('BarChart sizing and scrolling', () => {
  it('an explicit barWidth forces scrolling when the bands exceed the viewport', async () => {
    const { getByTestId, toJSON } = await renderVertical(
      <BarChart data={[1, 2, 3]} testID="bc" animate={false} barWidth={100} />
    );
    expect(getByTestId('bc-scroll')).toBeTruthy();
    const bars = findNodes(toJSON(), isBarOf(COLOR_0));
    expect(flatStyle(bars[0]!).width).toBe(100);
  });

  it('auto mode activates scrolling below the minimum band width', async () => {
    const many = Array.from({ length: 10 }, (_, i) => i + 1);
    const { getByTestId } = await renderVertical(
      <BarChart data={many} testID="bc" animate={false} />
    );
    // 288 / 10 = 28.8px per band < 36px minimum → grow and scroll.
    expect(getByTestId('bc-scroll')).toBeTruthy();
  });

  it('few categories fit the viewport without scrolling', async () => {
    const { queryByTestId } = await renderVertical(
      <BarChart data={[1, 2, 3]} testID="bc" animate={false} />
    );
    expect(queryByTestId('bc-scroll')).toBeNull();
  });
});

describe('BarChart stacked', () => {
  const stackedData = [
    { name: 'A', data: [10, 20] },
    { name: 'B', data: [5, 10] },
  ];

  it('stacks one slot per category and rounds only the outer segments', async () => {
    const { toJSON } = await renderVertical(
      <BarChart
        data={stackedData}
        testID="bc"
        animate={false}
        legend={false}
        stacked
      />
    );
    expect(countNodes(toJSON(), isBarOf(COLOR_0))).toBe(2);
    expect(countNodes(toJSON(), isBarOf(COLOR_1))).toBe(2);
    // Series B sits on top of the stack → only its segments get top corners.
    const rounded = findNodes(
      toJSON(),
      (n) => flatStyle(n).borderTopLeftRadius === 4
    );
    expect(rounded).toHaveLength(2);
    for (const node of rounded) {
      expect(flatStyle(node).backgroundColor).toBe(COLOR_1);
    }
  });

  it('the stacked domain uses cumulative totals', async () => {
    const { getAllByText } = await renderVertical(
      <BarChart
        data={stackedData}
        testID="bc"
        animate={false}
        legend={false}
        stacked
      />
    );
    // Totals reach 30 → the 30 tick must exist.
    expect(getAllByText('30').length).toBeGreaterThanOrEqual(1);
  });

  it('stacks negatives downward with bottom rounding', async () => {
    const { toJSON } = await renderVertical(
      <BarChart
        data={[
          { name: 'A', data: [-10] },
          { name: 'B', data: [-5] },
        ]}
        testID="bc"
        animate={false}
        legend={false}
        stacked
      />
    );
    const rounded = findNodes(
      toJSON(),
      (n) => flatStyle(n).borderBottomLeftRadius === 4
    );
    expect(rounded).toHaveLength(1);
    expect(flatStyle(rounded[0]!).backgroundColor).toBe(COLOR_1);
  });
});

describe('BarChart horizontal', () => {
  it('renders category labels on the left and bars from the zero line', async () => {
    const { getAllByText, toJSON } = await renderHorizontal(
      <BarChart
        data={[
          { value: 10, label: 'Alpha' },
          { value: 20, label: 'Beta' },
        ]}
        testID="bc"
        animate={false}
        horizontal
      />
    );
    expect(getAllByText('Alpha').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Beta').length).toBeGreaterThanOrEqual(1);
    const bars = findNodes(toJSON(), isBarOf(COLOR_0));
    expect(bars).toHaveLength(2);
    // Positive horizontal bars share their left edge at the zero line.
    const [a, b] = bars.map(flatStyle);
    expect(a!.left).toBe(b!.left);
    expect(a!.width).not.toBe(b!.width);
  });

  it('press maps locationY to the category', async () => {
    const onPointPress = jest.fn();
    const { getByTestId } = await renderHorizontal(
      <BarChart
        data={[10, 20]}
        testID="bc"
        animate={false}
        horizontal
        onPointPress={onPointPress}
      />
    );
    // plot height 220 - top padding 12 → 208 → band 104. y=150 → category 1.
    await pressAt(getByTestId('bc-touch'), 100, 150);
    expect(onPointPress.mock.calls[0]![0]).toMatchObject({
      index: 1,
      seriesIndex: 0,
      value: 20,
    });
  });

  it('renders the horizontal stacked branch', async () => {
    const { toJSON } = await renderHorizontal(
      <BarChart
        data={[
          { name: 'A', data: [10, 20] },
          { name: 'B', data: [5, 10] },
        ]}
        testID="bc"
        animate={false}
        legend={false}
        horizontal
        stacked
      />
    );
    expect(countNodes(toJSON(), isBarOf(COLOR_0))).toBe(2);
    expect(countNodes(toJSON(), isBarOf(COLOR_1))).toBe(2);
    // Outer positive segments get right-side rounding.
    expect(
      countNodes(toJSON(), (n) => flatStyle(n).borderTopRightRadius === 4)
    ).toBe(2);
  });
});

describe('BarChart animation', () => {
  it('grow anchors vertical bars to the baseline with a scaleY window', async () => {
    const { toJSON } = await renderVertical(
      <BarChart data={[10, 20]} testID="bc" />
    );
    const growing = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      const transform = s.transform as Record<string, unknown>[] | undefined;
      return (
        s.transformOrigin === '50% 100%' &&
        transform?.length === 1 &&
        'scaleY' in (transform[0] ?? {})
      );
    });
    expect(growing).toBe(2);
  });

  it('grow anchors horizontal bars with a scaleX window', async () => {
    const { toJSON } = await renderHorizontal(
      <BarChart data={[10, 20]} testID="bc" horizontal />
    );
    const growing = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      const transform = s.transform as Record<string, unknown>[] | undefined;
      return (
        s.transformOrigin === '0% 50%' &&
        transform?.length === 1 &&
        'scaleX' in (transform[0] ?? {})
      );
    });
    expect(growing).toBe(2);
  });

  it('fade renders bars at the initial animated opacity', async () => {
    const { toJSON } = await renderVertical(
      <BarChart data={[10, 20]} testID="bc" animate={{ type: 'fade' }} />
    );
    const faded = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return s.backgroundColor === COLOR_0 && s.opacity === 0;
    });
    expect(faded).toBe(2);
  });

  it('animate: false renders bars without transforms or opacity', async () => {
    const { toJSON } = await renderVertical(
      <BarChart data={[10, 20]} testID="bc" animate={false} />
    );
    const plain = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return (
        s.backgroundColor === COLOR_0 &&
        s.transform === undefined &&
        s.opacity === undefined
      );
    });
    expect(plain).toBe(2);
  });
});

describe('BarChart extras', () => {
  it('renderValueLabel renders above each bar in non-stacked mode', async () => {
    const { getByText } = await renderVertical(
      <BarChart
        data={[10, 20]}
        testID="bc"
        animate={false}
        renderValueLabel={(e) => <Text>{`vl-${e.value}`}</Text>}
      />
    );
    expect(getByText('vl-10')).toBeTruthy();
    expect(getByText('vl-20')).toBeTruthy();
  });

  it('renderValueLabel is ignored in stacked mode', async () => {
    const { queryByText } = await renderVertical(
      <BarChart
        data={[
          { name: 'A', data: [10] },
          { name: 'B', data: [5] },
        ]}
        testID="bc"
        animate={false}
        legend={false}
        stacked
        renderValueLabel={(e) => <Text>{`vl-${e.value}`}</Text>}
      />
    );
    expect(queryByText('vl-10')).toBeNull();
  });

  it('shows a legend for named multi-series and hides it on demand', async () => {
    const shown = await renderVertical(
      <BarChart
        data={[
          { name: 'A', data: [1] },
          { name: 'B', data: [2] },
        ]}
        testID="bc"
        animate={false}
      />
    );
    expect(shown.getByText('A')).toBeTruthy();
    expect(shown.getByText('B')).toBeTruthy();

    const hidden = await renderVertical(
      <BarChart
        data={[
          { name: 'A', data: [1] },
          { name: 'B', data: [2] },
        ]}
        testID="bc"
        animate={false}
        legend={false}
      />
    );
    expect(hidden.queryByText('A')).toBeNull();
  });
});
