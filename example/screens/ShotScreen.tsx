/**
 * Deterministic source for the README screenshots in `docs/`.
 *
 * Every shot renders alone in a fixed-height card on a plain background, so
 * a device screenshot can be cropped and trimmed to a tight chart image.
 * Change `GROUP` below, cold-reload the app, capture, repeat — the shot
 * order inside a group is the order of the images.
 */
import { StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-pure-chart';

/** Which group of shots to render. */
const GROUP = 0;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const withLabels = (values: (number | null)[], labels: string[]) =>
  values.map((value, i) => ({ value, label: labels[i] }));

const revenue = [
  { name: '2025', data: withLabels([1200, 1900, 2100, 2400, 3100, 2800], MONTHS) },
  { name: '2026', data: [1500, 2200, 2800, 3400, 4100, 3900] },
];

const traffic = withLabels([30, 200, 170, 250, 90, 210], MONTHS);
const gappy = withLabels([50, null, null, 90, 40, 70, 20, 60], [
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
]);

const platforms = [
  { name: 'iOS', data: withLabels([40, 55, 32, 70], QUARTERS) },
  { name: 'Android', data: [65, 80, 45, 90] },
  { name: 'Web', data: [20, 35, 25, 40] },
];

const cashflow = withLabels([12, -8, 25, -15, 30, 5], MONTHS);

const budget = [
  { value: 50, label: 'Marketing' },
  { value: 40, label: 'Sales' },
  { value: 25, label: 'Support' },
  { value: 15, label: 'R&D' },
];

function Pill({ value, dark }: { value: number | null; dark?: boolean }) {
  return (
    <View style={[styles.pill, dark && styles.pillDark]}>
      <Text style={[styles.pillText, dark && styles.pillTextDark]}>{value}</Text>
    </View>
  );
}

function DonutCenter({ dark }: { dark?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.centerValue, dark && styles.centerValueDark]}>130</Text>
      <Text style={styles.centerCaption}>total spend</Text>
    </View>
  );
}

interface Shot {
  name: string;
  node: React.ReactNode;
}

interface Group {
  tone: 'light' | 'dark';
  /** Card height in pt; every shot in a group shares it. */
  cardHeight?: number;
  shots: Shot[];
}

const GROUPS: Group[] = [
  // 0 — hero: one image with all three chart types.
  {
    tone: 'light',
    cardHeight: 250,
    shots: [
      {
        name: 'hero-line',
        node: <LineChart data={revenue} height={150} curve="monotone" area />,
      },
      {
        name: 'hero-bar',
        node: <BarChart data={platforms} height={150} barRadius={5} />,
      },
      {
        name: 'hero-pie',
        node: (
          <PieChart
            data={budget}
            size={140}
            innerRadius="58%"
            renderCenterLabel={() => <DonutCenter />}
          />
        ),
      },
    ],
  },
  // 1
  {
    tone: 'light',
    shots: [
      { name: 'line-basic', node: <LineChart data={revenue} height={200} /> },
      {
        name: 'line-area',
        node: <LineChart data={traffic} height={200} curve="monotone" area />,
      },
    ],
  },
  // 2
  {
    tone: 'light',
    shots: [
      {
        name: 'line-step',
        node: (
          <LineChart
            data={traffic}
            height={200}
            curve="step"
            strokeWidth={3}
            showDataPoints={false}
          />
        ),
      },
      {
        name: 'line-missing',
        node: <LineChart data={gappy} height={200} />,
      },
    ],
  },
  // 3
  {
    tone: 'light',
    shots: [
      {
        name: 'line-value-labels',
        node: (
          <LineChart
            data={traffic}
            height={200}
            curve="monotone"
            renderValueLabel={(e) => <Pill value={e.value} />}
          />
        ),
      },
      {
        name: 'line-tooltip',
        node: <LineChart data={revenue} height={200} selectedIndex={3} />,
      },
    ],
  },
  // 4
  {
    tone: 'light',
    shots: [
      {
        name: 'bar-grouped',
        node: <BarChart data={platforms} height={200} barRadius={5} />,
      },
      {
        name: 'bar-stacked',
        node: <BarChart data={platforms} height={200} stacked barRadius={5} />,
      },
    ],
  },
  // 5
  {
    tone: 'light',
    shots: [
      {
        name: 'bar-horizontal',
        node: (
          <BarChart
            data={withLabels([30, 200, 170, 250, 90], MONTHS)}
            height={200}
            horizontal
            barRadius={5}
          />
        ),
      },
      {
        name: 'bar-negative',
        node: <BarChart data={cashflow} height={200} barRadius={5} />,
      },
    ],
  },
  // 6
  {
    tone: 'light',
    cardHeight: 320,
    shots: [
      { name: 'pie-basic', node: <PieChart data={budget} size={200} /> },
      {
        name: 'pie-donut',
        node: (
          <PieChart
            data={budget}
            size={200}
            innerRadius="60%"
            renderCenterLabel={() => <DonutCenter />}
          />
        ),
      },
    ],
  },
  // 7
  {
    tone: 'light',
    cardHeight: 320,
    shots: [
      {
        name: 'pie-labels',
        node: (
          <PieChart
            data={budget}
            size={200}
            padAngle={2}
            sliceLabel="percentage"
          />
        ),
      },
      {
        name: 'bar-selection',
        node: (
          <BarChart data={platforms} height={200} barRadius={5} selectedIndex={2} />
        ),
      },
    ],
  },
  // 8 — dark
  {
    tone: 'dark',
    shots: [
      {
        name: 'line-dark',
        node: (
          <LineChart data={revenue} height={200} theme="dark" curve="monotone" area />
        ),
      },
      {
        name: 'bar-dark',
        node: (
          <BarChart data={platforms} height={200} theme="dark" barRadius={5} />
        ),
      },
    ],
  },
  // 9 — dark
  {
    tone: 'dark',
    cardHeight: 320,
    shots: [
      {
        name: 'pie-dark',
        node: (
          <PieChart
            data={budget}
            size={200}
            theme="dark"
            innerRadius="60%"
            renderCenterLabel={() => <DonutCenter dark />}
          />
        ),
      },
      {
        name: 'bar-stacked-dark',
        node: (
          <BarChart
            data={platforms}
            height={200}
            theme="dark"
            stacked
            horizontal
          />
        ),
      },
    ],
  },
];

export function ShotScreen() {
  const group = GROUPS[GROUP]!;
  const cardHeight = group.cardHeight ?? 300;
  return (
    <View
      style={[
        styles.page,
        { backgroundColor: group.tone === 'dark' ? '#111827' : '#FFFFFF' },
      ]}
    >
      {group.shots.map((shot) => (
        <View key={shot.name} style={[styles.card, { height: cardHeight }]}>
          {shot.node}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  card: {
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: '#111827',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9,
  },
  pillDark: {
    backgroundColor: '#F9FAFB',
  },
  pillText: {
    color: '#F9FAFB',
    fontSize: 10,
    fontWeight: '600',
  },
  pillTextDark: {
    color: '#111827',
  },
  centerValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  centerValueDark: {
    color: '#F9FAFB',
  },
  centerCaption: {
    fontSize: 11,
    color: '#6B7280',
  },
});
</content>
