import { useEffect, useMemo } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import type { PieChartProps, SlicePressEvent } from '../types';
import { computeSlices, hitTestPie } from '../core/pie';
import { colorAt, resolveAnimation, resolveTheme } from '../internal/resolve';
import { PieSliceView } from '../primitives/PieSliceView';
import { Legend } from '../container/Legend';
import { useSelection } from '../hooks/useSelection';
import {
  buildWeightedWindows,
  useChartProgress,
  windowOf,
} from '../hooks/useChartProgress';
import {
  DEFAULT_PALETTE,
  DEFAULT_PIE_SIZE,
  PIE_SEAM_EPSILON_RAD,
} from '../constants';

/** How far a focused slice slides outward, relative to the diameter. */
const FOCUS_OFFSET_RATIO = 0.04;

export function PieChart(props: PieChartProps) {
  const {
    data,
    size = DEFAULT_PIE_SIZE,
    innerRadius = 0,
    startAngle = 0,
    padAngle = 0,
    palette = DEFAULT_PALETTE,
    legend = true,
    focusOnPress = true,
    sliceLabel = 'none',
    renderCenterLabel,
    style,
    testID,
  } = props;

  const { pieces, fractions, warnings } = useMemo(
    () => computeSlices(data, { startAngle, padAngle }),
    [data, startAngle, padAngle]
  );

  useEffect(() => {
    if (__DEV__) {
      for (const warning of warnings) {
        console.warn(`[react-native-pure-chart] ${warning}`);
      }
    }
  }, [warnings]);

  const animation = resolveAnimation(props.animate);
  const progress = useChartProgress(animation, data);
  const windows = useMemo(
    () => buildWeightedWindows(pieces.map((p) => p.sweep)),
    [pieces]
  );
  const [selectedIndex, setSelectedIndex] = useSelection(
    props.selectedIndex,
    props.onSelectionChange
  );
  const interactive =
    props.onSlicePress !== undefined ||
    props.selectedIndex !== undefined ||
    props.onSelectionChange !== undefined ||
    (focusOnPress && data.length > 0);

  const theme = resolveTheme(props.theme);
  const holeRadius =
    typeof innerRadius === 'string'
      ? (parseFloat(innerRadius) / 100) * (size / 2)
      : innerRadius;
  const holeColor =
    props.holeColor ??
    (theme.backgroundColor !== 'transparent'
      ? theme.backgroundColor
      : props.theme === 'dark'
        ? '#111827'
        : '#FFFFFF');

  const legendItems = useMemo(
    () =>
      data
        .map((slice, i) => ({
          color: colorAt(palette, i, slice.color),
          label: slice.label ?? '',
        }))
        .filter((item) => item.label !== ''),
    [data, palette]
  );

  const makeEvent = (index: number): SlicePressEvent | null => {
    const slice = data[index];
    if (!slice) {
      return null;
    }
    return {
      slice,
      index,
      value: slice.value,
      percentage: fractions[index] ?? 0,
    };
  };

  const selectedEvent =
    selectedIndex !== null ? makeEvent(selectedIndex) : null;

  // Focused slice: its pieces move to a translated sibling with its own
  // circular clip, because the main container's clip would cut off anything
  // sliding past the circumference.
  const focusedPieces =
    focusOnPress && selectedIndex !== null
      ? pieces.filter((p) => p.dataIndex === selectedIndex)
      : [];
  let focusOffset = { x: 0, y: 0 };
  if (focusedPieces.length > 0) {
    const start = focusedPieces[0]!.startAngle;
    const total = focusedPieces.reduce((sum, p) => sum + p.sweep, 0);
    const mid = start + total / 2;
    const d = size * FOCUS_OFFSET_RATIO;
    focusOffset = { x: Math.sin(mid) * d, y: -Math.cos(mid) * d };
  }

  const renderPiece = (
    piece: (typeof pieces)[number],
    i: number,
    animated: boolean
  ) => {
    const seam =
      padAngle === 0 && i < pieces.length - 1 ? PIE_SEAM_EPSILON_RAD : 0;
    const sweep = Math.min(piece.sweep + seam, Math.PI);
    const sweepAnim =
      animated && animation.enabled && animation.type === 'grow'
        ? windowOf(progress, windows[i] ?? { start: 0, end: 1 }).interpolate({
            inputRange: [0, 1],
            outputRange: [`${-Math.PI}rad`, `${sweep - Math.PI}rad`],
          })
        : undefined;
    return (
      <PieSliceView
        key={i}
        startAngle={piece.startAngle}
        sweep={sweep}
        rotateAnim={sweepAnim}
        color={colorAt(palette, piece.dataIndex, data[piece.dataIndex]?.color)}
      />
    );
  };

  const legendPosition =
    (typeof legend === 'object' ? legend.position : undefined) ?? 'bottom';
  const legendNode =
    legend !== false ? (
      <Legend
        items={legendItems}
        labelColor={theme.labelColor}
        labelStyle={typeof legend === 'object' ? legend.labelStyle : undefined}
        position={legendPosition}
      />
    ) : null;

  return (
    <View
      style={[{ alignItems: 'center' }, style]}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        props.accessibilityLabel ?? `Pie chart, ${data.length} slices`
      }
    >
      {legendPosition === 'top' ? legendNode : null}
      <View style={{ width: size, height: size }}>
        <Animated.View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            ...(animation.enabled && animation.type === 'fade'
              ? { opacity: progress }
              : null),
          }}
        >
          {pieces.map((piece, i) =>
            focusedPieces.includes(piece) ? null : renderPiece(piece, i, true)
          )}
        </Animated.View>
        {focusedPieces.length > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: focusOffset.x,
              top: focusOffset.y,
              width: size,
              height: size,
              borderRadius: size / 2,
              overflow: 'hidden',
            }}
          >
            {pieces.map((piece, i) =>
              focusedPieces.includes(piece) ? renderPiece(piece, i, false) : null
            )}
          </View>
        ) : null}
        {holeRadius > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: size / 2 - holeRadius,
              top: size / 2 - holeRadius,
              width: holeRadius * 2,
              height: holeRadius * 2,
              borderRadius: holeRadius,
              backgroundColor: holeColor,
            }}
          />
        ) : null}
        {sliceLabel !== 'none'
          ? data.map((slice, index) => {
              const event = makeEvent(index);
              if (!event || (fractions[index] ?? 0) === 0) {
                return null;
              }
              const own = pieces.filter((p) => p.dataIndex === index);
              if (own.length === 0) {
                return null;
              }
              const mid =
                own[0]!.startAngle +
                own.reduce((sum, p) => sum + p.sweep, 0) / 2;
              const r =
                holeRadius > 0
                  ? (holeRadius + size / 2) / 2
                  : (size / 2) * 0.62;
              const text =
                typeof sliceLabel === 'function'
                  ? sliceLabel(event)
                  : sliceLabel === 'label'
                    ? (slice.label ?? '')
                    : sliceLabel === 'value'
                      ? String(slice.value)
                      : `${Math.round(event.percentage * 100)}%`;
              if (text === '') {
                return null;
              }
              return (
                <View
                  key={`sl${index}`}
                  pointerEvents="none"
                  // Fixed-size window centered on the label anchor; a
                  // zero-size box would measure the text at width 0.
                  style={{
                    position: 'absolute',
                    left: size / 2 + Math.sin(mid) * r - 50,
                    top: size / 2 - Math.cos(mid) * r - 11,
                    width: 100,
                    height: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                    numberOfLines={1}
                  >
                    {text}
                  </Text>
                </View>
              );
            })
          : null}
        {renderCenterLabel ? (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderCenterLabel(selectedEvent)}
          </View>
        ) : null}
        {interactive ? (
          <Pressable
            collapsable={false}
            testID={testID ? `${testID}-touch` : undefined}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={(e) => {
              const hit = hitTestPie(
                e.nativeEvent.locationX,
                e.nativeEvent.locationY,
                size,
                holeRadius,
                pieces
              );
              const next = hit === selectedIndex ? null : hit;
              setSelectedIndex(next);
              if (next !== null && props.onSlicePress) {
                const event = makeEvent(next);
                if (event) {
                  props.onSlicePress(event);
                }
              }
            }}
          />
        ) : null}
      </View>
      {legendPosition === 'bottom' ? legendNode : null}
    </View>
  );
}
