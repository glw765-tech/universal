import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const STAR_DATA = [
  { tr: 0.03, lr: 0.15, s: 1.0, o: 0.5 }, { tr: 0.08, lr: 0.72, s: 2.0, o: 0.8 },
  { tr: 0.12, lr: 0.33, s: 1.0, o: 0.4 }, { tr: 0.18, lr: 0.88, s: 1.5, o: 0.7 },
  { tr: 0.22, lr: 0.05, s: 1.0, o: 0.6 }, { tr: 0.28, lr: 0.55, s: 2.0, o: 0.9 },
  { tr: 0.35, lr: 0.20, s: 1.0, o: 0.5 }, { tr: 0.40, lr: 0.80, s: 1.5, o: 0.6 },
  { tr: 0.45, lr: 0.45, s: 1.0, o: 0.4 }, { tr: 0.52, lr: 0.10, s: 2.0, o: 0.7 },
  { tr: 0.58, lr: 0.65, s: 1.0, o: 0.8 }, { tr: 0.62, lr: 0.30, s: 1.5, o: 0.5 },
  { tr: 0.70, lr: 0.90, s: 1.0, o: 0.6 }, { tr: 0.75, lr: 0.50, s: 2.0, o: 0.7 },
  { tr: 0.80, lr: 0.25, s: 1.0, o: 0.4 }, { tr: 0.85, lr: 0.75, s: 1.5, o: 0.8 },
  { tr: 0.90, lr: 0.40, s: 1.0, o: 0.5 }, { tr: 0.95, lr: 0.60, s: 2.0, o: 0.6 },
  { tr: 0.06, lr: 0.95, s: 1.0, o: 0.7 }, { tr: 0.15, lr: 0.50, s: 1.5, o: 0.4 },
  { tr: 0.25, lr: 0.78, s: 1.0, o: 0.9 }, { tr: 0.32, lr: 0.42, s: 2.0, o: 0.5 },
  { tr: 0.48, lr: 0.92, s: 1.0, o: 0.6 }, { tr: 0.55, lr: 0.18, s: 1.5, o: 0.8 },
  { tr: 0.65, lr: 0.58, s: 1.0, o: 0.4 }, { tr: 0.72, lr: 0.08, s: 2.0, o: 0.7 },
  { tr: 0.78, lr: 0.85, s: 1.0, o: 0.5 }, { tr: 0.88, lr: 0.35, s: 1.5, o: 0.6 },
  { tr: 0.93, lr: 0.72, s: 1.0, o: 0.8 }, { tr: 0.10, lr: 0.38, s: 1.5, o: 0.5 },
];

export function CosmicBackground() {
  const { width, height } = useWindowDimensions();

  const stars = useMemo(
    () =>
      STAR_DATA.map((s, i) => ({
        id: i,
        top: s.tr * height,
        left: s.lr * width,
        size: s.s,
        opacity: s.o,
      })),
    [width, height]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#0a0315', '#0e0520', '#0c0418', '#0a0315']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Nebula glows */}
      <View
        style={[
          styles.nebula,
          { top: height * 0.15, left: width * 0.05, width: width * 0.8, height: width * 0.8 },
        ]}
      />
      <View
        style={[
          styles.nebula2,
          { top: height * 0.55, left: width * 0.3, width: width * 0.7, height: width * 0.7 },
        ]}
      />
      {/* Stars */}
      {stars.map(star => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nebula: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(120, 40, 200, 0.07)',
  },
  nebula2: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(80, 20, 160, 0.05)',
  },
});
