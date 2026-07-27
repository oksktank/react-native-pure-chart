/** Horizontal placement of one bar within the plot. */
export interface BarSlot {
  x: number;
  width: number;
}

export interface BarLayoutOptions {
  plotWidth: number;
  categoryCount: number;
  seriesCount: number;
  /** Explicit bar width; omit for automatic sizing. */
  barWidth?: number;
  /** Gap between bars of the same category. */
  barGap: number;
  /**
   * Gap between category groups. Omit for automatic sizing
   * (the group then fills 70% of its band).
   */
  groupGap?: number;
}

export interface BarLayout {
  /** slots[categoryIndex][seriesIndex] */
  slots: BarSlot[][];
  bandWidth: number;
  /** Center x of each category — anchors x-axis labels and tooltips. */
  centers: number[];
}

export function computeBarLayout(options: BarLayoutOptions): BarLayout {
  const { plotWidth, categoryCount, seriesCount, barGap } = options;
  if (categoryCount === 0 || seriesCount === 0 || plotWidth <= 0) {
    return { slots: [], bandWidth: 0, centers: [] };
  }

  const bandWidth = plotWidth / categoryCount;
  const gapTotal = barGap * (seriesCount - 1);

  let barWidth: number;
  if (options.barWidth !== undefined) {
    barWidth = options.barWidth;
  } else if (options.groupGap !== undefined) {
    barWidth = Math.max(1, (bandWidth - options.groupGap - gapTotal) / seriesCount);
  } else {
    barWidth = Math.max(1, (bandWidth * 0.7 - gapTotal) / seriesCount);
  }

  const groupWidth = barWidth * seriesCount + gapTotal;
  const slots: BarSlot[][] = [];
  const centers: number[] = [];
  for (let c = 0; c < categoryCount; c++) {
    const bandStart = c * bandWidth;
    const groupStart = bandStart + (bandWidth - groupWidth) / 2;
    centers.push(bandStart + bandWidth / 2);
    const group: BarSlot[] = [];
    for (let s = 0; s < seriesCount; s++) {
      group.push({ x: groupStart + s * (barWidth + barGap), width: barWidth });
    }
    slots.push(group);
  }
  return { slots, bandWidth, centers };
}

/** Vertical extent of a bar, handling negative values against the zero baseline. */
export function barExtent(
  valuePx: number,
  zeroPx: number
): { top: number; height: number } {
  const top = Math.min(valuePx, zeroPx);
  return { top, height: Math.abs(valuePx - zeroPx) };
}
