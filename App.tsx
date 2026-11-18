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

    setStatus('downloading');
    setStatusMessage('Initiating 320 kbps stream...');
    setErrorMessage(null);

    setProgress({
      totalBytes: 0,
      bytesDownloaded: 0,
      percentage: 0,
      downloadedMb: '0.0 MB',
      totalMb: metadata.estimatedSizeMb || '8.0 MB',
    });

    try {
      const result = await downloadAndSaveAudio({
        metadata,
        onProgress: (p) => {
          setProgress(p);
        },
        onStatusChange: (msg) => {
          setStatusMessage(msg);
        },
      });

      setDownloadResult(result);
      setStatus('completed');
      triggerSuccessHaptic();
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorMessage(
        err.message ||
          'Download failed. Please check network connectivity and storage permissions.'
      );
      setStatus('error');
      triggerErrorHaptic();
    }
  };

  // 2b. Start Sequential 320 kbps Download Queue (Playlist - One by One)
  const handleDownloadAllPlaylist = async () => {
    if (!playlist || playlist.tracks.length === 0 || isDownloadingPlaylist) return;

    setIsDownloadingPlaylist(true);
    setPlaylistCompletedCount(0);
    setErrorMessage(null);

    const updatedTracks = [...playlist.tracks];

    for (let i = 0; i < updatedTracks.length; i++) {
      setCurrentPlaylistIndex(i);
      setCurrentTrackProgress(0);

      const track = updatedTracks[i];
      track.status = 'downloading';
      setPlaylist({ ...playlist, tracks: [...updatedTracks] });

      const trackMeta: MediaMetadata = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        durationFormatted: track.durationFormatted,
        thumbnail: track.thumbnail,
        source: 'YouTube Playlist',
        bitrate: '320 kbps',
        qualityBadge: 'Ultra HD 320 kbps',
        estimatedSizeMb: `${((track.duration * 40) / 1024).toFixed(1)} MB`,
        url: track.url,
      };

      try {
        await downloadAndSaveAudio({
          metadata: trackMeta,
          onProgress: (p) => {
            setCurrentTrackProgress(p.percentage);
          },
          onStatusChange: () => {},
        });

        track.status = 'completed';
        setPlaylistCompletedCount((prev) => prev + 1);
      } catch (err) {
        console.warn(`Failed to download track ${track.title}:`, err);
        track.status = 'error';
      }

      setPlaylist({ ...playlist, tracks: [...updatedTracks] });
    }

    setIsDownloadingPlaylist(false);
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
                onDownloadAll={handleDownloadAllPlaylist}
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
