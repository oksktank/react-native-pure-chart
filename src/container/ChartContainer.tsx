import { useRef, useState, type ReactNode } from 'react';
import {
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { createLinearScale, type LinearScale, type YDomain } from '../core/scale';
import type {
  ResolvedPadding,
  ResolvedXAxis,
  ResolvedYAxis,
} from '../internal/resolve';
import type { ChartTheme } from '../types';
import { AXIS_FONT_SIZE, AXIS_LABEL_LINE_HEIGHT } from '../constants';

export interface PlotRect {
  width: number;
  height: number;
}

export interface ChartContainerProps {
  width?: number;
  height: number;
  padding: ResolvedPadding;
  yDomain: YDomain;
  yAxis: ResolvedYAxis;
  xAxis: ResolvedXAxis;
  /** One label per category (undefined = no label for that slot). */
  xLabels: readonly (string | undefined)[];
  /** Pixel center of each category, given the plot rect. */
  getXCenters: (plot: PlotRect) => number[];
  /**
   * Desired plot content width for the measured viewport width, or null to
   * fill the viewport. When it exceeds the viewport and `scrollable` is on,
   * the plot (with its x labels) scrolls horizontally under fixed y labels.
   */
  getContentWidth?: (viewportWidth: number) => number | null;
  scrollable?: boolean;
  initialScroll?: 'start' | 'end';
  theme: Required<ChartTheme>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  /** Plot content, rendered once the plot area has been measured. */
  children: (plot: PlotRect, yScale: LinearScale) => ReactNode;
}

/**
 * Shared cartesian frame: y-axis labels + grid + plot + x-axis labels.
 * The y-label column sizes itself from its own content and the plot is
 * measured with onLayout — no `33 + 5 * chars` width guessing. When the
 * content overflows, plot + x labels scroll while y labels stay fixed
 * (initial position via onContentSizeChange, not the legacy setTimeout).
 */
export function ChartContainer({
  width,
  height,
  padding,
  yDomain,
  yAxis,
  xAxis,
  xLabels,
  getXCenters,
  getContentWidth,
  scrollable = true,
  initialScroll = 'start',
  theme,
  style,
  testID,
  accessibilityLabel,
  children,
}: ChartContainerProps) {
  const [viewport, setViewport] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);

  const yScale = createLinearScale(
    [yDomain.min, yDomain.max],
    [height - padding.bottom, padding.top]
  );

  const desired = viewport !== null ? (getContentWidth?.(viewport) ?? null) : null;
  const contentWidth =
    viewport === null ? null : Math.max(desired ?? viewport, viewport);
  const scrolls =
    scrollable && viewport !== null && (contentWidth ?? 0) > viewport;
  const plot: PlotRect | null =
    viewport === null ? null : { width: contentWidth ?? viewport, height };

  const hasXLabels = xAxis.show && xLabels.some((l) => l !== undefined);
  const centers = plot && hasXLabels ? getXCenters(plot) : [];
  const labelEvery =
    plot && hasXLabels ? resolveLabelInterval(xAxis, xLabels, plot.width) : 1;

  const yLabelTexts = yAxis.show
    ? yDomain.ticks.map((tick, i) => yAxis.formatLabel(tick, i))
    : [];

  const yLabelColumn = yAxis.show ? (
    <View style={{ height, marginRight: 8 }}>
      {/* Invisible copies establish the column width; height 0 so only the
          widest label matters. */}
      {yLabelTexts.map((text, i) => (
        <Text
          key={`w${i}`}
          style={[axisTextStyle(theme), { opacity: 0, height: 0 }]}
          numberOfLines={1}
        >
          {text}
        </Text>
      ))}
      {yDomain.ticks.map((tick, i) => (
        <Text
          key={i}
          style={[
            axisTextStyle(theme),
            yAxis.labelStyle,
            {
              position: 'absolute',
              right: 0,
              top: yScale(tick) - AXIS_LABEL_LINE_HEIGHT / 2,
            },
          ]}
          numberOfLines={1}
        >
          {yLabelTexts[i]}
        </Text>
      ))}
    </View>
  ) : null;

  const plotAndXLabels = (
    <View style={{ width: contentWidth ?? '100%' }}>
      <View style={{ height }}>
        {yAxis.showGridLines
          ? yDomain.ticks.map((tick, i) => (
              <View
                key={i}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: yScale(tick),
                  borderTopWidth: 1,
                  borderStyle: yAxis.gridLineStyle,
                  borderColor: theme.gridColor,
                }}
              />
            ))
          : null}
        {xAxis.showGridLines && plot
          ? centers.map((x, i) => (
              <View
                key={i}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: padding.top,
                  bottom: padding.bottom,
                  left: x,
                  borderLeftWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: theme.gridColor,
                }}
              />
            ))
          : null}
        {yAxis.showAxisLine ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [yAxis.position === 'right' ? 'right' : 'left']: 0,
              borderLeftWidth: 1,
              borderColor: theme.axisColor,
            }}
          />
        ) : null}
        {xAxis.showAxisLine ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: yScale(clampToDomain(0, yDomain)),
              borderTopWidth: 1,
              borderColor: theme.axisColor,
            }}
          />
        ) : null}
        {plot ? children(plot, yScale) : null}
      </View>
      {hasXLabels ? (
        <View style={{ height: AXIS_LABEL_LINE_HEIGHT + 4 }}>
          {plot
            ? xLabels.map((label, i) => {
                if (label === undefined || i % labelEvery !== 0) {
                  return null;
                }
                return (
                  <Text
                    key={i}
                    style={[
                      axisTextStyle(theme),
                      xAxis.labelStyle,
                      {
                        position: 'absolute',
                        top: 4,
                        left: (centers[i] ?? 0) - 50,
                        width: 100,
                        textAlign: 'center',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {xAxis.formatLabel(label, i)}
                  </Text>
                );
              })
            : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <View
      style={[{ width: width ?? '100%' }, style]}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={{ flexDirection: 'row' }}>
        {yLabelColumn}
        <View
          style={{ flex: 1 }}
          testID={testID ? `${testID}-viewport` : undefined}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (viewport !== w) {
              setViewport(w);
            }
          }}
        >
          {scrolls ? (
            <ScrollView
              ref={scrollRef}
              testID={testID ? `${testID}-scroll` : undefined}
              horizontal
              showsHorizontalScrollIndicator={false}
              onContentSizeChange={() => {
                if (!didInitialScroll.current && initialScroll === 'end') {
                  scrollRef.current?.scrollToEnd({ animated: false });
                }
                didInitialScroll.current = true;
              }}
            >
              {plotAndXLabels}
            </ScrollView>
          ) : (
            plotAndXLabels
          )}
        </View>
      </View>
    </View>
  );
}

function axisTextStyle(theme: Required<ChartTheme>) {
  return {
    fontSize: AXIS_FONT_SIZE,
    lineHeight: AXIS_LABEL_LINE_HEIGHT,
    color: theme.labelColor,
  };
}

function clampToDomain(value: number, domain: YDomain): number {
  return Math.max(domain.min, Math.min(domain.max, value));
}

/**
 * 'auto' thins x labels so they don't collide: an estimated label width
 * (used only for the show/hide decision, never for layout) is compared to
 * the per-category band width.
 */
function resolveLabelInterval(
  xAxis: ResolvedXAxis,
  labels: readonly (string | undefined)[],
  plotWidth: number
): number {
  if (xAxis.interval !== 'auto') {
    return Math.max(1, xAxis.interval);
  }
  const maxChars = labels.reduce((max, l) => Math.max(max, l?.length ?? 0), 0);
  const estimatedWidth = maxChars * AXIS_FONT_SIZE * 0.62 + 8;
  const band = plotWidth / Math.max(1, labels.length);
  return Math.max(1, Math.ceil(estimatedWidth / band));
}
