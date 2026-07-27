import { useState, type ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { createLinearScale, type LinearScale, type YDomain } from '../core/scale';
import type {
  ResolvedPadding,
  ResolvedXAxis,
  ResolvedYAxis,
} from '../internal/resolve';
import type { ChartTheme } from '../types';
import { AXIS_FONT_SIZE, AXIS_LABEL_LINE_HEIGHT } from '../constants';
import type { PlotRect } from './ChartContainer';

export interface HorizontalFrameProps {
  width?: number;
  height: number;
  padding: ResolvedPadding;
  /** Value domain — configured through `yAxis`, rendered along the bottom. */
  valueDomain: YDomain;
  valueAxis: ResolvedYAxis;
  /** Category labels — configured through `xAxis`, rendered on the left. */
  categoryAxis: ResolvedXAxis;
  categoryLabels: readonly (string | undefined)[];
  /** Vertical center of each category band, given the plot rect. */
  getCenters: (plot: PlotRect) => number[];
  theme: Required<ChartTheme>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  children: (plot: PlotRect, valueScale: LinearScale) => ReactNode;
}

/**
 * Frame for horizontal bars: same measurement approach as ChartContainer,
 * with the category axis on the left and the value axis along the bottom.
 */
export function HorizontalFrame({
  width,
  height,
  padding,
  valueDomain,
  valueAxis,
  categoryAxis,
  categoryLabels,
  getCenters,
  theme,
  style,
  testID,
  accessibilityLabel,
  children,
}: HorizontalFrameProps) {
  const [plot, setPlot] = useState<PlotRect | null>(null);

  const valueScale = plot
    ? createLinearScale(
        [valueDomain.min, valueDomain.max],
        [padding.left, plot.width - padding.right]
      )
    : null;

  const centers = plot ? getCenters(plot) : [];
  const showCategories =
    categoryAxis.show && categoryLabels.some((l) => l !== undefined);

  return (
    <View
      style={[{ width: width ?? '100%' }, style]}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={{ flexDirection: 'row' }}>
        {showCategories ? (
          <View style={{ height, marginRight: 8 }}>
            {categoryLabels.map((label, i) => (
              <Text
                key={`w${i}`}
                style={[axisText(theme), { opacity: 0, height: 0 }]}
                numberOfLines={1}
              >
                {categoryAxis.formatLabel(label, i)}
              </Text>
            ))}
            {categoryLabels.map((label, i) =>
              label === undefined ? null : (
                <Text
                  key={i}
                  style={[
                    axisText(theme),
                    categoryAxis.labelStyle,
                    {
                      position: 'absolute',
                      right: 0,
                      top: (centers[i] ?? 0) - AXIS_LABEL_LINE_HEIGHT / 2,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {categoryAxis.formatLabel(label, i)}
                </Text>
              )
            )}
          </View>
        ) : null}

        <View
          style={{ flex: 1, height }}
          onLayout={(e) => {
            const { width: w, height: h } = e.nativeEvent.layout;
            if (!plot || plot.width !== w || plot.height !== h) {
              setPlot({ width: w, height: h });
            }
          }}
        >
          {valueScale && valueAxis.showGridLines
            ? valueDomain.ticks.map((tick, i) => (
                <View
                  key={i}
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: valueScale(tick),
                    borderLeftWidth: 1,
                    borderStyle: valueAxis.gridLineStyle,
                    borderColor: theme.gridColor,
                  }}
                />
              ))
            : null}
          {valueScale && categoryAxis.showAxisLine ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: valueScale(clamp(0, valueDomain)),
                borderLeftWidth: 1,
                borderColor: theme.axisColor,
              }}
            />
          ) : null}
          {plot && valueScale ? children(plot, valueScale) : null}
        </View>
      </View>

      {valueAxis.show ? (
        <View style={{ flexDirection: 'row' }}>
          {showCategories ? (
            <View style={{ marginRight: 8 }}>
              {categoryLabels.map((label, i) => (
                <Text
                  key={i}
                  style={[axisText(theme), { opacity: 0, height: 0 }]}
                  numberOfLines={1}
                >
                  {categoryAxis.formatLabel(label, i)}
                </Text>
              ))}
            </View>
          ) : null}
          <View style={{ flex: 1, height: AXIS_LABEL_LINE_HEIGHT + 4 }}>
            {valueScale
              ? valueDomain.ticks.map((tick, i) => (
                  <Text
                    key={i}
                    style={[
                      axisText(theme),
                      valueAxis.labelStyle,
                      {
                        position: 'absolute',
                        top: 4,
                        left: valueScale(tick) - 50,
                        width: 100,
                        textAlign: 'center',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {valueAxis.formatLabel(tick, i)}
                  </Text>
                ))
              : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function axisText(theme: Required<ChartTheme>) {
  return {
    fontSize: AXIS_FONT_SIZE,
    lineHeight: AXIS_LABEL_LINE_HEIGHT,
    color: theme.labelColor,
  };
}

function clamp(value: number, domain: YDomain): number {
  return Math.max(domain.min, Math.min(domain.max, value));
}
