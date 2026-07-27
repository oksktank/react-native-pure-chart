import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { PieChart } from '../PieChart';
import {
  countNodes,
  findNodes,
  flatStyle,
  pressAt,
  type JsonNode,
} from '../../__tests__/helpers';

// Default size 200 → center (100, 100), radius 100.

// Each slice piece clips to the right half of the circle.
const isClipWindow = (n: JsonNode) => {
  const s = flatStyle(n);
  return s.left === '50%' && s.width === '50%' && s.overflow === 'hidden';
};
// The main circle and the focus layer are the only 200×200 rounded clips.
const isCircleClip = (n: JsonNode) => {
  const s = flatStyle(n);
  return s.borderRadius === 100 && s.overflow === 'hidden';
};

describe('PieChart rendering', () => {
  it('renders one slice piece per computed piece (a >50% slice yields two)', async () => {
    const { toJSON } = await render(
      <PieChart
        data={[{ value: 30 }, { value: 70 }]}
        testID="pc"
        animate={false}
      />
    );
    expect(countNodes(toJSON(), isClipWindow)).toBe(3);
  });

  it('renders nothing but the frame for empty or all-zero data', async () => {
    const empty = await render(
      <PieChart data={[]} testID="pc" animate={false} />
    );
    expect(countNodes(empty.toJSON(), isClipWindow)).toBe(0);

    const zeros = await render(
      <PieChart data={[{ value: 0 }, { value: 0 }]} testID="pc" animate={false} />
    );
    expect(countNodes(zeros.toJSON(), isClipWindow)).toBe(0);
  });

  it('warns in __DEV__ when clamping invalid slice values', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await render(
      <PieChart
        data={[{ value: -5 }, { value: 10 }]}
        testID="pc"
        animate={false}
      />
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slice value -5 clamped to 0.')
    );
    warnSpy.mockRestore();
  });

  it('uses the default accessibility label', async () => {
    const { getByLabelText } = await render(
      <PieChart data={[{ value: 1 }, { value: 1 }]} testID="pc" animate={false} />
    );
    expect(getByLabelText('Pie chart, 2 slices')).toBeTruthy();
  });
});

describe('PieChart donut hole', () => {
  const findHole = (tree: ReturnType<typeof Object> | null) =>
    findNodes(tree as JsonNode, (n) => {
      const s = flatStyle(n);
      return typeof s.borderRadius === 'number' && s.borderRadius < 100 && s.width === s.height && typeof s.width === 'number';
    });

  it('a numeric innerRadius renders a centered hole with the light default color', async () => {
    const { toJSON } = await render(
      <PieChart
        data={[{ value: 1 }]}
        testID="pc"
        animate={false}
        innerRadius={50}
      />
    );
    const holes = findHole(toJSON());
    expect(holes).toHaveLength(1);
    expect(flatStyle(holes[0]!)).toMatchObject({
      left: 50,
      top: 50,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#FFFFFF',
    });
  });

  it('a percentage innerRadius is parsed against size/2', async () => {
    const { toJSON } = await render(
      <PieChart
        data={[{ value: 1 }]}
        testID="pc"
        animate={false}
        innerRadius="60%"
      />
    );
    const holes = findHole(toJSON());
    expect(flatStyle(holes[0]!)).toMatchObject({
      width: 120,
      height: 120,
      borderRadius: 60,
    });
  });

  it('honors holeColor and the dark-theme default', async () => {
    const custom = await render(
      <PieChart
        data={[{ value: 1 }]}
        testID="pc"
        animate={false}
        innerRadius={40}
        holeColor="pink"
      />
    );
    expect(flatStyle(findHole(custom.toJSON())[0]!).backgroundColor).toBe(
      'pink'
    );

    const dark = await render(
      <PieChart
        data={[{ value: 1 }]}
        testID="pc"
        animate={false}
        innerRadius={40}
        theme="dark"
      />
    );
    expect(flatStyle(findHole(dark.toJSON())[0]!).backgroundColor).toBe(
      '#111827'
    );
  });
});

