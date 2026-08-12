import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  useConfirmOrderDelivery,
  useGetOrder,
  getGetOrderQueryKey,
} from '@workspace/api-client-react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { BottomTabBar } from '@/components/BottomTabBar';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/context/session';
import { Feather } from '@expo/vector-icons';

const STAGES = [
  { stage: 1, label: 'Order Received', icon: 'inbox' as const },
  { stage: 2, label: 'Processed by the Universe', icon: 'zap' as const },
  { stage: 3, label: 'On Its Way to You', icon: 'navigation' as const },
  { stage: 4, label: 'Awaiting Your Confirmation', icon: 'check-circle' as const },
];

function statusToStage(status: string): number {
  switch (status) {
    case 'pending_payment': return 1;
    case 'processing': return 2;
    case 'in_transit': return 3;
    case 'delivered': return 4;
    default: return 1;
  }
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { sessionToken } = useSession();
  const [celebrated, setCelebrated] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const orderId = Number(id);
  const { data: order, isLoading } = useGetOrder(
    orderId,
    {
      request: sessionToken
        ? { headers: { Authorization: `Bearer ${sessionToken}` } }
        : undefined,
      query: {
        queryKey: getGetOrderQueryKey(orderId),
        enabled: !!id && !!sessionToken,
        refetchInterval: (query) => {
          const status = query.state.data?.status;
          return status === 'delivered' ? false : 5000;
        },
      },
    }
  );

  const confirmDelivery = useConfirmOrderDelivery();

  // If user just confirmed (celebrated) or order is already delivered, show all stages complete
  const currentStage = (celebrated || order?.status === 'delivered')
    ? STAGES.length + 1
    : order ? statusToStage(order.status) : 1;

  async function handleConfirm() {
    if (!sessionToken || !order) return;
    try {
      await confirmDelivery.mutateAsync({
        id: order.id,
        data: { sessionToken },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebrated(true);
      setShowOverlay(true);
    } catch {
      // API failed — do not mark as celebrated so user can retry
    }
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  // Extra bottom padding to clear the BottomTabBar (54px bar + safe area)
  const bottomPad = Platform.OS === 'web' ? 84 + 34 : insets.bottom + 54 + 16;

  if (isLoading || !order) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <CosmicBackground />
        <ActivityIndicator color={colors.primary} size="large" />
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CosmicBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          onPress={() =>
            order.status === 'delivered' || celebrated
              ? router.replace('/(tabs)/history')
              : router.replace('/(tabs)/track')
          }
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="chevron-left" size={22} color={colors.mutedForeground} />
          <Text style={[styles.backText, { color: colors.mutedForeground }]}>Back</Text>
        </Pressable>

        {/* Desire quote */}
        <View style={[styles.quoteCard, { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' }]}>
          <Text style={[styles.quoteSymbol, { color: colors.accent }]}>✦</Text>
          <Text style={[styles.quoteText, { color: colors.foreground }]}>
            "{order.intention}"
          </Text>
        </View>

        {/* Motivational message */}
        <Text style={[styles.motivation, { color: colors.mutedForeground }]}>
          {order.motivationalMessage}
        </Text>

        {/* Stage tracker */}
        <View style={[styles.trackerCard, { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' }]}>
          {STAGES.map((s, index) => {
            const isComplete = currentStage > s.stage;
            const isActive = currentStage === s.stage;
            const isLast = index === STAGES.length - 1;

            return (
              <View key={s.stage}>
                <View style={styles.stageRow}>
                  {/* Icon circle */}
                  <View
                    style={[
                      styles.stageIcon,
                      {
                        backgroundColor: isComplete || isActive
                          ? colors.primary
                          : 'rgba(255,255,255,0.06)',
                        borderColor: isActive ? colors.accent : 'transparent',
                        borderWidth: isActive ? 2 : 0,
                      },
                    ]}
                  >
                    <Feather
                      name={s.icon}
                      size={16}
                      color={isComplete || isActive ? '#fff' : colors.mutedForeground}
                    />
                  </View>
                  {/* Label */}
                  <Text
                    style={[
                      styles.stageLabel,
                      {
                        color: isActive
                          ? colors.foreground
                          : isComplete
                          ? colors.mutedForeground
                          : 'rgba(255,255,255,0.2)',
                        fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                  {/* Check for completed */}
                  {isComplete && (
                    <Feather name="check" size={14} color={colors.primary} />
                  )}
                </View>
                {/* Connector line */}
                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      { backgroundColor: currentStage > s.stage ? colors.primary : 'rgba(255,255,255,0.08)' },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Confirm delivery button (in_transit) */}
        {order.status === 'in_transit' && !celebrated && (
          <View style={styles.confirmSection}>
            <Text style={[styles.confirmHint, { color: colors.mutedForeground }]}>
              When what you desired arrives in your life — a feeling, an opportunity, or the thing itself — tap below to seal it.
            </Text>
            <Pressable
              onPress={handleConfirm}
              disabled={confirmDelivery.isPending}
              style={({ pressed }) => [
                styles.confirmBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed || confirmDelivery.isPending ? 0.8 : 1,
                },
              ]}
            >
              {confirmDelivery.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.confirmText}>It Has Manifested ✦</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Celebration — delivered */}
        {(order.status === 'delivered' || celebrated) && (
          <View style={[styles.celebrationCard, { borderColor: colors.accent, backgroundColor: 'rgba(245,158,11,0.07)' }]}>
            <Text style={[styles.celebrationTitle, { color: colors.accent }]}>
              ✦ Manifested ✦
            </Text>
            <Text style={[styles.celebrationBody, { color: colors.foreground }]}>
              Your desire has been fulfilled. Keep this feeling of trust with you as you move forward.
            </Text>
            <Pressable
              onPress={() => setShowOverlay(true)}
              style={({ pressed }) => [
                styles.shareCardBtn,
                { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="share-2" size={14} color={colors.accent} />
              <Text style={[styles.shareCardText, { color: colors.accent }]}>
                Share this moment
              </Text>
            </Pressable>
          </View>
        )}

        {/* Pending payment notice */}
        {order.status === 'pending_payment' && (
          <View style={[styles.pendingCard, { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' }]}>
            <Text style={[styles.pendingText, { color: colors.mutedForeground }]}>
              Complete your payment to seal &amp; send this order to the universe.
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomTabBar />

      {/* Celebration overlay — shown immediately after confirming, or via "Share" button */}
      {order && (
        <CelebrationOverlay
          visible={showOverlay}
          intention={order.intention}
          confirmedAt={(order as any).confirmedAt ?? null}
          onClose={() => setShowOverlay(false)}
          onViewHistory={() => {
            setShowOverlay(false);
            router.replace('/(tabs)/history');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  quoteCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  quoteSymbol: {
    fontSize: 18,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 30,
  },
  motivation: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  trackerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  connector: {
    width: 2,
    height: 22,
    marginLeft: 17,
    marginVertical: 4,
    borderRadius: 1,
  },
  confirmSection: {
    marginBottom: 20,
  },
  confirmHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  confirmBtn: {
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  confirmText: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  celebrationCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 18,
    letterSpacing: 4,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  celebrationBody: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  pendingCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  pendingText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  shareCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  shareCardText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
});
