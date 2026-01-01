/**
 * Haptic Feedback - Native touch sensations
 *
 * Makes interactions feel premium and real.
 */

import * as Haptics from 'expo-haptics';

export const haptic = {
  // Light tap - for selections
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Medium tap - for confirmations
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  // Heavy tap - for important actions
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  // Success - for completions
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  // Warning - for alerts
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Error - for failures
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Selection changed
  selection: () => Haptics.selectionAsync(),
};
