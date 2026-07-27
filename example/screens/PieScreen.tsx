import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-pure-chart';

const budget = [
  { value: 50, label: 'Marketing' },
  { value: 40, label: 'Sales' },
  { value: 25, label: 'Support' },
  { value: 15, label: 'R&D' },
];

// Artifact hunting: extreme angles + maximum contrast neighbors.
const artifacts = [
  { value: 1, label: '1°-ish', color: '#000000' },
  { value: 170, label: 'big', color: '#FFD12F' },
  { value: 2, label: 'thin', color: '#000000' },
  { value: 187, label: 'huge (>180°)', color: '#FF4D7D' },
];

export function PieScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.caseTitle}>sliceLabel: percentage</Text>
      <PieChart data={budget} sliceLabel="percentage" size={160} />
      <Text style={styles.caseTitle}>basic pie + legend</Text>
      <PieChart data={budget} />
      <Text style={styles.caseTitle}>donut (innerRadius 60%) + center label</Text>
      <PieChart
        data={budget}
        innerRadius="60%"
        renderCenterLabel={() => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: '700' }}>130</Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>total</Text>
          </View>
        )}
      />
      <Text style={styles.caseTitle}>padAngle 3° + startAngle 90°</Text>
      <PieChart data={budget} padAngle={3} startAngle={90} size={160} />
      <Text style={styles.caseTitle}>artifact check: 1°/2° slices, high contrast</Text>
      <PieChart data={artifacts} size={180} />
      <Text style={styles.caseTitle}>single slice (100%)</Text>
      <PieChart data={[{ value: 42, label: 'all of it' }]} size={120} />
      <Text style={styles.caseTitle}>two slices 50/50</Text>
      <PieChart
        data={[
          { value: 1, label: 'A' },
          { value: 1, label: 'B' },
        ]}
        size={120}
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
});
