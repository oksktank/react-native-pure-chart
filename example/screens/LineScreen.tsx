import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-pure-chart';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const single = [30, 200, 170, 250, 10, 130].map((value, i) => ({
  value,
  label: MONTHS[i],
}));

const multi = [
  {
    name: '2025',
    data: [1200, 1900, null, 2400, 3100, 2800].map((value, i) => ({
      value,
      label: MONTHS[i],
    })),
  },
  { name: '2026', data: [1500, 2200, 2800, 3400, 4100, 3900] },
];

const gappy = [50, null, null, 90, 40, null, 70, 20];

export function LineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.caseTitle}>quick start (3 lines of code)</Text>
      <LineChart data={[30, 200, 170, 250, 10]} />
      <Text style={styles.caseTitle}>multi series + null (break)</Text>
      <LineChart data={multi} />
      <Text style={styles.caseTitle}>missingValues: interpolate</Text>
      <LineChart data={gappy} height={140} missingValues="interpolate" />
      <Text style={styles.caseTitle}>missingValues: zero</Text>
      <LineChart data={gappy} height={140} missingValues="zero" />
      <Text style={styles.caseTitle}>step curve, thick, no points</Text>
      <LineChart
        data={single}
        height={160}
        curve="step"
        strokeWidth={4}
        showDataPoints={false}
      />
      <Text style={styles.caseTitle}>dark theme</Text>
      <View style={styles.darkCard}>
        <LineChart data={multi} theme="dark" height={180} />
      </View>
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