describe('PieChart interaction', () => {
  const halves = [
    { value: 1, label: 'Right' },
    { value: 1, label: 'Left' },
  ];

  it('press inside a slice fires onSlicePress and focuses the slice', async () => {
    const onSlicePress = jest.fn();
    const { getByTestId, toJSON } = await render(
      <PieChart
        data={halves}
        testID="pc"
        animate={false}
        onSlicePress={onSlicePress}
      />
    );
    expect(countNodes(toJSON(), isCircleClip)).toBe(1);

    await pressAt(getByTestId('pc-touch'), 150, 100); // right half → slice 0
    expect(onSlicePress).toHaveBeenCalledWith({
      slice: halves[0],
      index: 0,
      value: 1,
      percentage: 0.5,
    });
    // The focused slice moves to a second, offset circle clip.
    expect(countNodes(toJSON(), isCircleClip)).toBe(2);
  });

  it('press in the donut hole hits nothing and clears the selection', async () => {
    const onSlicePress = jest.fn();
    const onSelectionChange = jest.fn();
    const { getByTestId } = await render(
      <PieChart
        data={halves}
        testID="pc"
        animate={false}
        innerRadius={80}
        onSlicePress={onSlicePress}
        onSelectionChange={onSelectionChange}
      />
    );
    await pressAt(getByTestId('pc-touch'), 100, 100);
    expect(onSlicePress).not.toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith(null);
  });

  it('pressing the selected slice again deselects it', async () => {
    const onSelectionChange = jest.fn();
    const { getByTestId, toJSON } = await render(
      <PieChart
        data={halves}
        testID="pc"
        animate={false}
        onSelectionChange={onSelectionChange}
      />
    );
    await pressAt(getByTestId('pc-touch'), 150, 100);
    expect(countNodes(toJSON(), isCircleClip)).toBe(2);
    await pressAt(getByTestId('pc-touch'), 150, 100);
    expect(countNodes(toJSON(), isCircleClip)).toBe(1);
    expect(onSelectionChange.mock.calls).toEqual([[0], [null]]);
  });

  it('focusOnPress: false with no handlers renders no press overlay', async () => {
    const { queryByTestId } = await render(
      <PieChart
        data={halves}
        testID="pc"
        animate={false}
        focusOnPress={false}
      />
    );
    expect(queryByTestId('pc-touch')).toBeNull();
  });

  it('a controlled selectedIndex focuses without a press', async () => {
    const { toJSON } = await render(
      <PieChart data={halves} testID="pc" animate={false} selectedIndex={0} />
    );
    expect(countNodes(toJSON(), isCircleClip)).toBe(2);
  });
});

describe('PieChart slice labels', () => {
  const halves = [
    { value: 1, label: 'Right' },
    { value: 3, label: 'Left' },
  ];

  it('renders percent, label, value, and custom function labels', async () => {
    const percent = await render(
      <PieChart data={halves} testID="pc" animate={false} legend={false} sliceLabel="percent" />
    );
    expect(percent.getByText('25%')).toBeTruthy();
    expect(percent.getByText('75%')).toBeTruthy();

    const label = await render(
      <PieChart data={halves} testID="pc" animate={false} legend={false} sliceLabel="label" />
    );
    expect(label.getByText('Right')).toBeTruthy();
    expect(label.getByText('Left')).toBeTruthy();

    const value = await render(
      <PieChart data={halves} testID="pc" animate={false} legend={false} sliceLabel="value" />
    );
    expect(value.getByText('1')).toBeTruthy();
    expect(value.getByText('3')).toBeTruthy();

    const custom = await render(
      <PieChart
        data={halves}
        testID="pc"
        animate={false}
        legend={false}
        sliceLabel={(e) => `s${e.index}`}
      />
    );
    expect(custom.getByText('s0')).toBeTruthy();
    expect(custom.getByText('s1')).toBeTruthy();
  });

  it("the default 'none' renders no slice labels", async () => {
    const { queryByText } = await render(
      <PieChart data={halves} testID="pc" animate={false} legend={false} />
    );
    expect(queryByText('25%')).toBeNull();
    expect(queryByText('Right')).toBeNull();
  });

  it('renderCenterLabel gets null initially and the event after a press', async () => {
    const { getByText, getByTestId } = await render(
      <PieChart
        data={halves}
        testID="pc"
        animate={false}
        renderCenterLabel={(e) => <Text>{e ? `c-${e.index}` : 'c-none'}</Text>}
      />
    );
    expect(getByText('c-none')).toBeTruthy();
    await pressAt(getByTestId('pc-touch'), 150, 60); // right half → slice 0
    expect(getByText('c-0')).toBeTruthy();
  });
});

