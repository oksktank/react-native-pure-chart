import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-pure-chart';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const single = [30, 200, 170, 250, 10, 130].map((value, i) => ({
  value,
  label: MONTHS[i],
}));

const multi = [
  {
    name: 'iOS',
    data: [40, 55, 32, 70].map((value, i) => ({ value, label: `Q${i + 1}` })),
  },
  { name: 'Android', data: [65, 80, 45, 90] },
  { name: 'Web', data: [20, 35, 25, 40] },
];

const withNegatives = [12, -8, 25, -15, 30, 5].map((value, i) => ({
  value,
  label: MONTHS[i],
}));

export function BarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.caseTitle}>horizontal bars</Text>
      <BarChart data={single} horizontal height={200} />
      <Text style={styles.caseTitle}>
        scrollable (barWidth 36, 20 categories, starts at end)
      </Text>
      <BarChart
        data={Array.from({ length: 20 }, (_, i) => ({
          value: Math.round(50 + 40 * Math.sin(i / 2)),
          label: `D${i + 1}`,
        }))}
        barWidth={36}
        height={160}
        initialScroll="end"
      />
      <Text style={styles.caseTitle}>single series + value labels</Text>
      <BarChart
        data={single}
        renderValueLabel={(e) => (
          <Text style={{ fontSize: 10, color: '#6B7280' }}>{e.value}</Text>
        )}
      />
      <Text style={styles.caseTitle}>multi series (grouped)</Text>
      <BarChart data={multi} />
      <Text style={styles.caseTitle}>negative values</Text>
      <BarChart data={withNegatives} height={180} />
      <Text style={styles.caseTitle}>dark theme + custom ticks</Text>
      <View style={styles.darkCard}>
        <BarChart
          data={single}
          theme="dark"
          height={180}
          yAxis={{ tickCount: 3 }}
        />
      </View>
      <Text style={styles.caseTitle}>large values (compact labels)</Text>
      <BarChart
        data={[1200000, 2500000, 1800000, 3400000].map((value, i) => ({
          value,
          label: `W${i + 1}`,
        }))}
        height={160}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  caseTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  darkCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
});
