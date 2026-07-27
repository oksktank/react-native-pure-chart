import { render } from '@testing-library/react-native';
import { Legend } from '../Legend';
import { countNodes, flatStyle } from '../../__tests__/helpers';

describe('Legend', () => {
  it('renders nothing for an empty item list', async () => {
    const { toJSON } = await render(<Legend items={[]} labelColor="#000" />);
    expect(toJSON()).toBeNull();
  });

  it('renders a swatch with the item color and its label per item', async () => {
    const { getByText, toJSON } = await render(
      <Legend
        items={[
          { color: 'red', label: 'Sales' },
          { color: 'blue', label: 'Costs' },
        ]}
        labelColor="#333"
      />
    );
    expect(getByText('Sales')).toBeTruthy();
    expect(getByText('Costs')).toBeTruthy();
    for (const color of ['red', 'blue']) {
      expect(
        countNodes(toJSON(), (n) => {
          const s = flatStyle(n);
          return s.width === 9 && s.height === 9 && s.backgroundColor === color;
        })
      ).toBe(1);
    }
  });

  it('applies labelColor and merges labelStyle on top', async () => {
    const { getByText } = await render(
      <Legend
        items={[{ color: 'red', label: 'Sales' }]}
        labelColor="#333"
        labelStyle={{ color: 'purple', fontSize: 20 }}
      />
    );
    const style = flatStyle({
      type: 'Text',
      props: getByText('Sales').props as Record<string, unknown>,
      children: null,
    });
    expect(style.color).toBe('purple');
    expect(style.fontSize).toBe(20);
  });
});
