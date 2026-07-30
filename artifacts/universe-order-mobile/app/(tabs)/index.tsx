import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { Ionicons } from '@expo/vector-icons';
import {
  useCreateOrder,
  useCreateOrderCheckout,
  useGetActiveOrder,
  getGetActiveOrderQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/contexts/SessionContext';
import StarField from '@/components/StarField';
import TrackingTimeline from '@/components/TrackingTimeline';

const MAX_CHARS = 500;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sessionToken, isLoading: sessionLoading } = useSession();

  const [intention, setIntention] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [focused, setFocused] = useState(false);

  const { data: activeOrderData, isLoading: orderLoading, refetch } = useGetActiveOrder(
    { sessionToken: sessionToken ?? '' },
    { query: { queryKey: getGetActiveOrderQueryKey({ sessionToken: sessionToken ?? '' }), enabled: !!sessionToken } }
  );

  const activeOrder = activeOrderData?.order ?? null;

  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutateAsync: createCheckout } = useCreateOrderCheckout();

  const isLoading = sessionLoading || orderLoading;
  const charCount = intention.length;
  const canSubmit = charCount >= 3 && charCount <= MAX_CHARS && !isCheckingOut;

  const handleOpenCheckout = async (orderId: number) => {
    if (!sessionToken) return;
    try {
      setIsCheckingOut(true);
      const checkout = await createCheckout({ id: orderId, data: { sessionToken } });
      await WebBrowser.openBrowserAsync(checkout.url, {
        toolbarColor: colors.card,
        controlsColor: colors.primary,
      });
      const refreshed = await refetch();
      const newStatus = refreshed.data?.order?.status;
      if (newStatus && newStatus !== 'pending_payment') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        queryClient.invalidateQueries();
        router.push('/success');
      } else {
        router.push('/cancel');
      }
    } catch (err: any) {
      Alert.alert('Something went wrong', err?.message ?? 'Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSend = async () => {
    if (!sessionToken || !canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setIsCheckingOut(true);
      const order = await createOrder({ data: { intention: intention.trim(), sessionToken } });
      setIntention('');
      await handleOpenCheckout(order.id);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Already have an active order — refresh to show it
        await refetch();
      } else {
        Alert.alert('Could not send', err?.message ?? 'Please try again.');
      }
      setIsCheckingOut(false);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = makeStyles(colors);

  if (isLoading) {
    return (
      <View style={[s.fill, { paddingTop: topPad }]}>
        <StarField />
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Active order that is NOT pending payment — show brief status + track CTA
  if (activeOrder && activeOrder.status !== 'pending_payment') {
    return (
      <View style={[s.fill, { paddingTop: topPad }]}>
        <StarField />
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Ionicons name="sparkles-outline" size={40} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={s.title}>Order from the Universe</Text>
          </View>

          <View style={s.activeOrderCard}>
            <Text style={s.activeOrderLabel}>Your Current Intention</Text>
            <Text style={s.activeOrderIntention} numberOfLines={3}>
              "{activeOrder.intention}"
            </Text>
            <View style={s.divider} />
            <TrackingTimeline order={activeOrder} />
            <View style={s.motivationalBox}>
              <Text style={s.motivationalText}>{activeOrder.motivationalMessage}</Text>
            </View>
            <Pressable
              style={s.trackButton}
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/(tabs)/track');
              }}
            >
              <Text style={[s.trackButtonText, { color: colors.primaryForeground }]}>
                Track Your Order
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Active order pending payment — show checkout CTA
  if (activeOrder && activeOrder.status === 'pending_payment') {
    return (
      <View style={[s.fill, { paddingTop: topPad }]}>
        <StarField />
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Ionicons name="sparkles-outline" size={40} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={s.title}>Order from the Universe</Text>
          </View>

          <View style={s.activeOrderCard}>
            <Text style={s.activeOrderLabel}>Your Intention</Text>
            <Text style={s.activeOrderIntention} numberOfLines={4}>
              "{activeOrder.intention}"
            </Text>
            <View style={s.divider} />
            <Text style={s.pendingPaymentHint}>
              Seal your intention with $1 to send it to the universe.
            </Text>
            <Pressable
              style={[s.sendButton, isCheckingOut && s.sendButtonDisabled]}
              onPress={() => handleOpenCheckout(activeOrder.id)}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color={colors.primaryForeground} />
                  <Text style={[s.sendButtonText, { color: colors.primaryForeground }]}>
                    Complete Payment — $1
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // No active order — show intention form
  return (
    <View style={[s.fill, { paddingTop: topPad }]}>
      <StarField />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Ionicons name="sparkles-outline" size={40} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={s.title}>Order from the Universe</Text>
          <Text style={s.subtitle}>
            Write your intention clearly and the universe will conspire to fulfill it.
          </Text>
        </View>

        <View style={s.formCard}>
          <Text style={s.formLabel}>What do you wish to manifest?</Text>
          <TextInput
            style={[
              s.intentionInput,
              {
                borderColor: focused ? colors.primary : colors.border,
                color: colors.foreground,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Describe what you wish to call into your life..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={intention}
            onChangeText={setIntention}
            maxLength={MAX_CHARS}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="default"
          />
          <View style={s.charCountRow}>
            <Text style={[s.charCount, { color: charCount > MAX_CHARS * 0.9 ? colors.destructive : colors.mutedForeground }]}>
              {charCount}/{MAX_CHARS}
            </Text>
          </View>

          <Pressable
            style={[s.sendButton, !canSubmit && s.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSubmit}
          >
            {isCheckingOut ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={canSubmit ? colors.primaryForeground : colors.mutedForeground} />
                <Text
                  style={[
                    s.sendButtonText,
                    { color: canSubmit ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  Send to the Universe — $1
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={s.footerNote}>
          Your $1 seals the intention. The universe charges nothing for delivery.
        </Text>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import('@/hooks/useColors').useColors>) {
  return StyleSheet.create({
    fill: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 120,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 26,
      fontWeight: '600',
      color: colors.foreground,
      textAlign: 'center',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 12,
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
    },
    formLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.mutedForeground,
      marginBottom: 10,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    intentionInput: {
      borderWidth: 1,
      borderRadius: colors.radius - 4,
      padding: 14,
      fontSize: 15,
      lineHeight: 22,
      minHeight: 130,
    },
    charCountRow: {
      alignItems: 'flex-end',
      marginTop: 6,
      marginBottom: 16,
    },
    charCount: {
      fontSize: 12,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 15,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    sendButtonDisabled: {
      opacity: 0.45,
    },
    sendButtonText: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    footerNote: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 18,
    },
    activeOrderCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
    },
    activeOrderLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
    },
    activeOrderIntention: {
      fontSize: 16,
      color: colors.foreground,
      lineHeight: 24,
      fontStyle: 'italic',
      marginBottom: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 20,
    },
    motivationalBox: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius - 4,
      padding: 14,
      marginTop: 16,
      marginBottom: 16,
    },
    motivationalText: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 19,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    trackButton: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    trackButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    pendingPaymentHint: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
      marginBottom: 16,
    },
  });
}
