import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import StarField from '@/components/StarField';

export default function SuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[s.fill, { backgroundColor: colors.background }]}>
      <StarField />
      <View style={[s.container, { paddingTop: topPad + 40, paddingBottom: bottomPad + 40 }]}>
        <Animated.View style={[s.iconWrap, iconStyle, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Ionicons name="sparkles" size={48} color={colors.primary} />
        </Animated.View>

        <Animated.View style={[s.textBlock, textStyle]}>
          <Text style={[s.heading, { color: colors.foreground }]}>Sent to the Universe</Text>
          <Text style={[s.subheading, { color: colors.mutedForeground }]}>
            Your intention has been sealed and dispatched. Stay open — the universe works in its own time.
          </Text>
        </Animated.View>

        <Animated.View style={[s.actions, textStyle]}>
          <Pressable
            style={[s.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.replace('/track');
            }}
          >
            <Ionicons name="radio-outline" size={18} color={colors.primaryForeground} />
            <Text style={[s.primaryBtnText, { color: colors.primaryForeground }]}>Track Your Order</Text>
          </Pressable>

          <Pressable
            style={[s.secondaryBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.replace('/');
            }}
          >
            <Text style={[s.secondaryBtnText, { color: colors.mutedForeground }]}>Back to Home</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  subheading: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
  },
});
