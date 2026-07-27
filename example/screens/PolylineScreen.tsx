import { StyleSheet, Text, View } from 'react-native';
import {
  polylineSegments,
  stepSegments,
  type Point,
} from 'react-native-pure-chart/core/geometry';
import { LineSegment } from 'react-native-pure-chart/primitives/LineSegment';
import { Dot } from 'react-native-pure-chart/primitives/Dot';

const POINTS: Point[] = [
  { x: 10, y: 150 },
  { x: 70, y: 30 },
  { x: 130, y: 120 },
  { x: 190, y: 40 },
  { x: 250, y: 140 },
  { x: 310, y: 90 },
];

function Polyline({
  points,
  thickness,
  color,
  joins,
  step,
}: {
  points: Point[];
  thickness: number;
  color: string;
  joins?: boolean;
  step?: boolean;
}) {
  const segments = step ? stepSegments(points) : polylineSegments(points);
  return (
    <>
      {segments.map((segment, i) => (
        <LineSegment
          key={i}
          layout={segment}
          thickness={thickness}
          color={color}
        />
      ))}
      {joins
        ? points.map((p, i) => (
            <Dot key={i} x={p.x} y={p.y} radius={thickness / 2} color={color} />
          ))
        : null}
    </>
  );
}

/** Segments at every 15° — angle math is wrong if this isn't a clean starburst. */
function Starburst() {
  const center = { x: 160, y: 80 };
  const segments = [];
  for (let deg = 0; deg < 360; deg += 15) {
    const rad = (deg * Math.PI) / 180;
    segments.push({
      x: center.x,
      y: center.y,
      length: 70,
      angleRad: rad,
    });
  }
  return (
    <>
      {segments.map((s, i) => (
        <LineSegment key={i} layout={s} thickness={3} color="#5B8FF9" />
      ))}
      <Dot x={center.x} y={center.y} radius={5} color="#F6903D" />
    </>
  );
}

function Case({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.caseTitle}>{title}</Text>
      <View style={styles.canvas}>{children}</View>
    </View>
  );
}

export function PolylineScreen() {
  return (
    <View style={styles.container}>
      <Case title="starburst (angle sanity)">
        <Starburst />
      </Case>
      <Case title="thickness 2, no joins">
        <Polyline points={POINTS} thickness={2} color="#5B8FF9" />
      </Case>
      <Case title="thickness 8 + round joins">
        <Polyline points={POINTS} thickness={8} color="#61DDAA" joins />
      </Case>
      <Case title="thickness 16 + round joins (legacy clamped at 10)">
        <Polyline points={POINTS} thickness={16} color="#F08BB4" joins />
      </Case>
      <Case title="step curve">
        <Polyline points={POINTS} thickness={3} color="#9661BC" />
        <Polyline points={POINTS} thickness={3} color="#F6BD16" step />
      </Case>
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
  canvas: {
    height: 170,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});
