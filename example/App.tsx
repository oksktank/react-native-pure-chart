import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PolylineScreen } from './screens/PolylineScreen';
import { BarScreen } from './screens/BarScreen';
import { LineScreen } from './screens/LineScreen';
import { PieScreen } from './screens/PieScreen';
import { ShotScreen } from './screens/ShotScreen';
import { TouchScreen } from './screens/TouchScreen';

/**
 * Renders `ShotScreen` full-bleed instead of the gallery — the capture mode
 * behind the README images in `docs/`. See ShotScreen for the workflow.
 */
const SHOT_MODE = false;

const SCREENS = {
  Touch: TouchScreen,
  Line: LineScreen,
  Bar: BarScreen,
  Pie: PieScreen,
  Polyline: PolylineScreen,
} as const;

type ScreenName = keyof typeof SCREENS;

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('Touch');
  const Screen = SCREENS[screen];
  if (SHOT_MODE) {
    return <ShotScreen />;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>pure-chart gallery</Text>
      <ScrollView
        horizontal
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
        showsHorizontalScrollIndicator={false}
      >
        {(Object.keys(SCREENS) as ScreenName[]).map((name) => (
          <Pressable
            key={name}
            onPress={() => setScreen(name)}
            style={[styles.tab, screen === name && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, screen === name && styles.tabTextActive]}
            >
              {name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>
        <Screen />
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
  },
  tabs: {
    flexGrow: 0,
    marginTop: 8,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 13,
    color: '#374151',
  },
  tabTextActive: {
    color: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
});
