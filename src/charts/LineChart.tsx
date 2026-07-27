import { useEffect, useMemo } from 'react';
import { Animated, Pressable, View } from 'react-native';
import type { DataPoint, LineChartProps, PressEvent } from '../types';
import {
  applyMissingPolicy,
  collectLabels,
  collectValues,
  maxPointCount,
  normalizeData,
  type NormalizedPoint,
} from '../core/normalize';
import { computeYDomain } from '../core/scale';
import {
  polylineSegments,
  splitRuns,
  stepSegments,
  type Point,
} from '../core/geometry';
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
import { LineSegment } from '../primitives/LineSegment';
import { Dot } from '../primitives/Dot';
import {
  DEFAULT_HEIGHT,
  DEFAULT_PALETTE,
  DEFAULT_STROKE_WIDTH,
} from '../constants';

interface PlacedPoint extends Point {
  point: NormalizedPoint;
  index: number;
}

export function LineChart(props: LineChartProps) {
  const {
    data,
    width,
    height = DEFAULT_HEIGHT,
    strokeWidth = DEFAULT_STROKE_WIDTH,
    curve = 'linear',
    showDataPoints = true,
    missingValues = 'break',
    spacing,
    palette = DEFAULT_PALETTE,
    style,
    testID,
  } = props;

  const { series, warnings } = useMemo(() => {
    const normalized = normalizeData(data);
    return {
      series: normalized.series.map((s) => ({
        ...s,
        points: applyMissingPolicy(s.points, missingValues),
      })),
      warnings: normalized.warnings,
    };
  }, [data, missingValues]);

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
  const animation = resolveAnimation(props.animate);
  const progress = useChartProgress(animation, data);
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

  const categoryCount = maxPointCount(series);
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

  const xPositions = (plot: PlotRect): number[] => {
    const innerWidth = plot.width - padding.left - padding.right;
    if (categoryCount <= 1) {
      return [padding.left + innerWidth / 2];
    }
    const gap = spacing ?? innerWidth / (categoryCount - 1);
    return Array.from(
      { length: categoryCount },
      (_, i) => padding.left + i * gap
    );
  };

  const pointRadius =
    typeof showDataPoints === 'object' && showDataPoints.radius !== undefined
      ? showDataPoints.radius
      : Math.max(3, strokeWidth * 1.5);
  const pointsVisible = showDataPoints !== false;
  const renderValueLabel = props.renderValueLabel;
  const legendVisible =
    props.legend !== false && series.length > 1 && series.some((s) => s.name);

  const chart = (
    <ChartContainer
      width={width}
      height={height}
      padding={padding}
      yDomain={yDomain}
      yAxis={yAxis}
      xAxis={xAxis}
      xLabels={xLabels}
      getXCenters={xPositions}
      getContentWidth={() =>
        spacing !== undefined && categoryCount > 1
          ? padding.left + padding.right + spacing * (categoryCount - 1)
          : null
      }
      scrollable={props.scrollable ?? true}
      initialScroll={props.initialScroll ?? 'start'}
      theme={theme}
      style={style}
      testID={testID}
      accessibilityLabel={
        props.accessibilityLabel ??
        `Line chart, ${series.length} series, ${categoryCount} points`
      }
    >
      {(plot, yScale) => {
        const xs = xPositions(plot);
        const grow = animation.enabled && animation.type === 'grow';
        const content = series.map((s, seriesIndex) => {
          const color = colorAt(palette, seriesIndex, s.color);
          const placed: (PlacedPoint | null)[] = s.points.map((point, i) =>
            point.value === null
              ? null
              : {
                  x: xs[i] ?? 0,
                  y: yScale(point.value),
                  point,
                  index: i,
                }
          );
          const runs = splitRuns(placed, (p) => p !== null) as PlacedPoint[][];
          const segmentsPerRun = runs.map((run) =>
            curve === 'step' ? stepSegments(run) : polylineSegments(run)
          );
          const totalSegments = segmentsPerRun.reduce(
            (sum, segs) => sum + segs.length,
            0
          );
          // The whole series shares one left-to-right timeline.
          const windows = buildWindows(Math.max(totalSegments, 1));
          const dotColor =
            typeof showDataPoints === 'object' && showDataPoints.color
              ? showDataPoints.color
              : color;

          let segmentCursor = 0;
          return runs.map((run, runIndex) => {
            const segments = segmentsPerRun[runIndex] ?? [];
            const firstSegment = segmentCursor;
            const rendered = segments
              .map((segment, i) => (
                <LineSegment
                  key={`s${seriesIndex}-${runIndex}-${i}`}
                  layout={segment}
                  thickness={strokeWidth}
                  color={color}
                  grow={
                    grow
                      ? windowOf(
                          progress,
                          windows[segmentCursor + i] ?? { start: 0, end: 1 }
                        )
                      : undefined
                  }
                />
              ))
              .concat(
                run
                  .map((p, j) => {
                    if (
                      p.point.isSynthetic ||
                      !(pointsVisible || strokeWidth > 2)
                    ) {
                      return null;
                    }
                    // A dot pops in as the segment arriving at it completes
                    // (j is the position within the run, so it maps onto the
                    // run's segments even when synthetic dots are skipped).
                    const owningSegment =
                      j === 0
                        ? windows[firstSegment]
                        : windows[
                            Math.min(
                              firstSegment +
                                (curve === 'step' ? j * 2 : j) -
                                1,
                              windows.length - 1
                            )
                          ];
                    const appearAt =
                      j === 0
                        ? (owningSegment?.start ?? 0)
                        : (owningSegment?.end ?? 1);
                    if (props.renderDataPoint) {
                      const event: PressEvent = {
                        point: {
                          value: p.point.value,
                          label: p.point.label,
                          color: p.point.color,
                          extra: p.point.extra,
                        },
                        value: p.point.value,
                        label: p.point.label,
                        index: p.index,
                        seriesIndex,
                        seriesName: s.name,
                        position: { x: p.x, y: p.y },
                      };
                      return (
                        <View
                          key={`d${seriesIndex}-${runIndex}-${p.index}`}
                          pointerEvents="none"
                          // Fixed-size window centered on the point; a
                          // zero-size box would measure children at width 0.
                          style={{
                            position: 'absolute',
                            left: p.x - 50,
                            top: p.y - 50,
                            width: 100,
                            height: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {props.renderDataPoint(event)}
                        </View>
                      );
                    }
                    return (
                      <Dot
                        key={`d${seriesIndex}-${runIndex}-${p.index}`}
                        x={p.x}
                        y={p.y}
                        radius={pointsVisible ? pointRadius : strokeWidth / 2}
                        color={pointsVisible ? dotColor : color}
                        opacity={
                          grow
                            ? windowOf(progress, {
                                start: appearAt,
                                end: Math.min(appearAt + 0.08, 1),
                              })
                            : undefined
                        }
                      />
                    );
                  })
                  .filter((d): d is NonNullable<typeof d> => d !== null)
              );
            segmentCursor += segments.length;
            return rendered;
          });
        });
        const body =
          animation.enabled && animation.type === 'fade' ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                opacity: progress,
              }}
            >
              {content}
            </Animated.View>
          ) : (
            <>{content}</>
          );

        const makeEvent = (
          seriesIndex: number,
          index: number
        ): PressEvent | null => {
          const s = series[seriesIndex];
          const p = s?.points[index];
          if (!s || !p || p.value === null) {
            return null;
          }
          const point: DataPoint = {
            value: p.value,
            label: p.label,
            color: p.color,
            extra: p.extra,
          };
          return {
            point,
            value: p.value,
            label: p.label,
            index,
            seriesIndex,
            seriesName: s.name,
            position: { x: xs[index] ?? 0, y: yScale(p.value) },
          };
        };

        const selectedX = selectedIndex !== null ? xs[selectedIndex] : null;
        const selectedPoints =
          selectedIndex === null
            ? []
            : series
                .map((s, si) => ({ s, si, p: s.points[selectedIndex] }))
                .filter(
                  (e) => e.p !== undefined && e.p.value !== null
                );
        const tooltipOptions = typeof tooltip === 'object' ? tooltip : {};
        const formatValue =
          tooltipOptions.formatValue ?? ((v: number) => formatCompact(v));
        const ringColor = props.theme === 'dark' ? '#111827' : '#FFFFFF';

        return (
          <>
            {body}
            {renderValueLabel
              ? series.flatMap((s, seriesIndex) =>
                  s.points.map((p, index) => {
                    if (p.value === null || p.isSynthetic) {
                      return null;
                    }
                    const event = makeEvent(seriesIndex, index);
                    if (!event) {
                      return null;
                    }
                    return (
                      <View
                        key={`v${seriesIndex}-${index}`}
                        pointerEvents="none"
                        // Fixed-size window anchored above the point; a
                        // zero-size box would make Yoga measure it at width 0.
                        style={{
                          position: 'absolute',
                          left: event.position.x - 50,
                          top: event.position.y - pointRadius - 44,
                          width: 100,
                          height: 40,
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {renderValueLabel(event)}
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
                  const ly = e.nativeEvent.locationY;
                  let nearest = 0;
                  let nearestDist = Infinity;
                  xs.forEach((x, i) => {
                    const d = Math.abs(x - lx);
                    if (d < nearestDist) {
                      nearestDist = d;
                      nearest = i;
                    }
                  });
                  const next =
                    selectedIndex === nearest &&
                    (tooltipOptions.dismissOnTapOutside ?? true)
                      ? null
                      : nearest;
                  setSelectedIndex(next);
                  if (next !== null && props.onPointPress) {
                    let bestSeries = -1;
                    let bestDist = Infinity;
                    series.forEach((s, si) => {
                      const p = s.points[next];
                      if (p && p.value !== null) {
                        const d = Math.abs(yScale(p.value) - ly);
                        if (d < bestDist) {
                          bestDist = d;
                          bestSeries = si;
                        }
                      }
                    });
                    const event =
                      bestSeries >= 0 ? makeEvent(bestSeries, next) : null;
                    if (event) {
                      props.onPointPress(event);
                    }
                  }
                }}
              />
            ) : null}
            {selectedX !== null && selectedPoints.length > 0 ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: selectedX,
                  top: padding.top,
                  bottom: padding.bottom,
                  borderLeftWidth: 1,
                  borderColor: theme.axisColor,
                }}
              />
            ) : null}
            {selectedPoints.map(({ s, si, p }) => (
              <Dot
                key={`sel${si}`}
                x={selectedX ?? 0}
                y={yScale(p!.value!)}
                radius={pointRadius + 2}
                color={colorAt(palette, si, s.color)}
                borderColor={ringColor}
                borderWidth={2}
              />
            ))}
            {tooltip !== false &&
            selectedIndex !== null &&
            selectedPoints.length > 0 ? (
              tooltipOptions.render ? (
                (() => {
                  const event = makeEvent(selectedPoints[0]!.si, selectedIndex);
                  return event ? (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: event.position.x,
                        top: event.position.y,
                      }}
                    >
                      {tooltipOptions.render(event)}
                    </View>
                  ) : null;
                })()
              ) : (
                <Tooltip
                  x={selectedX ?? 0}
                  y={Math.min(
                    ...selectedPoints.map((e) => yScale(e.p!.value!))
                  )}
                  plotWidth={plot.width}
                  theme={theme}
                  title={xLabels[selectedIndex]}
                  rows={selectedPoints.map(({ s, si, p }) => ({
                    color: colorAt(palette, si, s.color),
                    name: s.name,
                    text: formatValue(p!.value!),
                  }))}
                />
              )
            ) : null}
          </>
        );
      }}
    </ChartContainer>
  );

  if (!legendVisible) {
    return chart;
  }
  return (
    <>
      {chart}
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
    </>
  );
}
