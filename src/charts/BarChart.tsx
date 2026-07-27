import { useEffect, useMemo } from 'react';
import { Animated, Pressable, View } from 'react-native';
import type { BarChartProps, DataPoint, PressEvent } from '../types';
import {
  collectLabels,
  collectValues,
  maxPointCount,
  normalizeData,
} from '../core/normalize';
import { computeYDomain } from '../core/scale';
import { barExtent, computeBarLayout } from '../core/bars';
import {
  colorAt,
  resolveAnimation,
  resolvePadding,
  resolveTheme,
  resolveXAxis,
  resolveYAxis,
} from '../internal/resolve';
import {
  buildWindows,
  useChartProgress,
  windowOf,
} from '../hooks/useChartProgress';
import { useSelection } from '../hooks/useSelection';
import { Tooltip } from '../container/Tooltip';
import { Legend } from '../container/Legend';
import { formatCompact } from '../core/scale';
import { ChartContainer, type PlotRect } from '../container/ChartContainer';
import { HorizontalFrame } from '../container/HorizontalFrame';
import {
  DEFAULT_BAR_GAP,
  DEFAULT_BAR_RADIUS,
  DEFAULT_HEIGHT,
  DEFAULT_PALETTE,
} from '../constants';

export function BarChart(props: BarChartProps) {
  const {
    data,
    width,
    height = DEFAULT_HEIGHT,
    barWidth,
    barRadius = DEFAULT_BAR_RADIUS,
    barGap = DEFAULT_BAR_GAP,
    groupGap,
    palette = DEFAULT_PALETTE,
    style,
    testID,
  } = props;

  const { series, warnings } = useMemo(() => normalizeData(data), [data]);
  useEffect(() => {
    if (__DEV__) {
      for (const warning of warnings) {
        console.warn(`[react-native-pure-chart] ${warning}`);
      }
    }
  }, [warnings]);

  const theme = resolveTheme(props.theme);
  const yAxis = resolveYAxis(props.yAxis);
  const xAxis = resolveXAxis(props.xAxis);
  const padding = resolvePadding(props.padding);

  const categoryCount = maxPointCount(series);
  const animation = resolveAnimation(props.animate);
  const progress = useChartProgress(animation, data);
  // Bars stagger left to right, one window per category, half-overlapping.
  const windows = useMemo(
    () => buildWindows(categoryCount, 0.5),
    [categoryCount]
  );
  const [selectedIndex, setSelectedIndex] = useSelection(
    props.selectedIndex,
    props.onSelectionChange
  );
  const tooltip = props.tooltip ?? true;
  const interactive =
    tooltip !== false ||
    props.onPointPress !== undefined ||
    props.selectedIndex !== undefined ||
    props.onSelectionChange !== undefined;
  const legendVisible =
    props.legend !== false && series.length > 1 && series.some((s) => s.name);
  const renderValueLabel = props.renderValueLabel;
  const yDomain = useMemo(
    () =>
      computeYDomain(collectValues(series), {
        min: yAxis.min,
        max: yAxis.max,
        tickCount: yAxis.tickCount,
      }),
    [series, yAxis.min, yAxis.max, yAxis.tickCount]
  );
  const xLabels = useMemo(() => collectLabels(series), [series]);

  const layoutFor = (plot: PlotRect) =>
    computeBarLayout({
      plotWidth: plot.width - padding.left - padding.right,
      categoryCount,
      seriesCount: series.length,
      barWidth,
      barGap,
      groupGap,
    });

  const legendNode = legendVisible ? (
    <Legend
      items={series.map((s, i) => ({
        color: colorAt(palette, i, s.color),
        label: s.name ?? `Series ${i + 1}`,
      }))}
      labelColor={theme.labelColor}
      labelStyle={
        typeof props.legend === 'object' ? props.legend.labelStyle : undefined
      }
    />
  ) : null;

  if (props.horizontal) {
    const chartH = (
      <HorizontalFrame
        width={width}
        height={height}
        padding={padding}
        valueDomain={yDomain}
        valueAxis={yAxis}
        categoryAxis={xAxis}
        categoryLabels={xLabels}
        getCenters={(plot) =>
          computeBarLayout({
            plotWidth: plot.height - padding.top - padding.bottom,
            categoryCount,
            seriesCount: series.length,
            barWidth,
            barGap,
            groupGap,
          }).centers.map((c) => c + padding.top)
        }
        theme={theme}
        style={style}
        testID={testID}
        accessibilityLabel={
          props.accessibilityLabel ??
          `Horizontal bar chart, ${series.length} series, ${categoryCount} categories`
        }
      >
        {(plot, valueScale) => {
          const layout = computeBarLayout({
            plotWidth: plot.height - padding.top - padding.bottom,
            categoryCount,
            seriesCount: series.length,
            barWidth,
            barGap,
            groupGap,
          });
          const zeroPx = valueScale(
            Math.max(yDomain.min, Math.min(yDomain.max, 0))
          );
          const tooltipOptions = typeof tooltip === 'object' ? tooltip : {};
          const formatValue =
            tooltipOptions.formatValue ?? ((v: number) => formatCompact(v));
          return (
            <>
              {series.map((s, seriesIndex) =>
                s.points.map((point, categoryIndex) => {
                  if (point.value === null) {
                    return null;
                  }
                  const slot = layout.slots[categoryIndex]?.[seriesIndex];
                  if (!slot) {
                    return null;
                  }
                  const valuePx = valueScale(point.value);
                  const negative = point.value < 0;
                  const radius = Math.min(barRadius, slot.width / 2);
                  const dimmed =
                    selectedIndex !== null && categoryIndex !== selectedIndex;
                  const animatedStyle = !animation.enabled
                    ? null
                    : animation.type === 'fade' && selectedIndex === null
                      ? { opacity: progress }
                      : {
                          transformOrigin: negative
                            ? ('100% 50%' as const)
                            : ('0% 50%' as const),
                          transform: [
                            {
                              scaleX: windowOf(
                                progress,
                                windows[categoryIndex] ?? { start: 0, end: 1 }
                              ),
                            },
                          ],
                        };
                  return (
                    <Animated.View
                      key={`${seriesIndex}-${categoryIndex}`}
                      style={{
                        position: 'absolute',
                        left: Math.min(valuePx, zeroPx),
                        top: padding.top + slot.x,
                        width: Math.max(Math.abs(valuePx - zeroPx), 1),
                        height: slot.width,
                        backgroundColor:
                          point.color ??
                          colorAt(palette, seriesIndex, s.color),
                        ...(negative
                          ? {
                              borderTopLeftRadius: radius,
                              borderBottomLeftRadius: radius,
                            }
                          : {
                              borderTopRightRadius: radius,
                              borderBottomRightRadius: radius,
                            }),
                        ...animatedStyle,
                        ...(dimmed ? { opacity: 0.35 } : null),
                      }}
                    />
                  );
                })
              )}
              {interactive ? (
                <Pressable
                  collapsable={false}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  onPress={(e) => {
                    if (layout.bandWidth <= 0) {
                      return;
                    }
                    const ly = e.nativeEvent.locationY;
                    const category = Math.max(
                      0,
                      Math.min(
                        categoryCount - 1,
                        Math.floor((ly - padding.top) / layout.bandWidth)
                      )
                    );
                    const next =
                      selectedIndex === category &&
                      (tooltipOptions.dismissOnTapOutside ?? true)
                        ? null
                        : category;
                    setSelectedIndex(next);
                    if (next !== null && props.onPointPress) {
                      const s = series[0];
                      const p = s?.points[next];
                      if (s && p && p.value !== null) {
                        props.onPointPress({
                          point: {
                            value: p.value,
                            label: p.label,
                            color: p.color,
                            extra: p.extra,
                          },
                          value: p.value,
                          label: p.label,
                          index: next,
                          seriesIndex: 0,
                          seriesName: s.name,
                          position: {
                            x: valueScale(p.value),
                            y: padding.top + (layout.centers[next] ?? 0),
                          },
                        });
                      }
                    }
                  }}
                />
              ) : null}
              {tooltip !== false && selectedIndex !== null
                ? (() => {
                    const rows = series
                      .map((s, si) => ({ s, si, p: s.points[selectedIndex] }))
                      .filter((e) => e.p !== undefined && e.p.value !== null);
                    if (rows.length === 0) {
                      return null;
                    }
                    const anchorX = Math.max(
                      zeroPx,
                      ...rows.map(({ p }) => valueScale(p!.value!))
                    );
                    return (
                      <Tooltip
                        x={anchorX}
                        y={padding.top + (layout.centers[selectedIndex] ?? 0)}
                        plotWidth={plot.width}
                        theme={theme}
                        title={xLabels[selectedIndex]}
                        rows={rows.map(({ s, si, p }) => ({
                          color: colorAt(palette, si, s.color),
                          name: s.name,
                          text: formatValue(p!.value!),
                        }))}
                      />
                    );
                  })()
                : null}
            </>
          );
        }}
      </HorizontalFrame>
    );
    if (!legendNode) {
      return chartH;
    }
    return (
      <>
        {chartH}
        {legendNode}
      </>
    );
  }

  const chart = (
    <ChartContainer
      width={width}
      height={height}
      padding={padding}
      yDomain={yDomain}
      yAxis={yAxis}
      xAxis={xAxis}
      xLabels={xLabels}
      getXCenters={(plot) =>
        layoutFor(plot).centers.map((c) => c + padding.left)
      }
      getContentWidth={() => {
        if (barWidth === undefined) {
          return null;
        }
        const groupWidth =
          barWidth * series.length + barGap * (series.length - 1);
        const band = groupWidth + (groupGap ?? 20);
        return padding.left + padding.right + band * categoryCount;
      }}
      scrollable={props.scrollable ?? true}
      initialScroll={props.initialScroll ?? 'start'}
      theme={theme}
      style={style}
      testID={testID}
      accessibilityLabel={
        props.accessibilityLabel ??
        `Bar chart, ${series.length} series, ${categoryCount} categories`
      }
    >
      {(plot, yScale) => {
        const layout = layoutFor(plot);
        const zeroPx = yScale(
          Math.max(yDomain.min, Math.min(yDomain.max, 0))
        );
        return (
          <>
            {series.map((s, seriesIndex) =>
              s.points.map((point, categoryIndex) => {
                if (point.value === null) {
                  return null;
                }
                const slot = layout.slots[categoryIndex]?.[seriesIndex];
                if (!slot) {
                  return null;
                }
                const { top, height: barHeight } = barExtent(
                  yScale(point.value),
                  zeroPx
                );
                const negative = point.value < 0;
                const radius = Math.min(barRadius, slot.width / 2);
                const dimmed =
                  selectedIndex !== null && categoryIndex !== selectedIndex;
                const animatedStyle = !animation.enabled
                  ? null
                  : animation.type === 'fade' && selectedIndex === null
                    ? { opacity: progress }
                    : {
                        // Grow from the zero baseline: anchor the scale at
                        // the bar edge that touches the baseline.
                        transformOrigin: negative
                          ? ('50% 0%' as const)
                          : ('50% 100%' as const),
                        transform: [
                          {
                            scaleY: windowOf(
                              progress,
                              windows[categoryIndex] ?? { start: 0, end: 1 }
                            ),
                          },
                        ],
                      };
                return (
                  <Animated.View
                    key={`${seriesIndex}-${categoryIndex}`}
                    style={{
                      position: 'absolute',
                      left: padding.left + slot.x,
                      top,
                      width: slot.width,
                      height: Math.max(barHeight, 1),
                      backgroundColor:
                        point.color ?? colorAt(palette, seriesIndex, s.color),
                      ...(negative
                        ? {
                            borderBottomLeftRadius: radius,
                            borderBottomRightRadius: radius,
                          }
                        : {
                            borderTopLeftRadius: radius,
                            borderTopRightRadius: radius,
                          }),
                      ...animatedStyle,
                      ...(dimmed ? { opacity: 0.35 } : null),
                    }}
                  />
                );
              })
            )}
            {renderValueLabel
              ? series.flatMap((s, seriesIndex) =>
                  s.points.map((point, categoryIndex) => {
                    if (point.value === null) {
                      return null;
                    }
                    const slot = layout.slots[categoryIndex]?.[seriesIndex];
                    if (!slot) {
                      return null;
                    }
                    const centerX = padding.left + slot.x + slot.width / 2;
                    const topY = Math.min(yScale(point.value), zeroPx);
                    return (
                      <View
                        key={`v${seriesIndex}-${categoryIndex}`}
                        pointerEvents="none"
                        // Fixed-size window anchored above the bar; a zero-size
                        // box would make Yoga measure the label at width 0.
                        style={{
                          position: 'absolute',
                          left: centerX - 50,
                          top: topY - 44,
                          width: 100,
                          height: 40,
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {renderValueLabel({
                          point: {
                            value: point.value,
                            label: point.label,
                            color: point.color,
                            extra: point.extra,
                          },
                          value: point.value,
                          label: point.label,
                          index: categoryIndex,
                          seriesIndex,
                          seriesName: s.name,
                          position: { x: centerX, y: topY },
                        })}
                      </View>
                    );
                  })
                )
              : null}
            {interactive ? (
              <Pressable
                collapsable={false}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                onPress={(e) => {
                  const lx = e.nativeEvent.locationX;
                  if (layout.bandWidth <= 0) {
                    return;
                  }
                  const category = Math.max(
                    0,
                    Math.min(
                      categoryCount - 1,
                      Math.floor((lx - padding.left) / layout.bandWidth)
                    )
                  );
                  const tooltipOptions =
                    typeof tooltip === 'object' ? tooltip : {};
                  const next =
                    selectedIndex === category &&
                    (tooltipOptions.dismissOnTapOutside ?? true)
                      ? null
                      : category;
                  setSelectedIndex(next);
                  if (next !== null && props.onPointPress) {
                    const slots = layout.slots[category] ?? [];
                    let seriesIndex = 0;
                    let bestDist = Infinity;
                    slots.forEach((slot, si) => {
                      const center = padding.left + slot.x + slot.width / 2;
                      const d = Math.abs(center - lx);
                      if (d < bestDist) {
                        bestDist = d;
                        seriesIndex = si;
                      }
                    });
                    const s = series[seriesIndex];
                    const p = s?.points[category];
                    if (s && p && p.value !== null) {
                      const point: DataPoint = {
                        value: p.value,
                        label: p.label,
                        color: p.color,
                        extra: p.extra,
                      };
                      const event: PressEvent = {
                        point,
                        value: p.value,
                        label: p.label,
                        index: category,
                        seriesIndex,
                        seriesName: s.name,
                        position: {
                          x: layout.centers[category] ?? 0,
                          y: yScale(p.value),
                        },
                      };
                      props.onPointPress(event);
                    }
                  }
                }}
              />
            ) : null}
            {tooltip !== false && selectedIndex !== null
              ? (() => {
                  const rows = series
                    .map((s, si) => ({ s, si, p: s.points[selectedIndex] }))
                    .filter((e) => e.p !== undefined && e.p.value !== null);
                  if (rows.length === 0) {
                    return null;
                  }
                  const tooltipOptions =
                    typeof tooltip === 'object' ? tooltip : {};
                  const formatValue =
                    tooltipOptions.formatValue ??
                    ((v: number) => formatCompact(v));
                  const anchorX =
                    padding.left + (layout.centers[selectedIndex] ?? 0);
                  const anchorY = Math.min(
                    ...rows.map(({ p }) =>
                      Math.min(yScale(p!.value!), zeroPx)
                    )
                  );
                  return (
                    <Tooltip
                      x={anchorX}
                      y={anchorY}
                      plotWidth={plot.width}
                      theme={theme}
                      title={xLabels[selectedIndex]}
                      rows={rows.map(({ s, si, p }) => ({
                        color: colorAt(palette, si, s.color),
                        name: s.name,
                        text: formatValue(p!.value!),
                      }))}
                    />
                  );
                })()
              : null}
          </>
        );
      }}
    </ChartContainer>
  );

  if (!legendNode) {
    return chart;
  }
  return (
    <>
      {chart}
      {legendNode}
    </>
  );
}
