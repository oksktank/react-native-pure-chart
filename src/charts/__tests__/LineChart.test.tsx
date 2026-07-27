import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { LineChart } from '../LineChart';
import {
  countNodes,
  findNodes,
  flatStyle,
  layout,
  pressAt,
  type JsonNode,
} from '../../__tests__/helpers';

// Fixed geometry used throughout: viewport 300, default height 220, default
// padding {top:12, right:12, bottom:0, left:0} → inner width 288, so three
// points sit at x = 0, 144, 288.
const VIEWPORT = 300;

const isDot = (n: JsonNode) => {
  const s = flatStyle(n);
  return s.borderRadius === 3 && s.backgroundColor === '#5B8FF9';
};
const isSegment = (n: JsonNode) => {
  const s = flatStyle(n);
  return s.height === 2 && s.transformOrigin === '0% 50%';
};
const isTooltip = (n: JsonNode) => {
  const s = flatStyle(n);
  return s.backgroundColor === '#111827' && s.position === 'absolute';
};

async function renderLine(element: React.ReactElement) {
  const result = await render(element);
  await layout(result.getByTestId('lc-viewport'), VIEWPORT, 220);
  return result;
}

describe('LineChart rendering', () => {
  it('renders n dots and n-1 segments for a numeric series after layout', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[10, 20, 30]} testID="lc" animate={false} />
    );
    expect(countNodes(toJSON(), isDot)).toBe(3);
    expect(countNodes(toJSON(), isSegment)).toBe(2);
  });

  it('renders nothing plot-side before layout fires', async () => {
    const { toJSON } = await render(
      <LineChart data={[10, 20, 30]} testID="lc" animate={false} />
    );
    expect(countNodes(toJSON(), isDot)).toBe(0);
    expect(countNodes(toJSON(), isSegment)).toBe(0);
  });

  it('renders an empty plot for empty data without crashing', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[]} testID="lc" animate={false} />
    );
    expect(countNodes(toJSON(), isDot)).toBe(0);
    expect(countNodes(toJSON(), isSegment)).toBe(0);
  });

  it('centers a single point with no segments', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[42]} testID="lc" animate={false} />
    );
    const dots = findNodes(toJSON(), isDot);
    expect(dots).toHaveLength(1);
    expect(countNodes(toJSON(), isSegment)).toBe(0);
    expect(flatStyle(dots[0]!).left).toBe(141); // centered at x=144, radius 3
  });

  it('uses the default accessibility label', async () => {
    const { getByLabelText } = await renderLine(
      <LineChart data={[10, 20, 30]} testID="lc" animate={false} />
    );
    expect(getByLabelText('Line chart, 1 series, 3 points')).toBeTruthy();
  });
});

describe('LineChart dev warnings', () => {
  let warnSpy: jest.SpyInstance;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns with the library prefix for non-array data', async () => {
    await renderLine(
      <LineChart data={'nope' as never} testID="lc" animate={false} />
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[react-native-pure-chart] `data` must be an array.'
    );
  });

  it('warns for non-finite values', async () => {
    await renderLine(
      <LineChart data={[1, NaN, 3]} testID="lc" animate={false} />
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Non-finite value NaN')
    );
  });

  it('warns for mixed series/point input', async () => {
    await renderLine(
      <LineChart
        data={[{ name: 'A', data: [1] }, 5] as never}
        testID="lc"
        animate={false}
      />
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Mixed series objects and plain points')
    );
  });
});

