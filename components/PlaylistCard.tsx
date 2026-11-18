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
  ListMusic,
  Download,
  CheckCircle2,
  Clock,
  Music,
  FolderCheck,
} from 'lucide-react-native';
import { PlaylistMetadata, PlaylistTrack } from '../types/audio';
import { THEME } from '../constants/theme';
import { triggerLightHaptic, triggerMediumHaptic } from '../services/deviceUtils';

interface PlaylistCardProps {
  playlist: PlaylistMetadata;
  onDownloadAll: () => void;
  isDownloadingAll: boolean;
  currentDownloadIndex: number;
  currentTrackProgress: number;
  completedCount: number;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onDownloadAll,
  isDownloadingAll,
  currentDownloadIndex,
  currentTrackProgress,
  completedCount,
}) => {
  const isAllCompleted = completedCount === playlist.tracks.length && playlist.tracks.length > 0;

  const handleStartDownload = () => {
    triggerMediumHaptic();
    onDownloadAll();
  };

  return (
    <View style={styles.card}>
      {/* Playlist Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <ListMusic size={18} color={THEME.colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.playlistTitle} numberOfLines={1}>
            {playlist.title}
          </Text>
          <Text style={styles.playlistSubtitle}>
            {playlist.trackCount} tracks extracted • 320 kbps MP3
          </Text>
        </View>
      </View>

      {/* Live Download Status & Progress (if active) */}
      {isDownloadingAll && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel} numberOfLines={1}>
              Downloading {currentDownloadIndex + 1}/{playlist.tracks.length}:{' '}
              {playlist.tracks[currentDownloadIndex]?.title}
            </Text>
            <Text style={styles.progressPercent}>{currentTrackProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={THEME.gradients.progressBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${currentTrackProgress}%` }]}
            />
          </View>
          <Text style={styles.batchCounter}>
            {completedCount} of {playlist.tracks.length} tracks saved to device
          </Text>
        </View>
      )}

      {/* Main Download Button or All Completed Banner */}
      {isAllCompleted ? (
        <View style={styles.allCompletedBox}>
          <CheckCircle2 size={18} color={THEME.colors.primary} strokeWidth={2.4} />
          <Text style={styles.allCompletedText}>
            All {playlist.tracks.length} tracks downloaded & saved to device!
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleStartDownload}
          disabled={isDownloadingAll}
          activeOpacity={0.85}
          style={[styles.downloadBtnWrapper, isDownloadingAll && styles.disabledWrapper]}
        >
          <LinearGradient
            colors={THEME.gradients.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientDownloadBtn}
          >
            {isDownloadingAll ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#0c0e0c" />
                <Text style={styles.downloadBtnText}>
                  Downloading Track {currentDownloadIndex + 1} of {playlist.tracks.length}...
                </Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Download size={16} color="#0c0e0c" strokeWidth={2.4} />
                <Text style={styles.downloadBtnText}>
                  Download All ({playlist.tracks.length} Tracks)
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Extracted Tracks List Preview */}
      <View style={styles.trackListContainer}>
        <Text style={styles.listHeading}>EXTRACTED SONGS</Text>
        {playlist.tracks.map((track, index) => {
          const isCurrent = isDownloadingAll && currentDownloadIndex === index;
          const isDone = track.status === 'completed';

          return (
            <View
              key={track.id || index}
              style={[
                styles.trackRow,
                isCurrent && styles.trackRowActive,
                isDone && styles.trackRowDone,
              ]}
            >
              {/* Index Number */}
              <Text style={[styles.trackIndex, isCurrent && styles.trackIndexActive]}>
                {index + 1}
              </Text>

              {/* Artwork Thumbnail */}
              <View style={styles.trackThumb}>
                {track.thumbnail ? (
                  <Image source={{ uri: track.thumbnail }} style={styles.thumbImage} resizeMode="cover" />
                ) : (
                  <View style={styles.fallbackThumb}>
                    <Music size={12} color={THEME.colors.textSubtle} />
                  </View>
                )}
              </View>

              {/* Title & Artist */}
              <View style={styles.trackDetails}>
                <Text
                  style={[
                    styles.trackTitle,
                    isCurrent && styles.trackTitleActive,
                    isDone && styles.trackTitleDone,
                  ]}
                  numberOfLines={1}
                >
                  {track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist} • {track.durationFormatted}
                </Text>
              </View>

              {/* Status Indicator */}
              <View style={styles.statusCol}>
                {isDone ? (
                  <CheckCircle2 size={16} color={THEME.colors.primary} />
                ) : isCurrent ? (
                  <View style={styles.currentIndicator}>
                    <ActivityIndicator size="small" color={THEME.colors.primary} />
                  </View>
                ) : (
                  <Clock size={14} color={THEME.colors.textSubtle} />
                )}
              </View>
            </View>
          );
        })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.text,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  playlistSubtitle: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.text,
    flex: 1,
    marginRight: 8,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: THEME.colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  batchCounter: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 6,
  },
  downloadBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledWrapper: {
    opacity: 0.8,
  },
  gradientDownloadBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtnText: {
    color: '#0c0e0c',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  allCompletedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 16,
  },
  allCompletedText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  trackListContainer: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
  listHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSubtle,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    gap: 10,
  },
  trackRowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  trackRowDone: {
    opacity: 0.85,
  },
  trackIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSubtle,
    width: 20,
    textAlign: 'center',
  },
  trackIndexActive: {
    color: THEME.colors.primary,
  },
  trackThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: THEME.colors.background,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  fallbackThumb: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  trackTitleActive: {
    color: THEME.colors.primary,
  },
  trackTitleDone: {
    color: THEME.colors.textMuted,
  },
  trackArtist: {
    fontSize: 11,
    color: THEME.colors.textSubtle,
  },
  statusCol: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIndicator: {
    transform: [{ scale: 0.8 }],
  },
});