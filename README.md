# react-native-pure-chart

> Charts built from nothing but `<View>` and `<Text>`.
> **Zero dependencies. No native modules. No SVG, no Skia.**

[![npm](https://img.shields.io/npm/v/react-native-pure-chart.svg)](https://www.npmjs.com/package/react-native-pure-chart)
[![npm downloads](https://img.shields.io/npm/dm/react-native-pure-chart.svg)](https://www.npmjs.com/package/react-native-pure-chart)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![types](https://img.shields.io/badge/types-TypeScript-blue)
![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

`react-native-pure-chart` draws every axis, line, bar and pie slice with plain
React Native core components — rotated `View`s with `transformOrigin`, circular
clipping, and the `Animated` API. Nothing to link, nothing to compile.

<table>
<tr>
<td width="33%"><img src="docs/hero-line.png" alt="Line chart with area fill" /></td>
<td width="33%"><img src="docs/hero-bar.png" alt="Grouped bar chart" /></td>
<td width="33%"><img src="docs/hero-pie.png" alt="Donut chart with center label" /></td>
</tr>
</table>

## Why pure?

- **`npm install` and you're done.** No `pod install`, no config plugin, no
  native linking — works in **Expo Go**, bare RN, and react-native-web.
- **Survives every React Native upgrade.** Only core components are used, so
  there is no native module to break on the next RN release.
- **New Architecture native.** Built for RN 0.76+ / Fabric; animations run on
  the native driver (transform/opacity only).

## Quick start

```tsx
import { LineChart } from 'react-native-pure-chart';

<LineChart data={[30, 200, 170, 250, 10]} />;
```

That's a full chart: width fills the parent, nice-number ticks, compact
`1.2K`-style labels, and a 500 ms entrance animation — all defaults.

## Installation

```sh
npm install react-native-pure-chart
# or
yarn add react-native-pure-chart
```

Requires React Native 0.73+ (for `transformOrigin`). No other setup.

---

# Gallery

Every image below is a real screenshot from `example/` on an iOS simulator —
the code under each one is what produced it.

## Line charts

<table>
<tr>
<td width="50%">

<img src="docs/line-basic.png" alt="Multi-series line chart" />

**Multi-series + legend**

```tsx
<LineChart data={revenue} height={200} />
```

</td>
<td width="50%">

<img src="docs/line-area.png" alt="Monotone line chart with area fill" />

**Smooth curve + area fill**

```tsx
<LineChart data={traffic} curve="monotone" area />
```

</td>
</tr>
<tr>
<td width="50%">

<img src="docs/line-step.png" alt="Step line chart" />

**Step curve, thick, no dots**

```tsx
<LineChart
  data={traffic}
  curve="step"
  strokeWidth={3}
  showDataPoints={false}
/>
```

</td>
<td width="50%">

<img src="docs/line-missing.png" alt="Line chart with missing values" />

**`null` values break the line**

```tsx
<LineChart data={[50, null, null, 90, 40, 70, 20, 60]} />
```

</td>
</tr>
<tr>
<td width="50%">

<img src="docs/line-value-labels.png" alt="Line chart with custom value labels" />

**Custom value labels**

```tsx
<LineChart
  data={traffic}
  curve="monotone"
  renderValueLabel={(e) => <Pill value={e.value} />}
/>
```

</td>
<td width="50%">

<img src="docs/line-tooltip.png" alt="Line chart with tooltip" />

**Built-in tooltip + guide line**

```tsx
// tap, or drive it yourself
<LineChart data={revenue} selectedIndex={3} />
```

</td>
</tr>
</table>

## Bar charts

<table>
<tr>
<td width="50%">

<img src="docs/bar-grouped.png" alt="Grouped bar chart" />

**Grouped**

```tsx
<BarChart data={platforms} barRadius={5} />
```

</td>
<td width="50%">

<img src="docs/bar-stacked.png" alt="Stacked bar chart" />

**Stacked**

```tsx
<BarChart data={platforms} stacked barRadius={5} />
```

</td>
</tr>
<tr>
<td width="50%">

<img src="docs/bar-horizontal.png" alt="Horizontal bar chart" />

**Horizontal**

```tsx
<BarChart data={monthly} horizontal barRadius={5} />
```

</td>
<td width="50%">

<img src="docs/bar-negative.png" alt="Bar chart with negative values" />

**Negative values**

```tsx
<BarChart data={[12, -8, 25, -15, 30, 5]} barRadius={5} />
```

</td>
</tr>
<tr>
<td width="50%">

<img src="docs/bar-selection.png" alt="Bar chart with a selected category" />

**Selection dims the rest**

```tsx
<BarChart data={platforms} selectedIndex={2} />
```

</td>
<td width="50%">

<img src="docs/bar-stacked-dark.png" alt="Horizontal stacked bar chart, dark theme" />

**Stacked + horizontal + dark**

```tsx
<BarChart data={platforms} stacked horizontal theme="dark" />
```

</td>
</tr>
</table>

## Pie & donut

<table>
<tr>
<td width="50%">

<img src="docs/pie-basic.png" alt="Pie chart" />

**Pie + legend**

```tsx
<PieChart data={budget} size={200} />
```

</td>
<td width="50%">

<img src="docs/pie-donut.png" alt="Donut chart with center label" />

**Donut + center label**

```tsx
<PieChart
  data={budget}
  innerRadius="60%"
  renderCenterLabel={() => <Total />}
/>
```

</td>
</tr>
<tr>
<td width="50%">

<img src="docs/pie-labels.png" alt="Pie chart with percentage labels" />

**On-slice labels + `padAngle`**

```tsx
<PieChart data={budget} padAngle={2} sliceLabel="percentage" />
```

</td>
<td width="50%">

<img src="docs/pie-dark.png" alt="Donut chart, dark theme" />

**Dark donut**

```tsx
<PieChart data={budget} innerRadius="60%" theme="dark" />
```

</td>
</tr>
</table>

## Dark mode

One prop. Pass `useColorScheme()` straight through and every axis, grid line,
label and tooltip flips with it.

```tsx
import { useColorScheme } from 'react-native';

const scheme = useColorScheme();

<LineChart data={revenue} theme={scheme === 'dark' ? 'dark' : 'light'} />;
```

<table>
<tr>
<td width="50%"><img src="docs/line-dark.png" alt="Line chart, dark theme" /></td>
<td width="50%"><img src="docs/bar-dark.png" alt="Bar chart, dark theme" /></td>
</tr>
</table>

---

# API

Runtime exports: `LineChart`, `BarChart`, `PieChart`, `DEFAULT_PALETTE`,
`formatCompact`. Every prop and payload type is exported too
(`LineChartProps`, `PressEvent`, `ChartTheme`, …).

## Data

```tsx
type ChartData =
  | readonly (number | null | DataPoint)[] // one series
  | readonly Series[]; // many

interface DataPoint {
  value: number | null; // null = missing
  label?: string; // x-axis label
  color?: string; // per-point override
  extra?: unknown; // returned untouched in press events
}

interface Series {
  data: readonly (number | null | DataPoint)[];
  name?: string; // legend + tooltip
  color?: string; // defaults to palette[seriesIndex]
}
```

Numbers, `null`s and `DataPoint` objects can be mixed freely in one array.
Pie charts take `PieSliceDatum[]` — `{ value, label?, color?, extra? }`.

## Colors

Nothing is hard-coded. Colors come from four levels, most specific first:

```tsx
// 1. the whole chart — replaces the auto-assigned palette
<BarChart data={data} palette={['#FF6B6B', '#4ECDC4', '#FFD93D']} />

// 2. one series / one pie slice
<LineChart data={[{ name: 'Sales', data: [30, 90, 50], color: '#FF6B6B' }]} />
<PieChart data={[{ value: 50, label: 'Marketing', color: '#FF6B6B' }]} />

// 3. one bar — highlight a single value
<BarChart data={[30, { value: 90, color: '#FF6B6B' }, 50]} />

// 4. line dots, independently of the line
<LineChart data={data} showDataPoints={{ color: '#111827', radius: 5 }} />
```

The palette cycles when there are more series than colors, so it never runs
out. Extend the built-in one instead of retyping it:

```tsx
import { DEFAULT_PALETTE } from 'react-native-pure-chart';

<BarChart data={data} palette={['#FF6B6B', ...DEFAULT_PALETTE]} />;
```

Two limits worth knowing: a per-point `color` applies to **grouped and
single-series bars only** — stacked segments take the series color — and line
segments always use the series color, so a single point can't recolor the line
it sits on. Axis, grid, label and tooltip colors are not part of the palette;
they come from [`theme`](#theme-legend-tooltip-events).

## LineChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `ChartData` | — | Numbers, `{value, label}` objects, or an array of series |
| `strokeWidth` | `number` | `2` | Line thickness (no upper limit) |
| `curve` | `'linear' \| 'step' \| 'monotone'` | `'linear'` | `'monotone'` draws a smooth curve that never overshoots the data |
| `area` | `boolean \| {opacity}` | `false` | Fill between the line and the zero baseline (default opacity `0.15`) |
| `showDataPoints` | `boolean \| {radius, color}` | `true` | Point markers. Default radius `max(3, strokeWidth * 1.5)` |
| `missingValues` | `'break' \| 'interpolate' \| 'zero'` | `'break'` | How `null` values are treated |
| `spacing` | `number` | auto | Exact px between points. Auto mode fills the width, but never squeezes below 40px — the chart grows and scrolls instead |
| `scrollable` | `boolean` | `true` | Horizontal scroll when content overflows |
| `initialScroll` | `'start' \| 'end'` | `'start'` | Initial scroll position |
| `legend` | `boolean \| LegendOptions` | auto | Shown when there are 2+ series and at least one is named |
| `tooltip` | `boolean \| TooltipOptions` | `true` | Built-in tooltip + selection guide |
| `onPointPress` | `(e: PressEvent) => void` | — | Tap on the chart (nearest point wins) |
| `selectedIndex` / `onSelectionChange` | `number \| null` | — | Controlled selection |
| `renderDataPoint` | `(e: PressEvent) => ReactNode` | — | Replace point markers |
| `renderValueLabel` | `(e: PressEvent) => ReactNode` | — | Always-visible label above points |
| `xAxis` / `yAxis` | see [Axes](#axes) | — | Ticks, grid, formatters |

## BarChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `ChartData` | — | Same shapes as LineChart |
| `barWidth` | `number` | auto | Bar width. Auto mode fills the width, but grows and scrolls instead of rendering sliver bars for many categories |
| `barRadius` | `number` | `4` | Corner radius on the value end |
| `barGap` | `number` | `2` | Gap between bars in a group |
| `groupGap` | `number` | auto | Gap between categories |
| `stacked` | `boolean` | `false` | Stack multi-series values (positives up, negatives down) |
| `horizontal` | `boolean` | `false` | Horizontal bars (`yAxis` still configures the value axis) |
| `legend` | `boolean \| LegendOptions` | auto | Same rule as LineChart |
| `scrollable` / `initialScroll` |  | `true` / `'start'` | Vertical bars only — horizontal bars always fit their height |
| `tooltip` | `boolean \| TooltipOptions` | `true` | Selection also dims the other categories |
| `onPointPress` / `selectedIndex` / `onSelectionChange` |  |  | Same as LineChart |
| `renderValueLabel` | `(e: PressEvent) => ReactNode` | — | Label above each bar |
| `xAxis` / `yAxis` | see [Axes](#axes) | — | `yAxis` is always the value axis |

Negative values are supported — bars grow down from the zero baseline, and
stacks split at it.

## PieChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `PieSliceDatum[]` | — | `{value, label?, color?, extra?}` per slice |
| `size` | `number` | `200` | Diameter in px |
| `innerRadius` | `number \| '60%'` | `0` | Donut hole — px, or a % of the radius |
| `holeColor` | `string` | theme background | Hole fill (opaque — see [Limitations](#limitations)) |
| `startAngle` | `number` | `0` | Degrees clockwise from 12 o'clock |
| `padAngle` | `number` | `0` | Gap between slices in degrees |
| `sliceLabel` | `'none' \| 'label' \| 'value' \| 'percentage' \| (e) => string` | `'none'` | On-slice labels |
| `legend` | `boolean \| LegendOptions` | `true` | Lists every labeled slice |
| `focusOnPress` | `boolean` | `true` | Tapped slice slides outward |
| `onSlicePress` | `(e: SlicePressEvent) => void` | — | Tap on a slice |
| `selectedIndex` / `onSelectionChange` | `number \| null` | — | Controlled selection |
| `renderCenterLabel` | `(selected: SlicePressEvent \| null) => ReactNode` | — | Donut center content |

`PieChart` sizes itself with `size` — it does not take `width`, `height` or
`padding`.

## Common props

Every chart accepts:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | parent width | Measured with `onLayout` when omitted |
| `height` | `number` | `220` | Plot height (pies use `size`) |
| `padding` | `number \| {top, right, bottom, left}` | `{top: 12, right: 12, bottom: 0, left: 0}` | Inner padding of the plot area |
| `palette` | `string[]` | built-in 10 colors | Auto-assigned series/slice colors — exported as `DEFAULT_PALETTE` |
| `theme` | `'light' \| 'dark' \| ChartTheme` | `'light'` | Pass `useColorScheme()` output directly |
| `animate` | `boolean \| AnimationConfig` | `true` | `{duration, delay, easing, type: 'grow' \| 'fade' \| 'none'}` |
| `style`, `testID`, `accessibilityLabel` |  |  | Standard RN props (a11y label auto-generated) |

The default entrance (`type: 'grow'`) is chart-aware: lines draw left to
right, bars grow from the baseline with a stagger, pies sweep clockwise.
One `Animated.Value` drives the whole chart on the native driver.

## Axes

`yAxis` configures the value axis (including on horizontal bars), `xAxis` the
category axis.

| `YAxisOptions` | Type | Default |
| --- | --- | --- |
| `show` | `boolean` | `true` |
| `tickCount` | `number` | `5` |
| `min` / `max` | `number` | nice-number bounds from the data |
| `formatLabel` | `(value, index) => string` | `formatCompact` |
| `showGridLines` | `boolean` | `true` |
| `gridLineStyle` | `'solid' \| 'dashed'` | `'dashed'` |
| `showAxisLine` | `boolean` | `false` |
| `position` | `'left' \| 'right'` | `'left'` (ignored by horizontal bars) |
| `labelStyle` | `TextStyle` | — |

| `XAxisOptions` | Type | Default |
| --- | --- | --- |
| `show` | `boolean` | `true` (auto-hidden when no point has a label) |
| `interval` | `number \| 'auto'` | `'auto'` — thins labels to fit the width |
| `formatLabel` | `(label, index) => string` | identity |
| `showAxisLine` | `boolean` | `true` |
| `showGridLines` | `boolean` | `false` |
| `labelStyle` | `TextStyle` | — |

## Theme, legend, tooltip, events

```tsx
interface ChartTheme {
  gridColor?: string;
  axisColor?: string;
  labelColor?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  /** Only used as the donut hole fill — charts never paint their background. */
  backgroundColor?: string;
}

interface LegendOptions {
  position?: 'top' | 'bottom'; // default 'bottom'
  labelStyle?: TextStyle;
}

interface TooltipOptions {
  render?: (e: PressEvent) => ReactNode; // replace it entirely
  formatValue?: (value: number) => string; // default formatCompact
  dismissOnTapOutside?: boolean; // default true
}

interface PressEvent {
  point: DataPoint;
  value: number | null;
  label?: string;
  index: number; // index within the series
  seriesIndex: number;
  seriesName?: string;
  position: { x: number; y: number }; // px, relative to the chart
}

interface SlicePressEvent {
  slice: PieSliceDatum;
  index: number;
  value: number;
  percentage: number; // 0..1
}
```

---

# Guides

### Handling missing data

`null` values are first-class citizens in line charts:

- `'break'` (default) — the line is interrupted, like recharts'
  `connectNulls={false}`. An isolated point still gets its dot.
- `'interpolate'` — gaps are bridged linearly; synthetic points get no markers
- `'zero'` — nulls are treated as 0

Bars always render `null` as an empty slot (the category label remains).

### Controlled selection

Omit `selectedIndex` and the chart manages selection itself. Pass it and you
own it — useful for syncing a chart with an external list:

```tsx
const [selected, setSelected] = useState<number | null>(null);

<BarChart
  data={data}
  selectedIndex={selected}
  onSelectionChange={setSelected}
  onPointPress={(e) => console.log(e.seriesName, e.label, e.value)}
/>;
```

### Custom tooltips

```tsx
<BarChart
  data={data}
  tooltip={{
    render: (e) => (
      <View style={styles.tip}>
        <Text>
          {e.seriesName}: {e.value}
        </Text>
      </View>
    ),
  }}
/>
```

### Axis formatting

`formatCompact` (exported) is the default y-axis formatter: `1234 → '1.2K'`,
`2500000 → '2.5M'`. Compose it for currencies or percentages:

```tsx
import { formatCompact } from 'react-native-pure-chart';

<LineChart
  data={revenue}
  yAxis={{ tickCount: 4, formatLabel: (v) => `$${formatCompact(v)}` }}
  xAxis={{ interval: 2 }}
/>;
```

### Many points

Auto sizing never crams points closer than 40px (or bars thinner than 12px).
Past that the chart grows wider than its viewport and scrolls horizontally,
with the y-axis labels staying put. Set `scrollable={false}` to squeeze
everything into the width instead, or `initialScroll="end"` to open on the
most recent data.

## Limitations

Honesty section — the price of the zero-dependency concept:

- **Smooth curves cost Views.** `curve="monotone"` approximates the curve
  with short line segments (budgeted at ~400 per series). For very dense
  series prefer `'linear'`.
- **Donut holes are opaque.** The hole is a colored circle overlay, so donuts
  don't work on top of images/gradients. Set `holeColor` to match your
  background.
- **Large datasets:** each point/segment is a `View`. A few hundred points are
  fine; for thousands of points use an SVG- or Skia-based library instead.

## Migrating from 0.x

Version 2 is a complete rewrite with **no backward compatibility**. The old
`<PureChart type="..." />` component is gone — import charts directly:

| 0.x | 2.x |
| --- | --- |
| `<PureChart type="line" />` | `<LineChart />` |
| `<PureChart type="bar" />` | `<BarChart />` |
| `<PureChart type="pie" />` | `<PieChart />` |
| `data={[{x, y}]}` | `data={[{value, label}]}` |
| `data={[{seriesName, data, color}]}` | `data={[{name, data, color}]}` |
| `gap` | `spacing` |
| `lineThickness` (max 10) | `strokeWidth` (unlimited) |
| `numberOfYAxisGuideLine` | `yAxis={{ tickCount }}` |
| `yAxisSymbol` | `yAxis={{ formatLabel }}` |
| `showXAxisLabel` / `showYAxisLabel` | `xAxis={{ show }}` / `yAxis={{ show }}` |
| `showEvenNumberXaxisLabel` | `xAxis={{ interval }}` |
| `initialScrollPosition` + `initialScrollTimeOut` | `initialScroll: 'start' \| 'end'` |
| `onPress(index)` | `onPointPress(event)` — full event object |
| `customValueRenderer` | `renderValueLabel` |
| `defaultColumnWidth` / `defaultColumnMargin` | `barWidth` / `groupGap` |
| `primaryColor` / `colors` | `Series.color` / `palette` |

## Development

```sh
npm install          # library dev deps
npm test             # unit tests for the core + component tests
npm run typecheck

cd example && npm install
npm start            # gallery app against the local ../src (live editing)
npm run start:npm    # gallery app against the published npm package
```

The `example/` app is a gallery of every chart variant, including artifact
stress tests (1° pie slices, high-contrast neighbors, missing data). It runs
in two modes: `npm start` resolves the library from `../src` for live
development, while `npm run start:npm` resolves the version installed from
npm — use it to smoke-test a release exactly as consumers get it.
`example/screens/ShotScreen.tsx` is the reproducible source of every image in
`docs/` — flip `SHOT_MODE` in `example/App.tsx`, pick a group, screenshot.

## License

MIT