describe('LineChart interaction', () => {
  const labeled = [
    { value: 10, label: 'Jan' },
    { value: 20, label: 'Feb' },
    { value: 30, label: 'Mar' },
  ];

  it('press selects the nearest x index and fires onPointPress with the full payload', async () => {
    const onPointPress = jest.fn();
    const { getByTestId, getByText } = await renderLine(
      <LineChart
        data={labeled}
        testID="lc"
        animate={false}
        onPointPress={onPointPress}
        tooltip={{ formatValue: (v) => `v=${v}` }}
      />
    );
    await pressAt(getByTestId('lc-touch'), 150, 100);

    expect(getByText('v=20')).toBeTruthy(); // tooltip row
    expect(onPointPress).toHaveBeenCalledTimes(1);
    const event = onPointPress.mock.calls[0]![0];
    expect(event).toMatchObject({
      index: 1,
      seriesIndex: 0,
      value: 20,
      label: 'Feb',
      point: { value: 20, label: 'Feb' },
    });
    expect(event.position.x).toBe(144);
    expect(typeof event.position.y).toBe('number');
  });

  it('multi-series press resolves seriesIndex by vertical proximity', async () => {
    const onPointPress = jest.fn();
    const { getByTestId } = await renderLine(
      <LineChart
        data={[
          { name: 'A', data: [10, 20, 30] },
          { name: 'B', data: [30, 20, 10] },
        ]}
        testID="lc"
        animate={false}
        onPointPress={onPointPress}
      />
    );
    // x → index 0; y near the top of the plot → series B (value 30).
    await pressAt(getByTestId('lc-touch'), 0, 15);
    expect(onPointPress.mock.calls[0]![0]).toMatchObject({
      index: 0,
      seriesIndex: 1,
      value: 30,
      seriesName: 'B',
    });
  });

  it('pressing the selected index again dismisses the selection', async () => {
    const onSelectionChange = jest.fn();
    const { getByTestId, toJSON } = await renderLine(
      <LineChart
        data={labeled}
        testID="lc"
        animate={false}
        onSelectionChange={onSelectionChange}
      />
    );
    await pressAt(getByTestId('lc-touch'), 150, 100);
    expect(countNodes(toJSON(), isTooltip)).toBe(1);

    await pressAt(getByTestId('lc-touch'), 150, 100);
    expect(countNodes(toJSON(), isTooltip)).toBe(0);
    expect(onSelectionChange.mock.calls).toEqual([[1], [null]]);
  });

  it('tooltip: false keeps the press overlay for onPointPress but never shows a tooltip', async () => {
    const onPointPress = jest.fn();
    const { getByTestId, toJSON } = await renderLine(
      <LineChart
        data={labeled}
        testID="lc"
        animate={false}
        tooltip={false}
        onPointPress={onPointPress}
      />
    );
    await pressAt(getByTestId('lc-touch'), 150, 100);
    expect(onPointPress).toHaveBeenCalled();
    expect(countNodes(toJSON(), isTooltip)).toBe(0);
  });

  it('renders no press overlay at all when nothing is interactive', async () => {
    const { queryByTestId } = await renderLine(
      <LineChart data={labeled} testID="lc" animate={false} tooltip={false} />
    );
    expect(queryByTestId('lc-touch')).toBeNull();
  });

  it('a controlled selectedIndex shows the tooltip and marker without a press', async () => {
    const { toJSON } = await renderLine(
      <LineChart
        data={labeled}
        testID="lc"
        animate={false}
        selectedIndex={1}
      />
    );
    expect(countNodes(toJSON(), isTooltip)).toBe(1);
    // Selection ring: dot radius 3 + 2 with a 2px border → 7px radius box.
    expect(
      countNodes(toJSON(), (n) => {
        const s = flatStyle(n);
        return s.borderRadius === 7 && s.borderWidth === 2;
      })
    ).toBe(1);
  });

  it('a custom tooltip.render receives the press event', async () => {
    const { getByText } = await renderLine(
      <LineChart
        data={labeled}
        testID="lc"
        animate={false}
        selectedIndex={1}
        tooltip={{ render: (e) => <Text>{`custom-${e.value}`}</Text> }}
      />
    );
    expect(getByText('custom-20')).toBeTruthy();
  });
});

