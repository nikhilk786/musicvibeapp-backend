import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform, Linking } from 'react-native';
import { MediaMetadata, DownloadProgress, DownloadResult } from '../types/audio';
import { getAudioDownloadUrl } from './apiService';

let activeDownloadResumable: FileSystem.DownloadResumable | null = null;

/**
 * Request storage and media library permissions
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted') {
      return true;
    }

    const requestResult = await MediaLibrary.requestPermissionsAsync();
    return requestResult.status === 'granted';
  } catch (err) {
    console.warn('Error requesting MediaLibrary permissions:', err);
    return false;
  }
}

/**
 * Format bytes to readable MB string
 */
function formatBytesToMb(bytes: number): string {
  if (!bytes || bytes <= 0) return '0.0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Sanitize filename for local storage and MediaStore
 */
export function sanitizeFileName(title: string): string {
  const clean = title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_');
  return `${clean.substring(0, 60) || 'Audio_320kbps'}.mp3`;
}

/**
 * Trigger native Android DownloadManager (appears in notification center, saves to /Download folder)
 */
export async function startNativeBrowserDownload(downloadUrl: string): Promise<boolean> {
  try {
    await Linking.openURL(downloadUrl);
    return true;
  } catch (err) {
    console.warn('Native browser download trigger failed:', err);
    return false;
  }
}

interface DownloadParams {
  metadata: MediaMetadata;
  onProgress: (progress: DownloadProgress) => void;
  onStatusChange?: (statusMessage: string) => void;
}

/**
 * Download 320 kbps MP3 stream and save to device
 */
export async function downloadAndSaveAudio({
  metadata,
  onProgress,
  onStatusChange
}: DownloadParams): Promise<DownloadResult> {
  const filename = sanitizeFileName(metadata.title);
  const downloadUrl = getAudioDownloadUrl(metadata.url, metadata.title);

  // Web fallback: trigger browser download directly
  if (Platform.OS === 'web') {
    onStatusChange?.('Starting download in browser...');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onProgress({
      totalBytes: 8900000,
      bytesDownloaded: 8900000,
      percentage: 100,
      downloadedMb: metadata.estimatedSizeMb || '8.9 MB',
      totalMb: metadata.estimatedSizeMb || '8.9 MB',
    });

    return {
      localUri: downloadUrl,
      filename,
      fileSizeBytes: 8900000,
    };
  }

  // Native Mobile FileSystem download
  const targetUri = `${FileSystem.documentDirectory}${filename}`;
  onStatusChange?.('Connecting to high-speed 320 kbps stream...');

  const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
    const total = downloadProgress.totalBytesExpectedToWrite;
    const written = downloadProgress.totalBytesWritten;
    
    const expectedBytes = total > 0 ? total : 8900000;
    const progressPercent = Math.min(
      Math.max(Math.round((written / expectedBytes) * 100), 1),
      99
    );

    onProgress({
      totalBytes: expectedBytes,
      bytesDownloaded: written,
      percentage: progressPercent,
      downloadedMb: formatBytesToMb(written),
      totalMb: formatBytesToMb(expectedBytes),
    });
  };

  activeDownloadResumable = FileSystem.createDownloadResumable(
    downloadUrl,
    targetUri,
    {},
    callback
  );

  onStatusChange?.('Downloading 320 kbps audio stream...');
  const result = await activeDownloadResumable.downloadAsync();
  activeDownloadResumable = null;

  if (!result || !result.uri) {
    throw new Error('Download failed: No file URI received from storage.');
  }

  const fileInfo = await FileSystem.getInfoAsync(result.uri);
  const fileSize = (fileInfo as any).size || 8900000;

  // Final 100% progress notification
  onProgress({
    totalBytes: fileSize,
    bytesDownloaded: fileSize,
    percentage: 100,
    downloadedMb: formatBytesToMb(fileSize),
    totalMb: formatBytesToMb(fileSize),
  });

  onStatusChange?.('Registering with MediaStore...');

  // Save to Android / iOS Native MediaStore / Music folder
  let assetUri: string | undefined;
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (hasPermission) {
      const asset = await MediaLibrary.createAssetAsync(result.uri);
      assetUri = asset.uri;

      const album = await MediaLibrary.getAlbumAsync('Music Downloader');
      if (album === null) {
        await MediaLibrary.createAlbumAsync('Music Downloader', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      onStatusChange?.('Downloaded & saved to device!');
    }
  } catch (err: any) {
    console.warn('MediaLibrary save note:', err.message);
  }

  return {
    localUri: result.uri,
    assetUri,
    filename,
    fileSizeBytes: fileSize,
  };
}

/**
 * Save directly to native Android Downloads or Music folder using Storage Access Framework
 */
export async function saveToNativeAndroidFolder(localUri: string, filename: string): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const base64Data = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        'audio/mpeg'
      );

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return true;
    }
  } catch (err: any) {
    console.warn('SAF error:', err.message);
  }
  return false;
}

/**
 * Share or play the downloaded MP3 in native audio players
 */
export async function shareAudioFile(fileUri: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'audio/mpeg',
        dialogTitle: 'Play or Save 320 kbps MP3',
        UTI: 'public.mp3',
      });
    }
  } catch (err: any) {
    console.warn('Share error:', err.message);
  }
}

/**
 * Cancel an ongoing download
 */
export async function cancelActiveDownload(): Promise<void> {
  if (activeDownloadResumable) {
    try {
      await activeDownloadResumable.pauseAsync();
      activeDownloadResumable = null;
    } catch (e) {
      console.warn('Error pausing/canceling download:', e);
    }
  }
}
