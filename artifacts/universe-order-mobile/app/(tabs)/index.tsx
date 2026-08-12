import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useCreateOrder, useCreateOrderCheckout } from '@workspace/api-client-react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/context/session';

export default function ManifestScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { sessionToken } = useSession();
  const [desire, setDesire] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [travelingOrderId, setTravelingOrderId] = useState<number | null>(null);
  const travelingOpacity = useRef(new Animated.Value(0)).current;

  const createOrder = useCreateOrder();
  const createCheckout = useCreateOrderCheckout();

  const isLoading = createOrder.isPending || createCheckout.isPending;
  const canSend = desire.trim().length >= 3 && !isLoading && !!sessionToken;

  // When traveling screen appears, fade in then after 3s navigate
  useEffect(() => {
    if (travelingOrderId === null) return;
    Animated.timing(travelingOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      setTravelingOrderId(null);
      travelingOpacity.setValue(0);
      router.push(`/order/${travelingOrderId}` as any);
    }, 3000);
    return () => clearTimeout(timer);
  }, [travelingOrderId]);

  async function handleSend() {
    if (!canSend || !sessionToken) return;
    setError(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const order = await createOrder.mutateAsync({
        data: { intention: desire.trim(), sessionToken },
      });
      const checkout = await createCheckout.mutateAsync({
        id: order.id,
        // mobileReturn=true tells the API to use a redirect endpoint as
        // success_url so openAuthSessionAsync can detect it and auto-close
        data: { sessionToken, mobileReturn: true } as any,
      });
      // Auto-closes when Stripe → /api/orders/:id/mobile-success → universe-order-mobile://
      await WebBrowser.openAuthSessionAsync(
        checkout.url,
        'universe-order-mobile://',
      );
      setDesire('');
      setTravelingOrderId(order.id);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'Something went wrong.';
      setError(msg);
    }
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 + 34 : insets.bottom + 84;

  // Traveling overlay — shown after payment, before order screen
  if (travelingOrderId !== null) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <CosmicBackground />
        <Animated.View style={[styles.travelingInner, { opacity: travelingOpacity }]}>
          <Text style={[styles.travelingSymbol, { color: colors.accent }]}>✦</Text>
          <Text style={[styles.travelingTitle, { color: colors.foreground }]}>
            Your message is traveling
          </Text>
          <Text style={[styles.travelingSubtitle, { color: colors.mutedForeground }]}>
            The universe is listening
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CosmicBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 48, paddingBottom: bottomPad },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={[styles.brand, { color: colors.accent }]}>
            A manifestation practice
          </Text>

          {/* Title */}
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Order from the Universe
          </Text>

          {/* What this is */}
          <View style={[styles.explainCard, { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
            <Text style={[styles.explainLabel, { color: colors.accent }]}>What this is</Text>
            <Text style={[styles.explainBody, { color: colors.mutedForeground }]}>
              Write your desire, seal it with $1 as an act of faith, and the universe tracks your order — Processing → In Transit → Delivered. When it arrives in your life, you confirm it and receive your manifestation card.
            </Text>
            <View style={[styles.explainDivider, { backgroundColor: colors.border }]} />
            {[
              ['✦', 'Not a store.', 'No physical goods are shipped.'],
              ['✦', 'Not a guarantee.', 'This is a spiritual practice. Results are personal.'],
              ['✦', 'No refunds.', 'The $1 seals your intention and is non-refundable.'],
            ].map(([icon, bold, rest]) => (
              <View key={bold} style={styles.explainRow}>
                <Text style={[styles.explainIcon, { color: colors.accent }]}>{icon}</Text>
                <Text style={[styles.explainRowText, { color: colors.mutedForeground }]}>
                  <Text style={[styles.explainBold, { color: colors.foreground }]}>{bold}</Text>
                  {' '}{rest}
                </Text>
              </View>
            ))}
          </View>

          {/* Form heading */}
          <Text style={[styles.formHeading, { color: colors.foreground }]}>
            What do you wish to manifest?
          </Text>

          {/* Input */}
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Write your desire here"
              placeholderTextColor={colors.mutedForeground}
              multiline
              value={desire}
              onChangeText={setDesire}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Faith line */}
          <Text style={[styles.faithLine, { color: colors.accent }]}>
            The act of placing this order is itself an act of faith — and that faith is what draws it to you.
          </Text>

          {/* Error */}
          {error && (
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          )}

          {/* CTA Button */}
          {canSend && (
            <Pressable
              onPress={handleSend}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                  Seal &amp; Send $1
                </Text>
              )}
            </Pressable>
          )}

          {/* Legal links */}
          <View style={styles.legalRow}>
            <Pressable
              onPress={() => WebBrowser.openBrowserAsync('https://order-universe.replit.app/privacy')}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[styles.legalLink, { color: colors.mutedForeground }]}>Privacy</Text>
            </Pressable>
            <Text style={[styles.legalDot, { color: colors.mutedForeground }]}>·</Text>
            <Pressable
              onPress={() => WebBrowser.openBrowserAsync('https://order-universe.replit.app/terms')}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[styles.legalLink, { color: colors.mutedForeground }]}>Terms &amp; Refunds</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  travelingInner: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  travelingSymbol: {
    fontSize: 36,
    marginBottom: 24,
  },
  travelingTitle: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  travelingSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 1,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  brand: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 20,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  heading: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 28,
  },
  explainCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    gap: 10,
  },
  explainLabel: {
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  explainBody: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
    textAlign: 'center',
  },
  explainDivider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
    opacity: 0.4,
  },
  explainRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  explainIcon: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  explainRowText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    flex: 1,
  },
  explainBold: {
    fontFamily: 'Inter_600SemiBold',
  },
  formHeading: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    minHeight: 130,
    marginBottom: 16,
  },
  input: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    minHeight: 90,
  },
  faithLine: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  error: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    shadowColor: '#a64dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingBottom: 8,
  },
  legalLink: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.4,
  },
  legalDot: {
    fontSize: 11,
    opacity: 0.3,
  },
});