describe('PieChart legend', () => {
  it('lists only labeled slices', async () => {
    const { getByText, toJSON } = await render(
      <PieChart
        data={[{ value: 1, label: 'Named' }, { value: 1 }]}
        testID="pc"
        animate={false}
      />
    );
    expect(getByText('Named')).toBeTruthy();
    // Only one legend swatch (9×9) exists.
    expect(
      countNodes(toJSON(), (n) => {
        const s = flatStyle(n);
        return s.width === 9 && s.height === 9;
      })
    ).toBe(1);
  });

  it('legend.position "top" renders the legend before the pie', async () => {
    const { toJSON } = await render(
      <PieChart
        data={[{ value: 1, label: 'Named' }]}
        testID="pc"
        animate={false}
        size={100}
        legend={{ position: 'top' }}
      />
    );
    const root = toJSON() as JsonNode;
    const children = (root.children ?? []) as JsonNode[];
    // First child is the legend row, second the size×size pie box.
    expect(flatStyle(children[0]!)).toMatchObject({ marginBottom: 10 });
    expect(flatStyle(children[1]!)).toMatchObject({ width: 100, height: 100 });
  });

  it('legend: false hides it', async () => {
    const { queryByText } = await render(
      <PieChart
        data={[{ value: 1, label: 'Named' }]}
        testID="pc"
        animate={false}
        legend={false}
      />
    );
    expect(queryByText('Named')).toBeNull();
  });
});

describe('PieChart animation', () => {
  const findColorRects = (tree: JsonNode | null) =>
    findNodes(tree as JsonNode, (n) => {
      const s = flatStyle(n);
      return s.backgroundColor === '#5B8FF9' && s.transformOrigin === '0% 50%';
    });

  it('animate: false rotates the color rect to its static angle', async () => {
    const { toJSON } = await render(
      <PieChart data={[{ value: 1 }, { value: 1 }]} testID="pc" animate={false} />
    );
    const rects = findColorRects(toJSON() as JsonNode);
    expect(rects.length).toBeGreaterThanOrEqual(1);
    const transform = flatStyle(rects[0]!).transform as { rotate: string }[];
    // Half-circle slice (+ seam epsilon, capped at π) → sweep - π = 0.
    expect(transform[0]!.rotate).toBe('0rad');
  });

  it('grow starts every wedge collapsed at -π', async () => {
    const { toJSON } = await render(
      <PieChart data={[{ value: 1 }, { value: 1 }]} testID="pc" />
    );
    const rects = findColorRects(toJSON() as JsonNode);
    const transform = flatStyle(rects[0]!).transform as { rotate: string }[];
    expect(transform[0]!.rotate).toBe(`${-Math.PI}rad`);
  });

  it('fade renders the circle at the initial animated opacity', async () => {
    const { toJSON } = await render(
      <PieChart
        data={[{ value: 1 }, { value: 1 }]}
        testID="pc"
        animate={{ type: 'fade' }}
      />
    );
    const faded = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return isCircleClip(n) && s.opacity === 0;
    });
    expect(faded).toBe(1);
  });
});
