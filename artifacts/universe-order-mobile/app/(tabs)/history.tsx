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
import { useGetOrderHistory } from '@workspace/api-client-react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/context/session';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { sessionToken } = useSession();

  const { data: orders = [], isLoading, refetch } = useGetOrderHistory(
    { sessionToken: sessionToken ?? '' },
    { query: { enabled: !!sessionToken } }
  );

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
          <Text style={[styles.heading, { color: colors.foreground }]}>History</Text>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: colors.accent }]}>
                Your fulfilled desires will appear here.
              </Text>
              <Text style={[styles.emptyBody, { color: colors.accent }]}>
                Your delivered orders will appear here once confirmed.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/order/${item.id}`)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.manifestedBadge}>
              <Text style={[styles.manifestedText, { color: colors.accent }]}>
                ✦ Manifested
              </Text>
            </View>
            <Text
              style={[styles.desire, { color: colors.foreground }]}
              numberOfLines={2}
            >
              "{item.intention}"
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
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
  manifestedBadge: {
    marginBottom: 10,
  },
  manifestedText: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  desire: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  date: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Inter_500Medium',
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
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
