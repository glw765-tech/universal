import React, { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

// Deterministic star positions — no Math.random at module scope
const STAR_DATA = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: `${((i * 37 + 13) % 97)}%` as DimensionValue,
  y: `${((i * 53 + 7) % 89)}%` as DimensionValue,
  size: (i % 3) + 1,
  delay: (i * 180) % 2800,
  duration: 2500 + (i * 350) % 2000,
  baseOpacity: 0.1 + (i % 5) * 0.06,
  maxOpacity: 0.35 + (i % 4) * 0.12,
}));

interface StarItemProps {
  x: DimensionValue;
  y: DimensionValue;
  size: number;
  delay: number;
  duration: number;
  baseOpacity: number;
  maxOpacity: number;
  color: string;
}

function StarItem({
  x,
  y,
  size,
  delay,
  duration,
  baseOpacity,
  maxOpacity,
  color,
}: StarItemProps) {
  const opacity = useSharedValue(baseOpacity);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(maxOpacity, { duration }), -1, true)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        animStyle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export default function StarField() {
  const colors = useColors();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.background, colors.card, colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {STAR_DATA.map((star) => (
        <StarItem key={star.id} {...star} color={colors.foreground} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
