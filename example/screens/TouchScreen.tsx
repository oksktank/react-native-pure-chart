import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BarChart,
  LineChart,
  PieChart,
  type PressEvent,
  type SlicePressEvent,
} from 'react-native-pure-chart';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const revenue = [
  {
    name: '2025',
    data: [1200, 1900, 1500, 2400, 3100, 2800].map((value, i) => ({
      value,
      label: MONTHS[i],
    })),
  },
  { name: '2026', data: [1500, 2200, 2800, 3400, 4100, 3900] },
];

const budget = [
  { value: 50, label: 'Marketing' },
  { value: 40, label: 'Sales' },
  { value: 25, label: 'Support' },
  { value: 15, label: 'R&D' },
];

export function TouchScreen() {
  const [lastPress, setLastPress] = useState<string>('(tap a chart)');
  const [pieSelection, setPieSelection] = useState<SlicePressEvent | null>(
    null
  );

  const report = (e: PressEvent) => {
    setLastPress(
      `${e.seriesName ?? 'series'} · ${e.label ?? e.index} = ${e.value}`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>last press: {lastPress}</Text>
      </View>
      <Text style={styles.caseTitle}>line — tap for tooltip + guide</Text>
      <LineChart data={revenue} onPointPress={report} />
      <Text style={styles.caseTitle}>bar — tap dims other categories</Text>
      <BarChart data={revenue} onPointPress={report} />
      <Text style={styles.caseTitle}>
        pie — tap explodes slice, center label reacts
      </Text>
      <PieChart
        data={budget}
        innerRadius="55%"
        onSlicePress={(e) => setPieSelection(e)}
        onSelectionChange={(i) => {
          if (i === null) {
            setPieSelection(null);
          }
        }}
        renderCenterLabel={(selected) => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>
              {selected
                ? `${Math.round(selected.percentage * 100)}%`
                : budget.reduce((s, b) => s + b.value, 0)}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {selected ? selected.slice.label : 'total'}
            </Text>
          </View>
        )}
      />
      <Text style={styles.caseTitle}>
        pie selection: {pieSelection ? pieSelection.slice.label : 'none'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  banner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 10,
  },
  bannerText: {
    fontSize: 13,
    color: '#3730A3',
    fontVariant: ['tabular-nums'],
  },
  caseTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
});
