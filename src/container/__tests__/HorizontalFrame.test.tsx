import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { HorizontalFrame, type HorizontalFrameProps } from '../HorizontalFrame';
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
  overrides?: Partial<HorizontalFrameProps>
): Omit<HorizontalFrameProps, 'children'> {
  return {
    height: 200,
    padding: paddingOf(0),
    valueDomain: { min: 0, max: 100, ticks: [0, 50, 100] },
    valueAxis: yAxisOf(),
    categoryAxis: xAxisOf(),
    categoryLabels: ['A', 'B'],
    getCenters: () => [50, 150],
    theme: themeOf(undefined),
    testID: 'hf',
    ...overrides,
  };
}

describe('HorizontalFrame', () => {
  it('gates children on onLayout and passes the measured plot', async () => {
    const { queryByText, getByText, getByTestId } = await render(
      <HorizontalFrame {...props()}>
        {(plot) => <Text>{`plot:${plot.width}x${plot.height}`}</Text>}
      </HorizontalFrame>
    );
    expect(queryByText(/^plot:/)).toBeNull();

    await layout(getByTestId('hf-plot'), 300, 200);
    expect(getByText('plot:300x200')).toBeTruthy();
  });

  it('valueScale maps the domain across [padding.left, width - padding.right]', async () => {
    const { getByText, getByTestId } = await render(
      <HorizontalFrame
        {...props({ padding: paddingOf({ left: 10, right: 20, top: 0, bottom: 0 }) })}
      >
        {(_plot, valueScale) => (
          <Text>{`v:${valueScale(0)},${valueScale(100)}`}</Text>
        )}
      </HorizontalFrame>
    );
    await layout(getByTestId('hf-plot'), 300, 200);
    expect(getByText('v:10,280')).toBeTruthy();
  });

  it('renders category labels on the left', async () => {
    const { getAllByText } = await render(
      <HorizontalFrame {...props()}>{() => null}</HorizontalFrame>
    );
    expect(getAllByText('A').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('B').length).toBeGreaterThanOrEqual(1);
  });

  it('hides category labels when categoryAxis.show is false or labels are all undefined', async () => {
    const hidden = await render(
      <HorizontalFrame {...props({ categoryAxis: xAxisOf({ show: false }) })}>
        {() => null}
      </HorizontalFrame>
    );
    expect(hidden.queryByText('A')).toBeNull();

    const unlabeled = await render(
      <HorizontalFrame {...props({ categoryLabels: [undefined, undefined] })}>
        {() => null}
      </HorizontalFrame>
    );
    expect(countNodes(unlabeled.toJSON(), (n) => n.type === 'Text')).toBe(0);
  });

  it('renders bottom value tick labels once measured, hidden when valueAxis.show is false', async () => {
    const shown = await render(
      <HorizontalFrame
        {...props({ valueAxis: yAxisOf({ formatLabel: (v) => `v${v}` }) })}
      >
        {() => null}
      </HorizontalFrame>
    );
    expect(shown.queryByText('v50')).toBeNull(); // needs the measured scale
    await layout(shown.getByTestId('hf-plot'), 300, 200);
    for (const text of ['v0', 'v50', 'v100']) {
      expect(shown.getByText(text)).toBeTruthy();
    }

    const hidden = await render(
      <HorizontalFrame {...props({ valueAxis: yAxisOf({ show: false }) })}>
        {() => null}
      </HorizontalFrame>
    );
    await layout(hidden.getByTestId('hf-plot'), 300, 200);
    expect(hidden.queryByText('50')).toBeNull();
  });

  it('renders vertical dashed grid lines per tick when valueAxis.showGridLines', async () => {
    const gridLine = (n: Parameters<typeof flatStyle>[0]) => {
      const s = flatStyle(n);
      return s.borderLeftWidth === 1 && s.borderStyle === 'dashed';
    };
    const on = await render(
      <HorizontalFrame {...props()}>{() => null}</HorizontalFrame>
    );
    await layout(on.getByTestId('hf-plot'), 300, 200);
    expect(countNodes(on.toJSON(), gridLine)).toBe(3);

    const off = await render(
      <HorizontalFrame
        {...props({ valueAxis: yAxisOf({ showGridLines: false }) })}
      >
        {() => null}
      </HorizontalFrame>
    );
    await layout(off.getByTestId('hf-plot'), 300, 200);
    expect(countNodes(off.toJSON(), gridLine)).toBe(0);
  });
});
