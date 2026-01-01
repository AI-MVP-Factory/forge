/**
 * CelebrationCard - Animated celebration display
 *
 * Features:
 * - Slide-in animation
 * - Gradient background
 * - Scale entrance
 */

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '@/design/tokens';

interface CelebrationCardProps {
  message: string;
}

export function CelebrationCard({ message }: CelebrationCardProps) {
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    scale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 150 }));
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(15)}
      style={[styles.container, animatedStyle]}
    >
      <LinearGradient
        colors={[colors.primary[100], '#FCE7F3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.message}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  sparkle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * typography.lineHeight.relaxed,
    color: colors.primary[800],
    textAlign: 'center',
    fontWeight: typography.weight.medium,
  },
});
