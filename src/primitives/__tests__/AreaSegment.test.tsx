import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { AreaSegment } from '../AreaSegment';
import { AREA_SEAM_EPSILON } from '../../constants';
import { flatStyle, findNodes, type JsonNode } from '../../__tests__/helpers';

// A rightward segment from (0, 40) to (50, 40) above a baseline at 100.
const flat = { x: 0, y: 40, length: 50, angleRad: 0 };

describe('AreaSegment', () => {
  it('renders null for segments with no horizontal extent (dx <= 0)', async () => {
    const leftward = await render(
      <AreaSegment
        layout={{ x: 50, y: 40, length: 50, angleRad: Math.PI }}
        baselineY={100}
        color="blue"
      />
    );
    expect(leftward.toJSON()).toBeNull();

    const zeroLength = await render(
      <AreaSegment
        layout={{ x: 50, y: 40, length: 0, angleRad: Math.PI / 2 }}
        baselineY={100}
        color="blue"
      />
    );
    expect(zeroLength.toJSON()).toBeNull();
  });

  it('renders null when the segment lies entirely below the baseline', async () => {
    const { toJSON } = await render(
      <AreaSegment
        layout={{ x: 0, y: 120, length: 50, angleRad: 0 }}
        baselineY={100}
        color="blue"
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('the clipping wrapper spans [x, x+dx] × [top, baselineY] with overflow hidden', async () => {
    const { toJSON } = await render(
      <AreaSegment layout={flat} baselineY={100} color="blue" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style).toMatchObject({
      position: 'absolute',
      left: 0,
      top: 40,
      width: 50 + AREA_SEAM_EPSILON, // overlaps the next band to hide the seam
      height: 60,
      overflow: 'hidden',
    });
    // Bands are opaque; the caller owns the shared opacity layer.
    expect(style.opacity).toBeUndefined();
  });

  it('the inner rect overhangs by pad and rotates around the segment start', async () => {
    const { toJSON } = await render(
      <AreaSegment layout={flat} baselineY={100} color="blue" />
    );
    const inner = findNodes(
      toJSON() as JsonNode,
      (n) => flatStyle(n).backgroundColor === 'blue'
    );
    expect(inner).toHaveLength(1);
    const pad = 60 + 4; // wrapper height + 4
    expect(flatStyle(inner[0]!)).toMatchObject({
      left: -pad,
      top: 0,
      width: 50 + 2 * pad,
      height: pad,
      transformOrigin: [pad, 0, 0],
      transform: [{ rotate: '0rad' }],
    });
  });

  it('grow adds a scaleX transform on the wrapper', async () => {
    const progress = new Animated.Value(0);
    const grow = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const { toJSON } = await render(
      <AreaSegment
        layout={flat}
        baselineY={100}
        color="blue"
       
        grow={grow}
      />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style.transformOrigin).toBe('0% 50%');
    expect(Object.keys((style.transform as object[])[0]!)).toEqual(['scaleX']);
  });
});
