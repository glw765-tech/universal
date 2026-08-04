import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const TABS = [
  {
    name: 'Order',
    route: '/(tabs)/',
    featherIcon: 'star' as const,
    sfIcon: 'sparkles',
  },
  {
    name: 'Track',
    route: '/(tabs)/track',
    featherIcon: 'compass' as const,
    sfIcon: 'location.circle',
  },
  {
    name: 'History',
    route: '/(tabs)/history',
    featherIcon: 'clock' as const,
    sfIcon: 'clock',
  },
];

interface BottomTabBarProps {
  /** The currently active tab name — 'Order', 'Track', or 'History' */
  activeTab?: string;
}

export function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  const barHeight = isWeb ? 84 : 54 + insets.bottom;

  return (
    <View style={[styles.wrapper, { height: barHeight }]}>
      {/* Background */}
      {isIOS ? (
        <BlurView
          intensity={60}
          tint="dark"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,3,21,0.85)' }]}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
      )}

      {/* Top border */}
      <View style={[styles.border, { backgroundColor: colors.border }]} />

      {/* Tab buttons */}
      <View style={styles.row}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.name;
          const color = isActive ? colors.primary : colors.mutedForeground;

          return (
            <Pressable
              key={tab.name}
              onPress={() => router.push(tab.route as any)}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.7 : 1 }]}
            >
              {isIOS ? (
                <SymbolView name={isActive ? `${tab.sfIcon}.fill` : tab.sfIcon} tintColor={color} size={22} />
              ) : (
                <Feather name={tab.featherIcon} size={22} color={color} />
              )}
              <Text style={[styles.label, { color }]}>{tab.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  border: {
    height: 1,
    width: '100%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
});
