/**
 * ProgressBadge - Shows completion progress
 *
 * Features:
 * - Animated entrance
 * - Count update animation
 */

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '@/design/tokens';

interface ProgressBadgeProps {
  current: number;
  total: number;
}

export function ProgressBadge({ current, total }: ProgressBadgeProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = 1.1;
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  }, [current, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (current === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.springify()}
      layout={Layout.springify()}
      style={[styles.container, animatedStyle]}
    >
      <Text style={styles.sparkle}>✨</Text>
      <Text style={styles.text}>
        {current} of {total} — You can do this!
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  sparkle: {
    fontSize: 18,
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[700],
  },
});
