import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import StarField from '@/components/StarField';

export default function CancelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[s.fill, { backgroundColor: colors.background }]}>
      <StarField />
      <View style={[s.container, { paddingTop: topPad + 40, paddingBottom: bottomPad + 40 }]}>
        <View style={[s.iconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="moon-outline" size={48} color={colors.mutedForeground} />
        </View>

        <View style={s.textBlock}>
          <Text style={[s.heading, { color: colors.foreground }]}>That's Okay</Text>
          <Text style={[s.subheading, { color: colors.mutedForeground }]}>
            The universe is patient. Your intention is still here whenever you're ready to seal it.
          </Text>
        </View>

        <View style={s.actions}>
          <Pressable
            style={[s.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.replace('/');
            }}
          >
            <Ionicons name="arrow-back-outline" size={18} color={colors.primaryForeground} />
            <Text style={[s.primaryBtnText, { color: colors.primaryForeground }]}>Return Home</Text>
          </Pressable>
        </View>
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
    borderWidth: 1,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
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
});
