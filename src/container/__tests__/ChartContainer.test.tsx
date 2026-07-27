import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ChartContainer, type ChartContainerProps } from '../ChartContainer';
import {
  countNodes,
  flatStyle,
  layout,
  paddingOf,
  themeOf,
  xAxisOf,
  yAxisOf,
} from '../../__tests__/helpers';

function props(
  overrides?: Partial<ChartContainerProps>
): Omit<ChartContainerProps, 'children'> {
  return {
    height: 200,
    padding: paddingOf(0),
    yDomain: { min: 0, max: 100, ticks: [0, 50, 100] },
    yAxis: yAxisOf(),
    xAxis: xAxisOf(),
    xLabels: ['A', 'B', 'C'],
    getXCenters: () => [50, 150, 250],
    theme: themeOf(undefined),
    testID: 'cc',
    ...overrides,
  };
}

describe('ChartContainer', () => {
  it('renders no plot children before onLayout, then passes the measured plot', async () => {
    const { queryByText, getByText, getByTestId } = await render(
      <ChartContainer {...props()}>
        {(plot) => <Text>{`plot:${plot.width}x${plot.height}`}</Text>}
      </ChartContainer>
    );
    expect(queryByText(/^plot:/)).toBeNull();

    await layout(getByTestId('cc-viewport'), 300, 200);
    expect(getByText('plot:300x200')).toBeTruthy();
  });

  it('yScale maps the domain max to padding.top and min to height - padding.bottom', async () => {
    const { getByText, getByTestId } = await render(
      <ChartContainer {...props({ padding: paddingOf({ top: 10, bottom: 20 }) })}>
        {(_plot, yScale) => <Text>{`y:${yScale(100)},${yScale(0)}`}</Text>}
      </ChartContainer>
    );
    await layout(getByTestId('cc-viewport'), 300, 200);
    expect(getByText('y:10,180')).toBeTruthy();
  });

  it('renders one y label per tick through formatLabel', async () => {
    const { getAllByText } = await render(
      <ChartContainer
        {...props({ yAxis: yAxisOf({ formatLabel: (v) => `y${v}` }) })}
      >
        {() => null}
      </ChartContainer>
    );
    // One invisible width-setting copy + one positioned copy.
    for (const text of ['y0', 'y50', 'y100']) {
      expect(getAllByText(text)).toHaveLength(2);
    }
  });

  it('renders no y labels when yAxis.show is false', async () => {
    const { queryByText } = await render(
      <ChartContainer {...props({ yAxis: yAxisOf({ show: false }) })}>
        {() => null}
      </ChartContainer>
    );
    expect(queryByText('50')).toBeNull();
  });

  it('renders dashed grid lines per tick only when showGridLines', async () => {
    const gridLine = (n: Parameters<typeof flatStyle>[0]) => {
      const s = flatStyle(n);
      return s.borderTopWidth === 1 && s.borderStyle === 'dashed';
    };
    const on = await render(
      <ChartContainer {...props()}>{() => null}</ChartContainer>
    );
    expect(countNodes(on.toJSON(), gridLine)).toBe(3);

    const off = await render(
      <ChartContainer {...props({ yAxis: yAxisOf({ showGridLines: false }) })}>
        {() => null}
      </ChartContainer>
    );
    expect(countNodes(off.toJSON(), gridLine)).toBe(0);
  });

  it('auto interval thins x labels when they would collide', async () => {
    const labels = Array.from({ length: 10 }, (_, i) => `Category-${i}`);
    const { getByTestId, getByText, queryByText } = await render(
      <ChartContainer
        {...props({
          xLabels: labels,
          getXCenters: (plot) =>
            labels.map((_, i) => (plot.width / 10) * (i + 0.5)),
        })}
      >
        {() => null}
      </ChartContainer>
    );
    await layout(getByTestId('cc-viewport'), 200, 200);
    // band 20px vs ~76px estimated label width → every 4th label.
    expect(getByText('Category-0')).toBeTruthy();
    expect(getByText('Category-4')).toBeTruthy();
    expect(getByText('Category-8')).toBeTruthy();
    expect(queryByText('Category-1')).toBeNull();
    expect(queryByText('Category-5')).toBeNull();
  });

  it('an explicit interval renders every nth label', async () => {
    const { getByTestId, getByText, queryByText } = await render(
      <ChartContainer
        {...props({
          xAxis: xAxisOf({ interval: 2 }),
          xLabels: ['A', 'B', 'C', 'D'],
          getXCenters: () => [25, 75, 125, 175],
        })}
      >
        {() => null}
      </ChartContainer>
    );
    await layout(getByTestId('cc-viewport'), 400, 200);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
    expect(queryByText('B')).toBeNull();
    expect(queryByText('D')).toBeNull();
  });

  it('renders no x-label row when every label is undefined', async () => {
    const { getByTestId, toJSON } = await render(
      <ChartContainer
        {...props({
          xLabels: [undefined, undefined, undefined],
          yAxis: yAxisOf({ show: false }),
        })}
      >
        {() => null}
      </ChartContainer>
    );
    await layout(getByTestId('cc-viewport'), 300, 200);
    expect(countNodes(toJSON(), (n) => n.type === 'Text')).toBe(0);
  });

  it('wraps the plot in a ScrollView only when the content overflows', async () => {
    const overflowing = await render(
      <ChartContainer {...props({ getContentWidth: () => 1000 })}>
        {(plot) => <Text>{`w:${plot.width}`}</Text>}
      </ChartContainer>
    );
    await layout(overflowing.getByTestId('cc-viewport'), 300, 200);
    expect(overflowing.getByTestId('cc-scroll')).toBeTruthy();
    expect(overflowing.getByText('w:1000')).toBeTruthy();

    const fitting = await render(
      <ChartContainer {...props({ getContentWidth: () => null })}>
        {(plot) => <Text>{`w:${plot.width}`}</Text>}
      </ChartContainer>
    );
    await layout(fitting.getByTestId('cc-viewport'), 300, 200);
    expect(fitting.queryByTestId('cc-scroll')).toBeNull();
    expect(fitting.getByText('w:300')).toBeTruthy();
  });

  it('scrollable: false never scrolls even when the content overflows', async () => {
    const { getByTestId, queryByTestId, getByText } = await render(
      <ChartContainer
        {...props({ getContentWidth: () => 1000, scrollable: false })}
      >
        {(plot) => <Text>{`w:${plot.width}`}</Text>}
      </ChartContainer>
    );
    await layout(getByTestId('cc-viewport'), 300, 200);
    expect(queryByTestId('cc-scroll')).toBeNull();
    // The content width still applies — it just clips instead of scrolling.
    expect(getByText('w:1000')).toBeTruthy();
  });

  it('exposes the accessibility label and image role on the root', async () => {
    const { getByLabelText } = await render(
      <ChartContainer {...props({ accessibilityLabel: 'revenue chart' })}>
        {() => null}
      </ChartContainer>
    );
    const root = getByLabelText('revenue chart');
    expect(root.props.accessibilityRole).toBe('image');
  });
});
