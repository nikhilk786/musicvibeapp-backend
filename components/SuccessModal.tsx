import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  FolderCheck,
  RotateCcw,
  Music,
  Share2,
  FolderDown,
  Download,
  Check,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { DownloadResult, MediaMetadata } from '../types/audio';
import {
  triggerLightHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from '../services/deviceUtils';
import {
  shareAudioFile,
  saveToNativeAndroidFolder,
  startNativeBrowserDownload,
} from '../services/downloadService';
import { getAudioDownloadUrl } from '../services/apiService';

interface SuccessModalProps {
  metadata: MediaMetadata;
  result: DownloadResult;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  metadata,
  result,
  onReset,
}) => {
  const [isSavedToFolder, setIsSavedToFolder] = useState<boolean>(false);

  const handleReset = () => {
    triggerSelectionHaptic();
    onReset();
  };

  const handleShare = () => {
    triggerLightHaptic();
    shareAudioFile(result.localUri);
  };

  const handleSaveToFolder = async () => {
    triggerLightHaptic();
    const success = await saveToNativeAndroidFolder(result.localUri, result.filename);
    if (success) {
      triggerSuccessHaptic();
      setIsSavedToFolder(true);
    }
  };

  const handleNativeBrowserDownload = () => {
    triggerLightHaptic();
    const downloadUrl = getAudioDownloadUrl(metadata.url, metadata.title);
    startNativeBrowserDownload(downloadUrl);
  };

  return (
    <View style={styles.card}>
      {/* Success Icon */}
      <View style={styles.iconCircle}>
        <CheckCircle size={28} color={THEME.colors.primary} strokeWidth={2.4} />
      </View>

      <Text style={styles.title}>Download Complete</Text>
      <Text style={styles.subtitle}>
        320 kbps MP3 is saved to your device.
      </Text>

      {/* File Details Summary Box */}
      <View style={styles.fileSummary}>
        <View style={styles.fileIconBox}>
          <Music size={16} color={THEME.colors.primary} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {result.filename}
          </Text>
          <Text style={styles.metaText}>
            320 kbps • {metadata.estimatedSizeMb || '8.9 MB'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {/* Native Notification & /Downloads folder download (HIGHLIGHTED) */}
        <TouchableOpacity
          onPress={handleNativeBrowserDownload}
          activeOpacity={0.8}
          style={styles.highlightBtnWrapper}
        >
          <LinearGradient
            colors={THEME.gradients.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.highlightGradientBtn}
          >
            <Download size={16} color="#0c0e0c" strokeWidth={2.4} />
            <Text style={styles.highlightBtnText}>
              Save to Downloads Folder
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Play or Share in system media players */}
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.8}
          style={styles.shareButton}
        >
          <Share2 size={16} color={THEME.colors.primary} strokeWidth={2.2} />
          <Text style={styles.shareButtonText}>Play / Share Track</Text>
        </TouchableOpacity>

        {/* Save to Native Music/Downloads Folder (Android SAF) */}
        {Platform.OS === 'android' && (
          <TouchableOpacity
            onPress={handleSaveToFolder}
            activeOpacity={0.8}
            style={[styles.saveFolderButton, isSavedToFolder && styles.saveFolderButtonDone]}
          >
            {isSavedToFolder ? (
              <>
                <Check size={15} color={THEME.colors.primary} strokeWidth={2.4} />
                <Text style={styles.saveFolderButtonTextDone}>Saved to Custom Folder</Text>
              </>
            ) : (
              <>
                <FolderDown size={15} color={THEME.colors.textMuted} strokeWidth={2} />
                <Text style={styles.saveFolderButtonText}>Choose Folder...</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Download Another Track (Secondary) */}
        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.8}
          style={styles.secondaryButton}
        >
          <RotateCcw size={15} color={THEME.colors.textMuted} strokeWidth={2.2} />
          <Text style={styles.secondaryButtonText}>Download Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginHorizontal: 16,
    marginTop: 14,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  fileSummary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
    gap: 10,
  },
  fileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  actionRow: {
    width: '100%',
    gap: 8,
  },
  highlightBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  highlightGradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  highlightBtnText: {
    color: '#0c0e0c',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    width: '100%',
  },
  shareButtonText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    width: '100%',
  },
  saveFolderButtonDone: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  saveFolderButtonText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  saveFolderButtonTextDone: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    width: '100%',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
