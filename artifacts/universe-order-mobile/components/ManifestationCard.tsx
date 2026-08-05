/**
 * ManifestationCard — pure React Native view captured by react-native-view-shot.
 * Mirrors the cosmic aesthetic of the web shareable-card.tsx.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ManifestationCardProps {
  intention: string;
  date: string; // formatted date string e.g. "August 5, 2026"
}

// Deterministic star positions so the card looks the same every time it renders
const STARS = Array.from({ length: 40 }, (_, i) => ({
  top: ((i * 23 + 7) % 100) + '%',
  left: ((i * 37 + 13) % 100) + '%',
  size: i % 5 === 0 ? 2 : 1,
  opacity: 0.3 + (i % 4) * 0.15,
}));

export function ManifestationCard({ intention, date }: ManifestationCardProps) {
  const fontSize = intention.length > 80 ? 18 : 22;

  return (
    <View style={styles.card}>
      {/* Star field */}
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: s.top as any,
              left: s.left as any,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
            },
          ]}
        />
      ))}

      {/* Radial glow overlay */}
      <View style={styles.glow} />

      {/* Top decorative line */}
      <View style={styles.topLine} />
      {/* Bottom decorative line */}
      <View style={styles.bottomLine} />

      {/* Content */}
      <View style={styles.content}>
        {/* "Manifested" label */}
        <Text style={styles.label}>✦  Manifested  ✦</Text>

        {/* Intention */}
        <Text style={[styles.intention, { fontSize }]}>"{intention}"</Text>

        {/* Divider dot */}
        <View style={styles.dot} />

        {/* Date */}
        <Text style={styles.date}>{date}</Text>

        {/* Branding */}
        <Text style={styles.brand}>Order from the Universe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 320,
    backgroundColor: '#0a0a0f',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Approximating radial gradient with a lighter center
    backgroundColor: 'transparent',
  },
  topLine: {
    position: 'absolute',
    top: 24,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  bottomLine: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
    zIndex: 1,
  },
  label: {
    color: 'rgba(251,191,36,0.7)',
    fontSize: 9,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontFamily: 'Inter_400Regular',
  },
  intention: {
    color: '#f5f0e8',
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(251,191,36,0.5)',
  },
  date: {
    color: 'rgba(245,240,232,0.5)',
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: 'Inter_400Regular',
  },
  brand: {
    color: 'rgba(251,191,36,0.45)',
    fontSize: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
});
