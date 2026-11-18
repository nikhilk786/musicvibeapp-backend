import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { THEME } from './constants/theme';
import {
  MediaMetadata,
  DownloadProgress,
  DownloadStatus,
  DownloadResult,
  PlaylistMetadata,
  PlaylistTrack,
} from './types/audio';
import { fetchMediaInfo, fetchPlaylistInfo } from './services/apiService';
import { downloadAndSaveAudio, startNativeBrowserDownload } from './services/downloadService';
import { getAudioDownloadUrl } from './services/apiService';
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from './services/deviceUtils';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { UrlInputCard } from './components/UrlInputCard';
import { PreviewCard } from './components/PreviewCard';
import { PlaylistCard } from './components/PlaylistCard';
import { DownloadProgressBar } from './components/DownloadProgressBar';
import { SuccessModal } from './components/SuccessModal';
import { ErrorBanner } from './components/ErrorBanner';

export default function App() {
  const [inputMode, setInputMode] = useState<'single' | 'playlist'>('single');
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistMetadata | null>(null);
  const [isDownloadingPlaylist, setIsDownloadingPlaylist] = useState<boolean>(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(0);
  const [currentTrackProgress, setCurrentTrackProgress] = useState<number>(0);
  const [playlistCompletedCount, setPlaylistCompletedCount] = useState<number>(0);

  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  const [progress, setProgress] = useState<DownloadProgress>({
    totalBytes: 0,
    bytesDownloaded: 0,
    percentage: 0,
    downloadedMb: '0.0 MB',
    totalMb: '0.0 MB',
  });

  // App is 100% serverless and always online
  useEffect(() => {
    setIsBackendOnline(true);
  }, []);

  // 1. Fetch metadata step (Single song or Playlist)
  const handleFetchInfo = async () => {
    if (!url.trim()) return;

    triggerLightHaptic();
    setErrorMessage(null);
    setStatus('fetching_info');
    setMetadata(null);
    setPlaylist(null);
    setDownloadResult(null);

    try {
      if (inputMode === 'playlist') {
        const plData = await fetchPlaylistInfo(url);
        setPlaylist(plData);
        setPlaylistCompletedCount(0);
        setStatus('ready');
        triggerSuccessHaptic();
      } else {
        const data = await fetchMediaInfo(url);
        setMetadata(data);
        setStatus('ready');
        triggerSuccessHaptic();
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(
        err.message ||
          'Failed to extract information. Check the link and ensure it is public.'
      );
      setStatus('error');
      triggerErrorHaptic();
    }
  };

  // 2. Start 320 kbps streaming download step (Single Track)
  const handleStartDownload = async () => {
    if (!metadata) return;

    triggerSuccessHaptic();
    const downloadUrl = getAudioDownloadUrl(metadata.url, metadata.title);

    // Launch Android native DownloadManager immediately:
    // Shows in Notification bar and saves directly to /Downloads folder with 0 socket timeout!
    await startNativeBrowserDownload(downloadUrl);

    setDownloadResult({
      localUri: downloadUrl,
      filename: `${(metadata.title || 'Audio').replace(/[^a-zA-Z0-9\s-_]/g, '')}.mp3`,
      fileSizeBytes: 8900000,
    });
    setStatus('completed');
  };

  // 2b. Start Sequential Native Downloads (Playlist - Selected Tracks into /Downloads folder with Notification)
  const handleDownloadSelectedPlaylist = async (selectedIds: string[]) => {
    if (!playlist || playlist.tracks.length === 0 || isDownloadingPlaylist) return;

    const tracksToDownload = playlist.tracks.filter((t) => selectedIds.includes(t.id));
    if (tracksToDownload.length === 0) return;

    setIsDownloadingPlaylist(true);
    setPlaylistCompletedCount(0);
    setErrorMessage(null);

    const updatedTracks = [...playlist.tracks];

    for (let i = 0; i < tracksToDownload.length; i++) {
      setCurrentPlaylistIndex(i);
      setCurrentTrackProgress(50);

      const targetTrack = tracksToDownload[i];
      const trackIndexInFull = updatedTracks.findIndex((t) => t.id === targetTrack.id);
      if (trackIndexInFull !== -1) {
        updatedTracks[trackIndexInFull].status = 'downloading';
        setPlaylist((prev) => (prev ? { ...prev, tracks: [...updatedTracks] } : null));
      }

      try {
        const downloadUrl = getAudioDownloadUrl(targetTrack.url, targetTrack.title);
        await startNativeBrowserDownload(downloadUrl);
        setCurrentTrackProgress(100);

        if (trackIndexInFull !== -1) {
          updatedTracks[trackIndexInFull].status = 'completed';
        }
        setPlaylistCompletedCount((prev) => prev + 1);
      } catch (err: any) {
        console.error(`Failed to trigger download for ${targetTrack.title}:`, err);
        if (trackIndexInFull !== -1) {
          updatedTracks[trackIndexInFull].status = 'error';
        }
      }

      setPlaylist((prev) => (prev ? { ...prev, tracks: [...updatedTracks] } : null));

      // Small delay between tracks so Android Download Manager queues each in notification bar cleanly
      if (i < tracksToDownload.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setIsDownloadingPlaylist(false);
    triggerSuccessHaptic();
  };

  // 2c. Download a single track directly from playlist preview with Native Notification
  const handleDownloadSingleTrackFromPlaylist = async (track: PlaylistTrack) => {
    triggerLightHaptic();
    const downloadUrl = getAudioDownloadUrl(track.url, track.title);
    await startNativeBrowserDownload(downloadUrl);
    triggerSuccessHaptic();
  };

  // 3. Reset to prepare another track or playlist
  const handleReset = () => {
    setUrl('');
    setStatus('idle');
    setMetadata(null);
    setPlaylist(null);
    setIsDownloadingPlaylist(false);
    setPlaylistCompletedCount(0);
    setDownloadResult(null);
    setErrorMessage(null);
    setProgress({
      totalBytes: 0,
      bytesDownloaded: 0,
      percentage: 0,
      downloadedMb: '0.0 MB',
      totalMb: '0.0 MB',
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Top Sticky Header */}
          <Header isOnline={isBackendOnline} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <HeroSection />

            {/* URL Input Form */}
            <UrlInputCard
              url={url}
              onUrlChange={(newUrl) => {
                setUrl(newUrl);
                if (errorMessage) setErrorMessage(null);
              }}
              onSubmit={handleFetchInfo}
              isLoading={status === 'fetching_info'}
              mode={inputMode}
              onModeChange={(newMode) => {
                setInputMode(newMode);
                setUrl('');
                setMetadata(null);
                setPlaylist(null);
                setStatus('idle');
                setErrorMessage(null);
              }}
            />

            {/* Error Message Banner */}
            {status === 'error' && errorMessage && (
              <ErrorBanner
                message={errorMessage}
                onRetry={handleFetchInfo}
              />
            )}

            {/* Single Track Preview Card (Shows extracted metadata + locked 320 kbps badge) */}
            {metadata && (status === 'ready' || status === 'downloading') && (
              <PreviewCard
                metadata={metadata}
                onDownloadPress={handleStartDownload}
                isDownloading={status === 'downloading'}
              />
            )}

            {/* Playlist Preview Card & Download Queue */}
            {playlist && (status === 'ready' || isDownloadingPlaylist) && (
              <PlaylistCard
                playlist={playlist}
                onDownloadSelected={handleDownloadSelectedPlaylist}
                onDownloadSingleTrack={handleDownloadSingleTrackFromPlaylist}
                isDownloadingAll={isDownloadingPlaylist}
                currentDownloadIndex={currentPlaylistIndex}
                currentTrackProgress={currentTrackProgress}
                completedCount={playlistCompletedCount}
              />
            )}

            {/* Live Progress Bar during active stream */}
            {status === 'downloading' && (
              <DownloadProgressBar
                progress={progress}
                statusMessage={statusMessage}
              />
            )}

            {/* Success Modal / Banner on complete */}
            {status === 'completed' && downloadResult && metadata && (
              <SuccessModal
                metadata={metadata}
                result={downloadResult}
                onReset={handleReset}
              />
            )}

            {/* Aesthetic Bottom Watermark / Credit */}
            <View style={styles.creditContainer}>
              <Text style={styles.creditText}>
                Developed with <Text style={styles.heartIcon}>♥</Text> by <Text style={styles.creditName}>NK</Text>
              </Text>
              <Text style={styles.versionText}>Sher Music • Ultra HD 320 kbps</Text>
            </View>

            <View style={styles.footerSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  creditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 8,
    gap: 4,
  },
  creditText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.colors.textSubtle,
    letterSpacing: 0.2,
  },
  heartIcon: {
    color: '#f43f5e',
    fontSize: 11,
  },
  creditName: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: 0.8,
  },
  footerSpacing: {
    height: 40,
  },
});
