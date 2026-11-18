import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { THEME } from '../constants/theme';

interface HeaderProps {
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isOnline = true }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.iconBox}>
          <Image
            source={require('../assets/image.png')}
            style={styles.brandImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Music Downloader</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, !isOnline && styles.statusDotOffline]} />
        <Text style={styles.statusText}>{isOnline ? 'Ready' : 'Offline'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(38, 44, 38, 0.6)',
    backgroundColor: THEME.colors.background,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.text,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
  },
  statusDotOffline: {
    backgroundColor: THEME.colors.textSubtle,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.colors.textMuted,
  },
});
