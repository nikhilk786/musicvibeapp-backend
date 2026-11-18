import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export const HeroSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Download <Text style={styles.headingAccent}>Audio</Text>
      </Text>
      <Text style={styles.subtitle}>
        Paste any track link to save 320 kbps MP3 directly to your device.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.text,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  headingAccent: {
    color: THEME.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    lineHeight: 20,
    marginTop: 6,
  },
});
