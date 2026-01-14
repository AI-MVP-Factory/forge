/**
 * ChecklistItem - Beautiful, animated checklist item
 *
 * Features:
 * - Smooth check/uncheck animation
 * - Haptic feedback
 * - Press scale effect
 * - Color transitions
 */

import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/design/tokens';
import { haptic } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChecklistItemProps {
  id: string;
  emoji: string;
  label: string;
  isChecked: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export function ChecklistItem({
  emoji,
  label,
  isChecked,
  isLoading,
  onPress,
}: ChecklistItemProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isChecked ? 1 : 0);

  // Update progress when checked state changes
  React.useEffect(() => {
    progress.value = withSpring(isChecked ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isChecked, progress]);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (isLoading) return;

    if (!isChecked) {
      haptic.success();
    } else {
      haptic.light();
    }
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.neutral[100], colors.primary[50]]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', colors.primary[200]]
    ),
  }));

  const checkboxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', colors.primary[500]]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.neutral[300], colors.primary[500]]
    ),
    transform: [
      {
        scale: withSpring(progress.value === 1 ? 1 : 0.8, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value, { duration: 150 }),
    transform: [
      {
        scale: withSpring(progress.value, { damping: 15, stiffness: 200 }),
      },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.neutral[700], colors.primary[700]]
    ),
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
      style={[styles.container, containerStyle, isLoading && styles.loading]}
    >
      <Text style={styles.emoji}>{emoji}</Text>

      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>

      <Animated.View style={[styles.checkbox, checkboxStyle]}>
        <Animated.Text style={[styles.checkmark, checkmarkStyle]}>
          ✓
        </Animated.Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  loading: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.lg,
  },
  label: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },
});
