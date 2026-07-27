import { Animated, View } from 'react-native';
import { AREA_SEAM_EPSILON } from '../constants';
import type { SegmentLayout } from '../core/geometry';

export interface AreaSegmentProps {
  layout: SegmentLayout;
  /** Pixel y of the fill baseline (usually the zero line). */
  baselineY: number;
  color: string;
  /** 0→1 reveals the fill left to right, in sync with the line. */
  grow?: Animated.AnimatedInterpolation<number>;
}

/**
 * Trapezoid fill under one line segment: a clipping wrapper spanning the
 * segment's horizontal extent, containing one rect whose top edge is rotated
 * to lie along the line. The rect overhangs generously on every side (the
 * wrapper clips it back), so the band always covers the full region between
 * the line and the baseline — a snugly-sized rect would only cover a
 * diagonal sliver.
 *
 * Bands render fully opaque and overlap by AREA_SEAM_EPSILON; the caller is
 * responsible for wrapping a run's bands in a single opacity layer. Fading
 * each band individually would make the overlaps darker than the fill.
 */
export function AreaSegment({
  layout,
  baselineY,
  color,
  grow,
}: AreaSegmentProps) {
  const dx = Math.cos(layout.angleRad) * layout.length;
  if (dx <= 0) {
    return null; // vertical step risers have no area of their own
  }
  const endY = layout.y + Math.sin(layout.angleRad) * layout.length;
  const top = Math.min(layout.y, endY);
  const height = baselineY - top;
  if (height <= 0) {
    return null; // segment entirely below the baseline
  }
  // Overhang on both ends + thickness that provably covers every point of
  // the wrapper that lies below the line (see doc comment).
  const pad = height + 4;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: layout.x,
        top,
        // Overlap the next band so their abutting anti-aliased edges can't
        // show a hairline seam through the fill.
        width: dx + AREA_SEAM_EPSILON,
        height,
        overflow: 'hidden',
        ...(grow
          ? {
              transformOrigin: '0% 50%',
              transform: [{ scaleX: grow }],
            }
          : null),
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: -pad,
          top: layout.y - top,
          width: layout.length + 2 * pad,
          height: pad,
          backgroundColor: color,
          // Rotate around the segment's start point on the line.
          transformOrigin: [pad, 0, 0],
          transform: [{ rotate: `${layout.angleRad}rad` }],
        }}
      />
    </Animated.View>
  );
}
