import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function pasteFromClipboard(): Promise<string> {
  try {
    const text = await Clipboard.getStringAsync();
    return text ? text.trim() : '';
  } catch (err) {
    console.warn('Failed to read clipboard:', err);
    return '';
  }
}

export function triggerLightHaptic() {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }
}

export function triggerMediumHaptic() {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  }
}

export function triggerSuccessHaptic() {
  if (Platform.OS !== 'web') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }
}

export function triggerErrorHaptic() {
  if (Platform.OS !== 'web') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }
}

export function triggerSelectionHaptic() {
  if (Platform.OS !== 'web') {
    try {
      Haptics.selectionAsync();
    } catch {}
  }
}