describe('LineChart missing values', () => {
  const gappy = [10, null, 30];

  it('break splits runs: no bridging segment, no dot at the gap', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={gappy} testID="lc" animate={false} />
    );
    expect(countNodes(toJSON(), isDot)).toBe(2);
    expect(countNodes(toJSON(), isSegment)).toBe(0); // two 1-point runs
  });

  it('zero draws the gap at 0 without a synthetic dot', async () => {
    const { toJSON } = await renderLine(
      <LineChart
        data={gappy}
        testID="lc"
        animate={false}
        missingValues="zero"
      />
    );
    expect(countNodes(toJSON(), isSegment)).toBe(2);
    expect(countNodes(toJSON(), isDot)).toBe(2); // synthetic point has no dot
  });

  it('interpolate bridges the gap without a synthetic dot', async () => {
    const { toJSON } = await renderLine(
      <LineChart
        data={gappy}
        testID="lc"
        animate={false}
        missingValues="interpolate"
      />
    );
    expect(countNodes(toJSON(), isSegment)).toBe(2);
    expect(countNodes(toJSON(), isDot)).toBe(2);
  });
});

describe('LineChart curves', () => {
  const data = [10, 20, 20, 5];

  it('step emits horizontal + vertical segments, skipping flat risers', async () => {
    const linear = await renderLine(
      <LineChart data={data} testID="lc" animate={false} />
    );
    expect(countNodes(linear.toJSON(), isSegment)).toBe(3);

    const step = await renderLine(
      <LineChart data={data} testID="lc" animate={false} curve="step" />
    );
    // 2 (rise) + 1 (flat) + 2 (fall) = 5
    expect(countNodes(step.toJSON(), isSegment)).toBe(5);
  });

  it('monotone samples more segments than linear', async () => {
    const monotone = await renderLine(
      <LineChart data={data} testID="lc" animate={false} curve="monotone" />
    );
    expect(countNodes(monotone.toJSON(), isSegment)).toBeGreaterThan(3);
  });
});

describe('LineChart area fill', () => {
  const isArea = (n: JsonNode) => {
    const s = flatStyle(n);
    return s.overflow === 'hidden' && typeof s.opacity === 'number';
  };

  it('renders fills at opacity 0.15 by default', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[10, 20, 30]} testID="lc" animate={false} area />
    );
    const areas = countNodes(
      toJSON(),
      (n) => isArea(n) && flatStyle(n).opacity === 0.15
    );
    expect(areas).toBe(2);
  });

  it('honors area.opacity', async () => {
    const { toJSON } = await renderLine(
      <LineChart
        data={[10, 20, 30]}
        testID="lc"
        animate={false}
        area={{ opacity: 0.4 }}
      />
    );
    expect(
      countNodes(toJSON(), (n) => isArea(n) && flatStyle(n).opacity === 0.4)
    ).toBe(2);
  });
});

describe('LineChart animation', () => {
  it('animate: false renders segments without scale transforms', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[10, 20, 30]} testID="lc" animate={false} />
    );
    const segments = countNodes(toJSON(), (n) => {
      const transform = flatStyle(n).transform as unknown[] | undefined;
      return isSegment(n) && transform?.length === 1;
    });
    expect(segments).toBe(2);
  });

  it('the default grow animation attaches a scaleX window to each segment', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[10, 20, 30]} testID="lc" />
    );
    const growing = countNodes(toJSON(), (n) => {
      const transform = flatStyle(n).transform as
        | Record<string, unknown>[]
        | undefined;
      return (
        isSegment(n) &&
        transform?.length === 2 &&
        'scaleX' in (transform[1] ?? {})
      );
    });
    expect(growing).toBe(2);
  });

  it('the fade animation wraps content in an opacity layer', async () => {
    const { toJSON } = await renderLine(
      <LineChart data={[10, 20, 30]} testID="lc" animate={{ type: 'fade' }} />
    );
    const wrapper = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return (
        s.left === 0 &&
        s.top === 0 &&
        s.right === 0 &&
        s.bottom === 0 &&
        s.opacity === 0 // progress starts at 0 under fake timers
      );
    });
    expect(wrapper).toBe(1);
  });
});

