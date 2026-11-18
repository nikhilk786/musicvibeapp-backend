import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, Sparkles } from 'lucide-react-native';
import { DownloadProgress } from '../types/audio';
import { THEME } from '../constants/theme';

interface DownloadProgressBarProps {
  progress: DownloadProgress;
  statusMessage?: string;
}

export const DownloadProgressBar: React.FC<DownloadProgressBarProps> = ({
  progress,
  statusMessage = 'Downloading audio...',
}) => {
  const percentage = Math.min(Math.max(progress.percentage || 0, 0), 100);

  return (
    <View style={styles.card}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <Text style={styles.statusMessage} numberOfLines={1}>
          {statusMessage}
        </Text>
        <Text style={styles.percentText}>{percentage}%</Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={THEME.gradients.progressBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${percentage}%` }]}
        />
      </View>

      {/* Bytes counter */}
      <View style={styles.footerRow}>
        <Text style={styles.byteCounter}>
          {progress.downloadedMb} / {progress.totalMb}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginHorizontal: 16,
    marginTop: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.text,
    flex: 1,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginLeft: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: THEME.colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  byteCounter: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textMuted,
  },
});
