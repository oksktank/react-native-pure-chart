import { Text, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { AXIS_FONT_SIZE } from '../constants';

export interface LegendItem {
  color: string;
  label: string;
}

export interface LegendProps {
  items: readonly LegendItem[];
  labelColor: string;
  labelStyle?: StyleProp<TextStyle>;
}

export function Legend({ items, labelColor, labelStyle }: LegendProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 14,
        rowGap: 4,
        marginTop: 10,
      }}
    >
      {items.map((item, i) => (
        <View
          key={i}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
        >
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 4.5,
              backgroundColor: item.color,
            }}
          />
          <Text
            style={[
              { fontSize: AXIS_FONT_SIZE + 1, color: labelColor },
              labelStyle,
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