describe('LineChart scrolling and spacing', () => {
  it('many points enforce MIN_POINT_SPACING and activate scrolling', async () => {
    const data = Array.from({ length: 30 }, (_, i) => i);
    const { getByTestId } = await renderLine(
      <LineChart data={data} testID="lc" animate={false} />
    );
    // inner 288 / 29 ≈ 10px < 40px minimum → grows to 40 * 29 and scrolls.
    expect(getByTestId('lc-scroll')).toBeTruthy();
  });

  it('explicit spacing sets the content width and scrolls when needed', async () => {
    const { getByTestId, toJSON } = await renderLine(
      <LineChart data={[1, 2, 3, 4]} testID="lc" animate={false} spacing={100} />
    );
    expect(getByTestId('lc-scroll')).toBeTruthy();
    // Points sit 100px apart: dots at x = 0, 100, 200, 300 → left = x - 3.
    const lefts = new Set<number>();
    countNodes(toJSON(), (n) => {
      if (isDot(n)) lefts.add(flatStyle(n).left as number);
      return false;
    });
    expect(lefts).toEqual(new Set([-3, 97, 197, 297]));
  });

  it('few points fit the viewport without scrolling', async () => {
    const { queryByTestId } = await renderLine(
      <LineChart data={[1, 2, 3]} testID="lc" animate={false} />
    );
    expect(queryByTestId('lc-scroll')).toBeNull();
  });
});

describe('LineChart data point options', () => {
  it('showDataPoints: false hides the dots', async () => {
    const { toJSON } = await renderLine(
      <LineChart
        data={[10, 20, 30]}
        testID="lc"
        animate={false}
        showDataPoints={false}
      />
    );
    expect(countNodes(toJSON(), isDot)).toBe(0);
  });

  it('honors showDataPoints radius and color', async () => {
    const { toJSON } = await renderLine(
      <LineChart
        data={[10, 20, 30]}
        testID="lc"
        animate={false}
        showDataPoints={{ radius: 6, color: 'red' }}
      />
    );
    const custom = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return s.borderRadius === 6 && s.backgroundColor === 'red';
    });
    expect(custom).toBe(3);
  });

  it('renderDataPoint replaces the dots', async () => {
    const { getAllByText, toJSON } = await renderLine(
      <LineChart
        data={[10, 20, 30]}
        testID="lc"
        animate={false}
        renderDataPoint={() => <Text>pt</Text>}
      />
    );
    expect(getAllByText('pt')).toHaveLength(3);
    expect(countNodes(toJSON(), isDot)).toBe(0);
  });

  it('renderValueLabel renders once per real (non-synthetic) point', async () => {
    const { getByText, queryByText } = await renderLine(
      <LineChart
        data={[10, null, 30]}
        testID="lc"
        animate={false}
        missingValues="interpolate"
        renderValueLabel={(e) => <Text>{`vl-${e.value}`}</Text>}
      />
    );
    expect(getByText('vl-10')).toBeTruthy();
    expect(getByText('vl-30')).toBeTruthy();
    expect(queryByText('vl-20')).toBeNull(); // interpolated point
  });
});

describe('LineChart legend', () => {
  it('appears for multiple named series with a fallback name', async () => {
    const { getByText } = await renderLine(
      <LineChart
        data={[
          { name: 'Revenue', data: [1, 2] },
          { data: [3, 4] },
        ]}
        testID="lc"
        animate={false}
      />
    );
    expect(getByText('Revenue')).toBeTruthy();
    expect(getByText('Series 2')).toBeTruthy();
  });

  it('is hidden for a single series, unnamed series, or legend: false', async () => {
    const single = await renderLine(
      <LineChart
        data={[{ name: 'Solo', data: [1, 2] }]}
        testID="lc"
        animate={false}
      />
    );
    expect(single.queryByText('Solo')).toBeNull();

    const unnamed = await renderLine(
      <LineChart
        data={[{ data: [1] }, { data: [2] }]}
        testID="lc"
        animate={false}
      />
    );
    expect(unnamed.queryByText('Series 1')).toBeNull();

    const disabled = await renderLine(
      <LineChart
        data={[
          { name: 'A', data: [1] },
          { name: 'B', data: [2] },
        ]}
        testID="lc"
        animate={false}
        legend={false}
      />
    );
    expect(disabled.queryByText('A')).toBeNull();
  });
});
