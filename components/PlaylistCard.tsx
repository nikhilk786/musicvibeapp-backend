import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ListMusic,
  Download,
  CheckCircle2,
  Clock,
  Music,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { PlaylistMetadata, PlaylistTrack } from '../types/audio';
import { THEME } from '../constants/theme';
import { triggerLightHaptic, triggerMediumHaptic } from '../services/deviceUtils';

interface PlaylistCardProps {
  playlist: PlaylistMetadata;
  onDownloadSelected: (selectedIds: string[]) => void;
  onDownloadSingleTrack?: (track: PlaylistTrack) => void;
  isDownloadingAll: boolean;
  currentDownloadIndex: number;
  currentTrackProgress: number;
  completedCount: number;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onDownloadSelected,
  onDownloadSingleTrack,
  isDownloadingAll,
  currentDownloadIndex,
  currentTrackProgress,
  completedCount,
}) => {
  // Track IDs selected for download
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // By default, select first 10 tracks (or all if <= 10) so user doesn't wait forever for 50+ songs
    const initialSet = new Set<string>();
    const defaultCount = Math.min(10, playlist.tracks.length);
    for (let i = 0; i < defaultCount; i++) {
      if (playlist.tracks[i]?.id) {
        initialSet.add(playlist.tracks[i].id);
      }
    }
    return initialSet;
  });

  // Keep selectedIds updated when playlist changes
  useEffect(() => {
    const initialSet = new Set<string>();
    const defaultCount = Math.min(10, playlist.tracks.length);
    for (let i = 0; i < defaultCount; i++) {
      if (playlist.tracks[i]?.id) {
        initialSet.add(playlist.tracks[i].id);
      }
    }
    setSelectedIds(initialSet);
  }, [playlist.id, playlist.tracks.length]);

  const toggleTrack = (id: string) => {
    if (isDownloadingAll) return;
    triggerLightHaptic();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectPreset = (count: number | 'all' | 'none') => {
    if (isDownloadingAll) return;
    triggerLightHaptic();
    if (count === 'all') {
      const allIds = new Set(playlist.tracks.map((t) => t.id));
      setSelectedIds(allIds);
    } else if (count === 'none') {
      setSelectedIds(new Set());
    } else {
      const limit = Math.min(count, playlist.tracks.length);
      const newIds = new Set<string>();
      for (let i = 0; i < limit; i++) {
        if (playlist.tracks[i]?.id) {
          newIds.add(playlist.tracks[i].id);
        }
      }
      setSelectedIds(newIds);
    }
  };

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === playlist.tracks.length && playlist.tracks.length > 0;
  const isNoneSelected = selectedCount === 0;

  const handleStartDownload = () => {
    if (selectedCount === 0 || isDownloadingAll) return;
    triggerMediumHaptic();
    onDownloadSelected(Array.from(selectedIds));
  };

  const isAllCompleted = completedCount === selectedCount && selectedCount > 0;

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
            {playlist.trackCount} tracks found • 320 kbps Ultra HD
          </Text>
        </View>
      </View>

      {/* Quick Selection Presets Bar */}
      {!isDownloadingAll && (
        <View style={styles.selectionBar}>
          <View style={styles.selectionCountBox}>
            <Text style={styles.selectionCountText}>
              Selected: <Text style={styles.highlightNumber}>{selectedCount}</Text> of{' '}
              {playlist.tracks.length}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsList}
          >
            <TouchableOpacity
              onPress={() => selectPreset(5)}
              style={[styles.presetChip, selectedCount === 5 && styles.presetChipActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.presetChipText, selectedCount === 5 && styles.presetChipTextActive]}
              >
                First 5
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectPreset(10)}
              style={[
                styles.presetChip,
                selectedCount === Math.min(10, playlist.tracks.length) &&
                  styles.presetChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetChipText,
                  selectedCount === Math.min(10, playlist.tracks.length) &&
                    styles.presetChipTextActive,
                ]}
              >
                First 10
              </Text>
            </TouchableOpacity>

            {playlist.tracks.length > 10 && (
              <TouchableOpacity
                onPress={() => selectPreset(20)}
                style={[
                  styles.presetChip,
                  selectedCount === Math.min(20, playlist.tracks.length) &&
                    styles.presetChipActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    selectedCount === Math.min(20, playlist.tracks.length) &&
                      styles.presetChipTextActive,
                  ]}
                >
                  First 20
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => selectPreset('all')}
              style={[styles.presetChip, isAllSelected && styles.presetChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, isAllSelected && styles.presetChipTextActive]}>
                All ({playlist.tracks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectPreset('none')}
              style={[styles.presetChip, isNoneSelected && styles.presetChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, isNoneSelected && styles.presetChipTextActive]}>
                Clear
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Live Download Status & Progress (if active) */}
      {isDownloadingAll && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel} numberOfLines={1}>
              Downloading {currentDownloadIndex + 1}/{selectedCount}:{' '}
              {playlist.tracks.find((t) => t.status === 'downloading')?.title || 'Processing...'}
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
            {completedCount} of {selectedCount} selected songs saved to device
          </Text>
        </View>
      )}

      {/* Main Download Button or All Completed Banner */}
      {isAllCompleted ? (
        <View style={styles.allCompletedBox}>
          <CheckCircle2 size={18} color={THEME.colors.primary} strokeWidth={2.4} />
          <Text style={styles.allCompletedText}>
            All {selectedCount} selected tracks saved to your device!
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleStartDownload}
          disabled={isDownloadingAll || selectedCount === 0}
          activeOpacity={0.85}
          style={[
            styles.downloadBtnWrapper,
            (isDownloadingAll || selectedCount === 0) && styles.disabledWrapper,
          ]}
        >
          <LinearGradient
            colors={
              selectedCount === 0
                ? ['#262d26', '#1a1f1a']
                : THEME.gradients.primaryButton
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientDownloadBtn}
          >
            {isDownloadingAll ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#0c0e0c" />
                <Text style={styles.downloadBtnText}>
                  Downloading {currentDownloadIndex + 1} of {selectedCount}...
                </Text>
              </View>
            ) : selectedCount === 0 ? (
              <View style={styles.btnRow}>
                <Text style={[styles.downloadBtnText, { color: THEME.colors.textSubtle }]}>
                  Select Songs to Download
                </Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Download size={16} color="#0c0e0c" strokeWidth={2.4} />
                <Text style={styles.downloadBtnText}>
                  Download Selected ({selectedCount} Tracks)
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Extracted Tracks List Preview with Checkboxes */}
      <View style={styles.trackListContainer}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeading}>SONGS ({playlist.tracks.length})</Text>
          <Text style={styles.listSubHint}>Tap song to select / unselect</Text>
        </View>

        {playlist.tracks.map((track, index) => {
          const isSelected = selectedIds.has(track.id);
          const isCurrent = track.status === 'downloading';
          const isDone = track.status === 'completed';

          return (
            <TouchableOpacity
              key={track.id || index}
              onPress={() => toggleTrack(track.id)}
              disabled={isDownloadingAll}
              activeOpacity={0.75}
              style={[
                styles.trackRow,
                isSelected && styles.trackRowSelected,
                isCurrent && styles.trackRowActive,
                isDone && styles.trackRowDone,
              ]}
            >
              {/* Checkbox */}
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                  isDone && styles.checkboxDone,
                ]}
              >
                {isDone ? (
                  <Check size={12} color="#0c0e0c" strokeWidth={3} />
                ) : isSelected ? (
                  <Check size={12} color="#0c0e0c" strokeWidth={3} />
                ) : null}
              </View>

              {/* Index Number */}
              <Text style={[styles.trackIndex, isSelected && styles.trackIndexSelected]}>
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
                    isSelected && styles.trackTitleSelected,
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

              {/* Right Side Status / Quick Download */}
              <View style={styles.statusCol}>
                {isDone ? (
                  <CheckCircle2 size={16} color={THEME.colors.primary} />
                ) : isCurrent ? (
                  <View style={styles.currentIndicator}>
                    <ActivityIndicator size="small" color={THEME.colors.primary} />
                  </View>
                ) : track.status === 'error' ? (
                  <AlertCircle size={15} color="#ef4444" />
                ) : onDownloadSingleTrack && !isDownloadingAll ? (
                  <TouchableOpacity
                    onPress={() => {
                      triggerMediumHaptic();
                      onDownloadSingleTrack(track);
                    }}
                    style={styles.singleDownloadBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Download size={13} color={THEME.colors.primary} strokeWidth={2.2} />
                  </TouchableOpacity>
                ) : (
                  <Clock size={13} color={THEME.colors.textSubtle} />
                )}
              </View>
            </TouchableOpacity>
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
    marginBottom: 12,
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
  selectionBar: {
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
  },
  selectionCountBox: {
    marginBottom: 8,
  },
  selectionCountText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  highlightNumber: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  presetsList: {
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  presetChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: THEME.colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSubtle,
  },
  presetChipTextActive: {
    color: THEME.colors.primary,
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
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSubtle,
    letterSpacing: 1.2,
  },
  listSubHint: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  trackRowSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  trackRowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  trackRowDone: {
    opacity: 0.85,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: THEME.colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  checkboxDone: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  trackIndex: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSubtle,
    width: 18,
    textAlign: 'center',
  },
  trackIndexSelected: {
    color: THEME.colors.text,
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
    color: THEME.colors.textSubtle,
    marginBottom: 2,
  },
  trackTitleSelected: {
    color: THEME.colors.text,
  },
  trackTitleActive: {
    color: THEME.colors.primary,
  },
  trackTitleDone: {
    color: THEME.colors.textMuted,
  },
  trackArtist: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  statusCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleDownloadBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIndicator: {
    transform: [{ scale: 0.8 }],
  },
});
