import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { Dot } from '../Dot';
import { flatStyle, type JsonNode } from '../../__tests__/helpers';

describe('Dot', () => {
  it('centers a 2r box on (x, y) with full border radius', async () => {
    const { toJSON } = await render(
      <Dot x={50} y={60} radius={5} color="teal" />
    );
    expect(flatStyle(toJSON() as JsonNode)).toMatchObject({
      position: 'absolute',
      left: 45,
      top: 55,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'teal',
    });
  });

  it('grows the box by borderWidth and applies the ring when borderColor is set', async () => {
    const { toJSON } = await render(
      <Dot x={50} y={60} radius={5} color="teal" borderColor="white" borderWidth={2} />
    );
    expect(flatStyle(toJSON() as JsonNode)).toMatchObject({
      left: 43,
      top: 53,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderColor: 'white',
      borderWidth: 2,
    });
  });

  it('ignores borderColor without a positive borderWidth', async () => {
    const { toJSON } = await render(
      <Dot x={0} y={0} radius={5} color="teal" borderColor="white" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style.borderWidth).toBeUndefined();
    expect(style.borderColor).toBeUndefined();
  });

  it('passes an animated opacity through', async () => {
    const progress = new Animated.Value(0);
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const { toJSON } = await render(
      <Dot x={0} y={0} radius={5} color="teal" opacity={opacity} />
    );
    expect(flatStyle(toJSON() as JsonNode).opacity).toBeDefined();
  });
});
