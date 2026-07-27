import { Animated } from 'react-native';
import type { SegmentLayout } from '../core/geometry';

export interface LineSegmentProps {
  layout: SegmentLayout;
  thickness: number;
  color: string;
  /** 0→1 draws the segment from its start point ('grow' entrance). */
  grow?: Animated.AnimatedInterpolation<number>;
}

/**
 * A straight line between two points: a thin bar anchored at the start point
 * and rotated around it via transformOrigin. One View per segment — no
 * mask views, no translate compensation, no thickness limit.
 */
export function LineSegment({
  layout,
  thickness,
  color,
  grow,
}: LineSegmentProps) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: layout.x,
        top: layout.y - thickness / 2,
        width: layout.length,
        height: thickness,
        backgroundColor: color,
        transformOrigin: '0% 50%',
        transform: [
          { rotate: `${layout.angleRad}rad` },
          ...(grow ? [{ scaleX: grow }] : []),
        ],
      }}
    />
  );
}
