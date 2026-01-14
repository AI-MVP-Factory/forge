/**
 * Self-Care Checklist - Main Screen
 *
 * Beautiful, emotionally resonant self-care tracking.
 * Makes users feel PROUD, CELEBRATED, and WORTHY.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

import { ChecklistItem } from '@/components/ChecklistItem';
import { CelebrationCard } from '@/components/CelebrationCard';
import { ProgressBadge } from '@/components/ProgressBadge';
import { celebrate } from '@/lib/celebrate';
import { haptic } from '@/lib/haptics';
import { colors, spacing, typography } from '@/design/tokens';

const SELF_CARE_ITEMS = [
  { id: 'water', emoji: '💧', label: 'Drank water', category: 'Hydration' },
  { id: 'movement', emoji: '🚶', label: 'Moved my body', category: 'Movement' },
  { id: 'rest', emoji: '😴', label: 'Took a break', category: 'Rest' },
  { id: 'outside', emoji: '🌿', label: 'Got fresh air', category: 'Fresh Air' },
  { id: 'food', emoji: '🍎', label: 'Ate something', category: 'Nourishment' },
  { id: 'connect', emoji: '💬', label: 'Connected with someone', category: 'Connection' },
  { id: 'breathe', emoji: '🧘', label: 'Took deep breaths', category: 'Mindfulness' },
];

export default function HomeScreen() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const handleCheck = useCallback(async (id: string) => {
    const item = SELF_CARE_ITEMS.find((i) => i.id === id);
    if (!item) return;

    const newChecked = new Set(checked);

    // Uncheck
    if (newChecked.has(id)) {
      newChecked.delete(id);
      setChecked(newChecked);
      setCelebration(null);
      return;
    }

    // Check
    newChecked.add(id);
    setChecked(newChecked);
    setLoadingItem(id);

    try {
      const result = await celebrate({
        action: item.label,
        category: item.category,
        totalChecked: newChecked.size,
      });
      setCelebration(result.message);

      // Extra haptic for milestones
      if (result.source === 'milestone') {
        haptic.heavy();
      }
    } catch {
      setCelebration(
        "You did something wonderful for yourself! We are so proud of you!"
      );
    } finally {
      setLoadingItem(null);
    }
  }, [checked]);

  const checkedCount = checked.size;
  const totalCount = SELF_CARE_ITEMS.length;

  const getFooterMessage = () => {
    if (checkedCount === 0) {
      return "Start with just one. You deserve to feel cared for today.";
    }
    if (checkedCount === totalCount) {
      return "You did it all! You are absolutely incredible! So proud of you!";
    }
    return "Every checkbox is a victory. You matter so much.";
  };

  return (
    <LinearGradient
      colors={[colors.primary[50], '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Self-Care Today</Text>
            <Text style={styles.subtitle}>
              You deserve to feel good. Every small act of self-care is a gift you give yourself.
            </Text>
          </View>

          {/* Progress Badge */}
          <View style={styles.progressContainer}>
            <ProgressBadge current={checkedCount} total={totalCount} />
          </View>

          {/* Checklist */}
          <Animated.View
            layout={Layout.springify()}
            style={styles.checklistContainer}
          >
            {SELF_CARE_ITEMS.map((item) => (
              <ChecklistItem
                key={item.id}
                id={item.id}
                emoji={item.emoji}
                label={item.label}
                isChecked={checked.has(item.id)}
                isLoading={loadingItem !== null && loadingItem !== item.id}
                onPress={() => handleCheck(item.id)}
              />
            ))}
          </Animated.View>

          {/* Loading State */}
          {loadingItem && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.loadingContainer}
            >
              <ActivityIndicator color={colors.primary[500]} />
              <Text style={styles.loadingText}>
                Celebrating your self-care...
              </Text>
            </Animated.View>
          )}

          {/* Celebration Message */}
          {celebration && !loadingItem && (
            <CelebrationCard message={celebration} />
          )}

          {/* Footer */}
          <Text style={styles.footer}>{getFooterMessage()}</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.size.base,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    color: colors.neutral[600],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checklistContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.primary[600],
  },
  footer: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
