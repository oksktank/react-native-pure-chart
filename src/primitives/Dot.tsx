import { Animated } from 'react-native';

export interface DotProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  /** Optional ring around the dot (used by selected data points). */
  borderColor?: string;
  borderWidth?: number;
  /** Animated opacity for entrance staggering. */
  opacity?: Animated.AnimatedInterpolation<number>;
}

/** A circle centered on (x, y). Doubles as a round line join and a data point marker. */
export function Dot({
  x,
  y,
  radius,
  color,
  borderColor,
  borderWidth = 0,
  opacity,
}: DotProps) {
  const r = radius + borderWidth;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: color,
        ...(opacity !== undefined ? { opacity } : null),
        ...(borderColor && borderWidth > 0
          ? { borderColor, borderWidth }
          : null),
      }}
    />
  );
}
