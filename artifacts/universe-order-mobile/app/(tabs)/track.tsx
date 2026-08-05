import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGetCurrentOrders, getGetCurrentOrdersQueryKey } from '@workspace/api-client-react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/context/session';

const STATUS_LABEL: Record<string, string> = {
  processing: 'Processing',
  in_transit: 'In Transit',
};

const STATUS_COLOR: Record<string, string> = {
  processing: '#a64dff',
  in_transit: '#f59e0b',
};

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { sessionToken } = useSession();

  const sessionParam = { sessionToken: sessionToken ?? '' };
  const { data: rawOrders, isLoading, refetch } = useGetCurrentOrders(
    sessionParam,
    { query: { queryKey: getGetCurrentOrdersQueryKey(sessionParam), enabled: !!sessionToken, refetchInterval: 10000 } }
  );

  // Only show paid orders (exclude pending_payment)
  const orders = rawOrders?.filter(o => o.status !== 'pending_payment') ?? [];

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 + 34 : insets.bottom + 84;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CosmicBackground />
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        scrollEnabled={!!orders.length}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 24, paddingBottom: bottomPad },
        ]}
        ListHeaderComponent={
          <Text style={[styles.heading, { color: colors.foreground }]}>Track</Text>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
                No active orders
              </Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                Your paid orders in progress will appear here.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/order/${item.id}` as any)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[styles.desire, { color: colors.foreground }]}
              numberOfLines={2}
            >
              "{item.intention}"
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: STATUS_COLOR[item.status] ?? colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLOR[item.status] ?? colors.primary },
                  ]}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 24, flexGrow: 1 },
  heading: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 14,
  },
  desire: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Inter_500Medium',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
