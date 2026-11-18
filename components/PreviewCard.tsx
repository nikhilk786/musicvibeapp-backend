import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  Radio,
  Download,
  Music,
  CheckCircle2,
} from 'lucide-react-native';
import { MediaMetadata } from '../types/audio';
import { THEME } from '../constants/theme';
import { triggerMediumHaptic } from '../services/deviceUtils';

interface PreviewCardProps {
  metadata: MediaMetadata;
  onDownloadPress: () => void;
  isDownloading: boolean;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  metadata,
  onDownloadPress,
  isDownloading,
}) => {
  const handlePress = () => {
    triggerMediumHaptic();
    onDownloadPress();
  };

  return (
    <View style={styles.card}>
      {/* Top Media Preview Row */}
      <View style={styles.topRow}>
        {/* Thumbnail or fallback visualizer */}
        <View style={styles.thumbnailContainer}>
          {metadata.thumbnail ? (
            <Image
              source={{ uri: metadata.thumbnail }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackVisualizer}>
              <Music size={26} color={THEME.colors.primary} />
            </View>
          )}
        </View>

        {/* Title, Artist, and Specs */}
        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={2}>
            {metadata.title}
          </Text>

          <Text style={styles.artist} numberOfLines={1}>
            {metadata.artist}
          </Text>

          <Text style={styles.specsText}>
            320 kbps • {metadata.durationFormatted || '3:30'} • {metadata.estimatedSizeMb || '8 MB'}
          </Text>
        </View>
      </View>

      {/* Action Button: Download 320 kbps MP3 */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDownloading}
        activeOpacity={0.85}
        style={[styles.downloadButtonWrapper, isDownloading && styles.disabledWrapper]}
      >
        <LinearGradient
          colors={THEME.gradients.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientDownloadButton}
        >
          {isDownloading ? (
            <View style={styles.downloadingRow}>
              <ActivityIndicator size="small" color="#0c0e0c" />
              <Text style={styles.downloadButtonText}>Streaming 320 kbps...</Text>
            </View>
          ) : (
            <View style={styles.downloadingRow}>
              <Download size={17} color="#0c0e0c" strokeWidth={2.4} />
              <Text style={styles.downloadButtonText}>
                Download 320 kbps MP3
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  fallbackVisualizer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191e19',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    lineHeight: 18,
    marginBottom: 3,
  },
  artist: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginBottom: 4,
  },
  specsText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '500',
  },
  downloadButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledWrapper: {
    opacity: 0.7,
  },
  gradientDownloadButton: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButtonText: {
    color: '#0c0e0c',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
