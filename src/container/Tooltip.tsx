import { useState } from 'react';
import { Text, View } from 'react-native';
import type { ChartTheme } from '../types';
import { AXIS_FONT_SIZE } from '../constants';

export interface TooltipRow {
  color?: string;
  name?: string;
  text: string;
}

export interface TooltipProps {
  /** Anchor point in plot coordinates (tooltip renders above it). */
  x: number;
  y: number;
  plotWidth: number;
  theme: Required<ChartTheme>;
  title?: string;
  rows: readonly TooltipRow[];
}

/**
 * Built-in tooltip: measures itself once, then clamps within the plot.
 * Replaces the legacy `marginLeft: x - 60` hardcoded anchoring.
 */
export function Tooltip({ x, y, plotWidth, theme, title, rows }: TooltipProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const left = size
    ? Math.max(4, Math.min(x - size.w / 2, plotWidth - size.w - 4))
    : 0;
  const top = size ? Math.max(4, y - size.h - 12) : 0;

  return (
    <View
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (!size || size.w !== width || size.h !== height) {
          setSize({ w: width, h: height });
        }
      }}
      style={{
        position: 'absolute',
        left,
        top,
        opacity: size ? 1 : 0,
        backgroundColor: theme.tooltipBackgroundColor,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 2,
        maxWidth: 220,
      }}
    >
      {title !== undefined && title !== '' ? (
        <Text
          style={{
            color: theme.tooltipTextColor,
            fontSize: AXIS_FONT_SIZE,
            opacity: 0.7,
          }}
        >
          {title}
        </Text>
      ) : null}
      {rows.map((row, i) => (
        <View
          key={i}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
        >
          {row.color ? (
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: row.color,
              }}
            />
          ) : null}
          <Text
            style={{
              color: theme.tooltipTextColor,
              fontSize: AXIS_FONT_SIZE + 1,
              fontWeight: '600',
            }}
            numberOfLines={1}
          >
            {row.name ? `${row.name}  ` : ''}
            {row.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
