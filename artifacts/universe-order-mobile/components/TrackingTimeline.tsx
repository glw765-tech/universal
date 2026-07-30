import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Order } from '@workspace/api-client-react';

interface Step {
  stage: number;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

const STEPS: Step[] = [
  {
    stage: 1,
    label: 'Intention Set',
    description: 'Your wish has been written',
    icon: 'pencil-outline',
    iconFilled: 'pencil',
  },
  {
    stage: 2,
    label: 'Received',
    description: 'The universe has heard you',
    icon: 'radio-outline',
    iconFilled: 'radio',
  },
  {
    stage: 3,
    label: 'In Transit',
    description: 'Making its way to you',
    icon: 'paper-plane-outline',
    iconFilled: 'paper-plane',
  },
  {
    stage: 4,
    label: 'Delivered',
    description: 'Your manifestation is complete',
    icon: 'checkmark-circle-outline',
    iconFilled: 'checkmark-circle',
  },
];

interface Props {
  order: Order;
}

export default function TrackingTimeline({ order }: Props) {
  const colors = useColors();
  const currentStage = order.trackingStage;

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = currentStage > step.stage;
        const isActive = currentStage === step.stage;
        const isPending = currentStage < step.stage;
        const isLast = index === STEPS.length - 1;

        const circleColor = isCompleted || isActive ? colors.primary : colors.muted;
        const iconColor = isCompleted || isActive ? colors.primaryForeground : colors.mutedForeground;
        const labelColor = isActive ? colors.primary : isCompleted ? colors.foreground : colors.mutedForeground;
        const descColor = isActive ? colors.foreground : colors.mutedForeground;

        return (
          <View key={step.stage} style={styles.step}>
            {/* Left: circle + connector line */}
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: circleColor,
                    borderColor: isActive ? colors.primary : colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={isCompleted || isActive ? step.iconFilled : step.icon}
                  size={15}
                  color={iconColor}
                />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>

            {/* Right: label + description */}
            <View style={[styles.rightCol, !isLast && styles.rightColSpacing]}>
              <Text
                style={[
                  styles.label,
                  {
                    color: labelColor,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {step.label}
              </Text>
              {(isActive || isCompleted) && (
                <Text style={[styles.description, { color: descColor }]}>
                  {step.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftCol: {
    alignItems: 'center',
    width: 36,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 2,
    height: 32,
    marginVertical: 2,
  },
  rightCol: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 6,
  },
  rightColSpacing: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});
