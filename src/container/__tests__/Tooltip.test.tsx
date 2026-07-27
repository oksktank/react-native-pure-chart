import { render } from '@testing-library/react-native';
import { Tooltip } from '../Tooltip';
import { countNodes, flatStyle, layout, themeOf } from '../../__tests__/helpers';
import type { JsonNode } from '../../__tests__/helpers';

const theme = themeOf(undefined);

describe('Tooltip', () => {
  it('renders the title and one row per entry', async () => {
    const { getByText } = await render(
      <Tooltip
        x={100}
        y={50}
        plotWidth={300}
        theme={theme}
        title="Jan"
        rows={[
          { color: 'red', name: 'A', text: '10' },
          { text: '20' },
        ]}
      />
    );
    expect(getByText('Jan')).toBeTruthy();
    expect(getByText(/10/)).toBeTruthy();
    expect(getByText(/20/)).toBeTruthy();
  });

  it('omits the title element for undefined or empty titles', async () => {
    for (const title of [undefined, '']) {
      const { toJSON } = await render(
        <Tooltip
          x={100}
          y={50}
          plotWidth={300}
          theme={theme}
          title={title}
          rows={[{ text: '10' }]}
        />
      );
      expect(countNodes(toJSON(), (n) => n.type === 'Text')).toBe(1);
    }
  });

  it('renders a color swatch only for rows that have a color', async () => {
    const { toJSON } = await render(
      <Tooltip
        x={100}
        y={50}
        plotWidth={300}
        theme={theme}
        rows={[{ color: 'red', name: 'A', text: '10' }, { text: '20' }]}
      />
    );
    const swatches = countNodes(toJSON(), (n) => {
      const s = flatStyle(n);
      return s.width === 7 && s.height === 7 && s.backgroundColor === 'red';
    });
    expect(swatches).toBe(1);
  });

  it('is invisible until measured, then clamps within the plot', async () => {
    const { root, toJSON } = await render(
      <Tooltip
        x={150}
        y={100}
        plotWidth={300}
        theme={theme}
        rows={[{ text: '10' }]}
      />
    );
    expect(flatStyle(toJSON() as JsonNode)).toMatchObject({
      opacity: 0,
      left: 0,
      top: 0,
    });

    await layout(root!, 100, 40);
    expect(flatStyle(toJSON() as JsonNode)).toMatchObject({
      opacity: 1,
      left: 100, // centered: 150 - 100/2
      top: 48, // above the anchor: 100 - 40 - 12
      backgroundColor: theme.tooltipBackgroundColor,
    });
  });

  it('clamps to the left edge for small x', async () => {
    const { root, toJSON } = await render(
      <Tooltip
        x={10}
        y={100}
        plotWidth={300}
        theme={theme}
        rows={[{ text: '10' }]}
      />
    );
    await layout(root!, 100, 40);
    expect(flatStyle(toJSON() as JsonNode).left).toBe(4);
  });

  it('clamps to the right edge for large x', async () => {
    const { root, toJSON } = await render(
      <Tooltip
        x={290}
        y={100}
        plotWidth={300}
        theme={theme}
        rows={[{ text: '10' }]}
      />
    );
    await layout(root!, 100, 40);
    expect(flatStyle(toJSON() as JsonNode).left).toBe(196); // 300 - 100 - 4
  });
});
