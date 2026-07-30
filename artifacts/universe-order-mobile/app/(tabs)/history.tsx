import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetOrderHistory, getGetOrderHistoryQueryKey } from '@workspace/api-client-react';
import type { Order } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/contexts/SessionContext';
import StarField from '@/components/StarField';

function OrderHistoryItem({ order }: { order: Order }) {
  const colors = useColors();
  const s = makeItemStyles(colors);

  const dateStr = order.confirmedAt
    ? new Date(order.confirmedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(order.updatedAt ?? order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <View style={s.badge}>
          <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
          <Text style={[s.badgeText, { color: colors.primary }]}>Delivered</Text>
        </View>
        <Text style={[s.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
      </View>
      <Text style={[s.intention, { color: colors.foreground }]} numberOfLines={3}>
        {order.intention}
      </Text>
    </View>
  );
}

function makeItemStyles(colors: ReturnType<typeof import('@/hooks/useColors').useColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 12,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    date: {
      fontSize: 12,
    },
    intention: {
      fontSize: 15,
      lineHeight: 22,
    },
  });
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessionToken, isLoading: sessionLoading } = useSession();

  const {
    data: orders,
    isLoading: historyLoading,
    refetch,
    isRefetching,
  } = useGetOrderHistory(
    { sessionToken: sessionToken ?? '' },
    { query: { queryKey: getGetOrderHistoryQueryKey({ sessionToken: sessionToken ?? '' }), enabled: !!sessionToken } }
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const s = makeStyles(colors);
  const isLoading = sessionLoading || historyLoading;

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

  return (
    <View style={[s.fill, { paddingTop: topPad }]}>
      <StarField />
      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderHistoryItem order={item} />}
        contentContainerStyle={[
          s.listContent,
          { minHeight: '100%' },
        ]}
        scrollEnabled={!!orders && orders.length > 0}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={s.header}>
            <Text style={s.headerTitle}>Past Intentions</Text>
            <Text style={s.headerSubtitle}>
              {orders && orders.length > 0
                ? `${orders.length} fulfilled ${orders.length === 1 ? 'intention' : 'intentions'}`
                : 'Your cosmic history'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="time-outline" size={52} color={colors.mutedForeground} />
            <Text style={[s.emptyTitle, { color: colors.foreground }]}>No Fulfilled Intentions Yet</Text>
            <Text style={[s.emptySubtitle, { color: colors.mutedForeground }]}>
              Once the universe delivers your order, it will appear here.
            </Text>
          </View>
        }
      />
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
    },
    listContent: {
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
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
