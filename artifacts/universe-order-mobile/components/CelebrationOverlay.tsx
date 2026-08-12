/**
 * CelebrationOverlay — full-screen modal shown after confirming delivery.
 * Lets the user share their manifestation card via the native share sheet.
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Feather } from '@expo/vector-icons';
import { ManifestationCard } from './ManifestationCard';
import { useColors } from '@/hooks/useColors';

// Format a date to "Month D, YYYY"
function formatDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface CelebrationOverlayProps {
  visible: boolean;
  intention: string;
  confirmedAt?: string | null;
  onClose: () => void;
  onViewHistory?: () => void;
}

export function CelebrationOverlay({
  visible,
  intention,
  confirmedAt,
  onClose,
  onViewHistory,
}: CelebrationOverlayProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const cardRef = useRef<ViewShotRef>(null);
  const [sharing, setSharing] = useState(false);

  const date = formatDate(confirmedAt);

  // Fade-in animation
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  const handleShow = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleHide = () => {
    opacity.setValue(0);
    scale.setValue(0.92);
  };

  const captureAndShare = useCallback(async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
      });

      if (Platform.OS === 'web') {
        // Web: trigger a download link
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'manifestation.jpg';
        a.click();
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share your manifestation',
          });
        }
      }
    } catch (e) {
      console.warn('Share failed:', e);
    } finally {
      setSharing(false);
    }
  }, []);

  const saveToDevice = useCallback(async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
      });

      if (Platform.OS === 'web') {
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'manifestation.jpg';
        a.click();
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Save your manifestation card',
          });
        }
      }
    } catch (e) {
      console.warn('Save failed:', e);
    } finally {
      setSharing(false);
    }
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={handleShow}
      onDismiss={handleHide}
    >
      {/* Dark backdrop */}
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity,
              transform: [{ scale }],
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          {/* Stars sprinkled across the overlay */}
          {OVERLAY_STARS.map((s, i) => (
            <View
              key={i}
              style={[
                styles.overlayStar,
                { top: s.top as any, left: s.left as any, opacity: s.opacity },
              ]}
            />
          ))}

          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              { opacity: pressed ? 0.6 : 1, marginRight: 0 },
            ]}
            hitSlop={12}
          >
            <Feather name="x" size={22} color="rgba(255,255,255,0.5)" />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.manifestedLabel}>✦  Manifested  ✦</Text>
            <Text style={styles.title}>Your desire has been fulfilled.</Text>
            <Text style={styles.subtitle}>
              The universe received your order and delivered. Keep this feeling of trust with you.
            </Text>
          </View>

          {/* Card preview (captured by ViewShot) */}
          <View style={styles.cardWrapper}>
            <ViewShot ref={cardRef} options={{ format: 'jpg', quality: 0.95 }}>
              <ManifestationCard intention={intention} date={date} />
            </ViewShot>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              onPress={captureAndShare}
              disabled={sharing}
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed || sharing ? 0.8 : 1 },
              ]}
            >
              {sharing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Feather name="share-2" size={16} color="#000" />
                  <Text style={styles.primaryBtnText}>Share this moment</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={saveToDevice}
              disabled={sharing}
              style={({ pressed }) => [
                styles.secondaryBtn,
                {
                  borderColor: 'rgba(251,191,36,0.3)',
                  opacity: pressed || sharing ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="download" size={15} color="rgba(251,191,36,0.8)" />
              <Text style={styles.secondaryBtnText}>Save to device</Text>
            </Pressable>

            {onViewHistory && (
              <Pressable
                onPress={onViewHistory}
                style={({ pressed }) => [styles.historyBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Feather name="clock" size={13} color="rgba(255,255,255,0.35)" />
                <Text style={styles.historyBtnText}>View in History</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Deterministic overlay star positions
const OVERLAY_STARS = Array.from({ length: 30 }, (_, i) => ({
  top: ((i * 31 + 11) % 100) + '%',
  left: ((i * 43 + 17) % 100) + '%',
  opacity: 0.1 + (i % 5) * 0.06,
}));

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,0,15,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlayStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  manifestedLabel: {
    color: 'rgba(251,191,36,0.7)',
    fontSize: 10,
    letterSpacing: 5,
    textTransform: 'uppercase',
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  title: {
    color: '#f0e8ff',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(240,232,255,0.5)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  cardWrapper: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
    borderRadius: 20,
    marginBottom: 36,
  },
  actions: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#f59e0b',
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 36,
    width: '100%',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 36,
    width: '100%',
  },
  secondaryBtnText: {
    color: 'rgba(251,191,36,0.8)',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  historyBtnText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
});
