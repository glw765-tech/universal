import React, { useState } from 'react';
import {
  ActivityIndicator,
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

  const createOrder = useCreateOrder();
  const createCheckout = useCreateOrderCheckout();

  const isLoading = createOrder.isPending || createCheckout.isPending;
  const canSend = desire.trim().length >= 3 && !isLoading && !!sessionToken;

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
      router.push(`/order/${order.id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'Something went wrong.';
      setError(msg);
    }
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 + 34 : insets.bottom + 84;

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
            Order from the Universe
          </Text>

          {/* Title */}
          <Text style={[styles.heading, { color: colors.foreground }]}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    marginBottom: 32,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 28,
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
});
