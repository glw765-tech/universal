import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetActiveOrder,
  useConfirmOrderDelivery,
  getGetActiveOrderQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/contexts/SessionContext';
import StarField from '@/components/StarField';
import TrackingTimeline from '@/components/TrackingTimeline';

export default function TrackScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { sessionToken, isLoading: sessionLoading } = useSession();
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: activeOrderData, isLoading: orderLoading } = useGetActiveOrder(
    { sessionToken: sessionToken ?? '' },
    {
      query: {
        queryKey: getGetActiveOrderQueryKey({ sessionToken: sessionToken ?? '' }),
        enabled: !!sessionToken,
        refetchInterval: 5000,
      },
    }
  );

  const activeOrder = activeOrderData?.order ?? null;

  const { mutateAsync: confirmDelivery } = useConfirmOrderDelivery();

  const handleConfirmDelivery = async () => {
    if (!sessionToken || !activeOrder) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      setIsConfirming(true);
      await confirmDelivery({ id: activeOrder.id, data: { sessionToken } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Invalidate so history and home both refresh
      queryClient.invalidateQueries({
        queryKey: getGetActiveOrderQueryKey({ sessionToken }),
      });
    } catch (err: any) {
      Alert.alert('Could not confirm', err?.message ?? 'Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = makeStyles(colors);
  const isLoading = sessionLoading || orderLoading;

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

  if (!activeOrder) {
    return (
      <View style={[s.fill, { paddingTop: topPad }]}>
        <StarField />
        <View style={s.center}>
          <Ionicons name="radio-outline" size={52} color={colors.mutedForeground} />
          <Text style={[s.emptyTitle, { color: colors.foreground }]}>Nothing in Transit</Text>
          <Text style={[s.emptySubtitle, { color: colors.mutedForeground }]}>
            Place an order from the home tab to begin your journey.
          </Text>
        </View>
      </View>
    );
  }

  const isDelivered = activeOrder.status === 'delivered';
  const isInTransit = activeOrder.status === 'in_transit';

  return (
    <View style={[s.fill, { paddingTop: topPad }]}>
      <StarField />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.headerTitle}>Cosmic Tracking</Text>
          <Text style={s.headerSubtitle}>Order #{activeOrder.id}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.intentionLabel}>Your Intention</Text>
          <Text style={s.intentionText} numberOfLines={4}>
            "{activeOrder.intention}"
          </Text>
          <View style={s.divider} />
          <TrackingTimeline order={activeOrder} />
        </View>

        <View style={s.messageCard}>
          <Ionicons name="star-outline" size={18} color={colors.primary} style={s.messageIcon} />
          <Text style={s.messageText}>{activeOrder.motivationalMessage}</Text>
        </View>

        {isInTransit && (
          <Pressable
            style={[s.confirmButton, isConfirming && s.buttonDisabled]}
            onPress={handleConfirmDelivery}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.primaryForeground} />
                <Text style={[s.confirmButtonText, { color: colors.primaryForeground }]}>
                  I've Received It
                </Text>
              </>
            )}
          </Pressable>
        )}

        {isDelivered && (
          <View style={s.deliveredBanner}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.deliveredTitle, { color: colors.primary }]}>Manifested</Text>
              <Text style={[s.deliveredSub, { color: colors.mutedForeground }]}>
                {activeOrder.confirmedAt
                  ? `Confirmed ${new Date(activeOrder.confirmedAt).toLocaleDateString()}`
                  : 'Your intention has been fulfilled'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import('@/hooks/useColors').useColors>) {
  return StyleSheet.create({
    fill: { flex: 1, backgroundColor: colors.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 120,
    },
    header: {
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '600',
      color: colors.foreground,
      letterSpacing: 0.4,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 16,
    },
    intentionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    intentionText: {
      fontSize: 15,
      color: colors.foreground,
      lineHeight: 22,
      fontStyle: 'italic',
      marginBottom: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 20,
    },
    messageCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 16,
    },
    messageIcon: {
      marginTop: 1,
    },
    messageText: {
      flex: 1,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 21,
      fontStyle: 'italic',
    },
    confirmButton: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 16,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    deliveredBanner: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    deliveredTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    deliveredSub: {
      fontSize: 12,
      marginTop: 2,
    },
  });
}
