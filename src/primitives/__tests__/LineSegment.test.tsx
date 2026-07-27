import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { LineSegment } from '../LineSegment';
import { flatStyle, type JsonNode } from '../../__tests__/helpers';

const segment = { x: 10, y: 20, length: 50, angleRad: Math.PI / 4 };

describe('LineSegment', () => {
  it('anchors at (x, y - thickness/2) with width=length, height=thickness', async () => {
    const { toJSON } = await render(
      <LineSegment layout={segment} thickness={4} color="red" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style).toMatchObject({
      position: 'absolute',
      left: 10,
      top: 18,
      width: 50,
      height: 4,
      backgroundColor: 'red',
    });
  });

  it("rotates by angleRad around origin '0% 50%'", async () => {
    const { toJSON } = await render(
      <LineSegment layout={segment} thickness={2} color="red" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style.transformOrigin).toBe('0% 50%');
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
