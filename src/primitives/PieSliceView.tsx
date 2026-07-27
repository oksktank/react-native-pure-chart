import { Animated } from 'react-native';

export interface PieSliceViewProps {
  /** Radians, clockwise from 12 o'clock. */
  startAngle: number;
  /** Radians, must be ≤ π (+ seam epsilon). Larger slices are pre-split. */
  sweep: number;
  color: string;
  /**
   * Animated rotate string for the color rect ('sweep' entrance):
   * interpolate to [`-πrad` … `${sweep - π}rad`] and the wedge grows from
   * nothing to its full angle.
   */
  rotateAnim?: Animated.AnimatedInterpolation<string>;
}

/**
 * One pie slice piece via half-circle masking (the web CSS technique):
 * ① a full-size wrapper rotated to the start angle,
 * ② a clip window over the right half,
 * ③ a color rect rotated around the pie center so exactly `sweep` of it
 *    remains inside the window.
 * The outer circle itself is clipped by the chart's rounded container,
 * so slice edges never show on the circumference (the legacy quarter-circle
 * approach leaked seams there).
 */
export function PieSliceView({
  startAngle,
  sweep,
  color,
  rotateAnim,
}: PieSliceViewProps) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ rotate: `${startAngle}rad` }],
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '50%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color,
            transformOrigin: '0% 50%',
            transform: [
              { rotate: rotateAnim ?? `${sweep - Math.PI}rad` },
            ],
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}
