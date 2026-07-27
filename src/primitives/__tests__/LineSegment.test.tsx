import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { LineSegment } from '../LineSegment';
import { flatStyle, type JsonNode } from '../../__tests__/helpers';

const segment = { x: 10, y: 20, length: 50, angleRad: Math.PI / 4 };

describe('LineSegment', () => {
  it('is a round-cap stroke: overhangs each end by thickness/2, fully rounded', async () => {
    const { toJSON } = await render(
      <LineSegment layout={segment} thickness={4} color="red" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style).toMatchObject({
      position: 'absolute',
      left: 8, // x - cap
      top: 18, // y - cap
      width: 54, // length + 2 * cap
      height: 4,
      borderRadius: 2,
      backgroundColor: 'red',
    });
    // The cap discs are centred on the two data points, so consecutive
    // segments overlap in a full disc at the joint — no gap, no seam.
    const left = style.left as number;
    const cap = (style.borderRadius as number) ?? 0;
    expect(left + cap).toBe(segment.x);
    expect(left + (style.width as number) - cap).toBe(segment.x + segment.length);
  });

  it('rotates by angleRad around the segment start despite the cap overhang', async () => {
    const { toJSON } = await render(
      <LineSegment layout={segment} thickness={2} color="red" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style.transformOrigin).toEqual([1, 1, 0]);
    expect(style.transform).toEqual([{ rotate: `${Math.PI / 4}rad` }]);
  });

  it('appends a scaleX transform when grow is provided', async () => {
    const progress = new Animated.Value(0);
    const grow = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const { toJSON } = await render(
      <LineSegment layout={segment} thickness={2} color="red" grow={grow} />
    );
    const transform = flatStyle(toJSON() as JsonNode).transform as unknown[];
    expect(transform).toHaveLength(2);
    expect(Object.keys(transform[1] as object)).toEqual(['scaleX']);
  });
});
