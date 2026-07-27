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
 *
 * The bar overhangs each end by half its thickness and is fully rounded, which
 * makes it exactly an SVG round-cap stroke: the cap discs are centred on the
 * two data points. Consecutive segments therefore overlap in a full disc at
 * every joint, which is what `stroke-linejoin: round` draws — without it, butt
 * ends leave a wedge gap on the outside of each bend, and the two abutting
 * anti-aliased edges never sum to opaque, so a hairline shows through at every
 * joint. (Same class of bug as PIE_SEAM_EPSILON_RAD guards against in pie.)
 */
export function LineSegment({
  layout,
  thickness,
  color,
  grow,
}: LineSegmentProps) {
  const cap = thickness / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: layout.x - cap,
        top: layout.y - cap,
        width: layout.length + thickness,
        height: thickness,
        borderRadius: cap,
        backgroundColor: color,
        // Despite the cap overhang, the pivot stays on the segment's start point.
        transformOrigin: [cap, cap, 0],
        transform: [
          { rotate: `${layout.angleRad}rad` },
          ...(grow ? [{ scaleX: grow }] : []),
        ],
      }}
    />
  );
}
