import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { PieSliceView } from '../PieSliceView';
import { flatStyle, findNodes, type JsonNode } from '../../__tests__/helpers';

describe('PieSliceView', () => {
  const startAngle = Math.PI / 3;
  const sweep = Math.PI / 2;

  it('rotates the outer wrapper to the start angle', async () => {
    const { toJSON } = await render(
      <PieSliceView startAngle={startAngle} sweep={sweep} color="gold" />
    );
    const style = flatStyle(toJSON() as JsonNode);
    expect(style.transform).toEqual([{ rotate: `${startAngle}rad` }]);
  });

  it('clips to the right half and rotates the color rect to sweep - π', async () => {
    const { toJSON } = await render(
      <PieSliceView startAngle={startAngle} sweep={sweep} color="gold" />
    );
    const tree = toJSON() as JsonNode;
    const clip = findNodes(tree, (n) => {
      const s = flatStyle(n);
      return s.left === '50%' && s.width === '50%' && s.overflow === 'hidden';
    });
    expect(clip).toHaveLength(1);

    const rect = findNodes(tree, (n) => flatStyle(n).backgroundColor === 'gold');
    expect(rect).toHaveLength(1);
    const rectStyle = flatStyle(rect[0]!);
    expect(rectStyle.transformOrigin).toBe('0% 50%');
    expect(rectStyle.transform).toEqual([
      { rotate: `${sweep - Math.PI}rad` },
    ]);
  });

  it('uses the animated rotation when rotateAnim is given', async () => {
    const progress = new Animated.Value(0);
    const rotateAnim = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [`${-Math.PI}rad`, `${sweep - Math.PI}rad`],
    });
    const { toJSON } = await render(
      <PieSliceView
        startAngle={startAngle}
        sweep={sweep}
        color="gold"
        rotateAnim={rotateAnim}
      />
    );
    const rect = findNodes(
      toJSON() as JsonNode,
      (n) => flatStyle(n).backgroundColor === 'gold'
    )[0]!;
    const transform = flatStyle(rect).transform as { rotate: string }[];
    // The animated rotation serializes at its current (initial) value — the
    // collapsed wedge — instead of the static fully-open angle.
    expect(transform[0]!.rotate).toBe(`${-Math.PI}rad`);
  });
});
